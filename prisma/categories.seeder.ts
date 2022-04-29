import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const categorySeeder = () => {
  console.log("Starting category data import...");

  const csvFilePath = path.resolve(__dirname, "data/categories.csv");
  const headers = ["id", "name", "color"];

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
    let data;
    while ((data = parser.read()) !== null) {
      let exists = await prisma.category.findFirst({ where: { id: data.id } });

      if (!exists) {
        await prisma.category.create({ data });
      }
    }
  });

  parser.on("error", (err) => {
    console.log(err.message);
  });

  parser.on("end", () => {
    console.log(`Successfully imported categories data.`);
  });
};
