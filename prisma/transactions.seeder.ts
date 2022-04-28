import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const records: any = [];

export const transactionSeeder = () => {
  console.log("Starting transaction seeder...");

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
        };

        if (record.accountId) {
          data.accountId = {
            connectOrCreate: {
              where: { id: record.accountId },
              data: { id: record.accountId },
            },
          };
        }

        if (record.categoryId) {
          data.categoryId = {
            connectOrCreate: {
              where: { id: record.categoryId },
              data: { id: record.categoryId },
            },
          };
        }

        console.log("Record", record);

        await prisma.transaction.create({ data });

        // const updateParams = {
        //   where: { id: data.id },
        //   data: {
        //     account: { connect: { id: data.id } },
        //     category: { connect: { id: data.id } },
        //   },
        // };
        // await prisma.transaction.update(updateParams);
      }
    }
  });

  parser.on("error", (err) => {
    console.log(err.message);
  });

  parser.on("end", async () => {
    console.log(
      `Successfully seeded transactions table with ${records.length} rows.`
    );
    return Promise.resolve(1);
  });
};
