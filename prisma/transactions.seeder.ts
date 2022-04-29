import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const transactionSeeder = () => {
  console.log("Starting transaction data import...");

  const csvFilePath = path.resolve(__dirname, "data/transactions.csv");
  const headers = [
    "id",
    "accountId",
    "categoryId",
    "reference",
    "amount",
    "currency",
    "date",
  ];

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
  const options = {
    delimiter: ",",
    fromLine: 2,
    relax_quotes: true,
    columns: headers,
    headers: true,
  };

  const parser = parse(fileContent, options);

  parser.on("readable", async () => {
    let record;
    while ((record = parser.read()) !== null) {
      const account = await prisma.account.findFirst({
        where: { id: record.accountId },
      });

      if (account) {
        let exists = await prisma.transaction.findFirst({
          where: { id: record.id },
        });

        if (!exists) {
          let data: any = {
            id: record.id,
            amount: parseFloat(record.amount),
            date: new Date(record.date),
            reference: record.reference,
            currency: record.currency,
            account: {
              connect: { id: record.accountId },
            },
          };

          if (record.categoryId) {
            const category = await prisma.category.findFirst({
              where: { id: record.categoryId },
            });

            if (category)
              data.category = {
                connect: { id: record.categoryId },
              };
          }

          await prisma.transaction.create({ data });
        }
      }
    }
  });

  parser.on("error", (err) => {
    console.log(err.message);
  });

  parser.on("end", () => {
    console.log(`Successfully imported transactions data.`);
  });
};
