import { accountSeeder } from "./accounts.seeder";
import { categorySeeder } from "./categories.seeder";
import { transactionSeeder } from "./transactions.seeder";

export const runSeeder = () => {
  accountSeeder();
  categorySeeder();
  transactionSeeder();
};

runSeeder();
