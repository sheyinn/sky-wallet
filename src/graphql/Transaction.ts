import { Prisma } from "@prisma/client";
import {
  arg,
  enumType,
  extendType,
  inputObjectType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

export const TransactionOrderByInput = inputObjectType({
  name: "TransactionOrderByInput",
  definition(t) {
    t.field("transactionDate", { type: Sort });
    t.field("amount", { type: Sort });
  },
});

export const Sort = enumType({
  name: "Sort",
  members: ["asc", "desc"],
});

export const TransactionList = objectType({
  name: "TransactionList",
  definition(t) {
    t.nonNull.list.nonNull.field("transactions", { type: Transaction });
    t.nonNull.int("count");
    t.id("id");
  },
});

export const Transaction = objectType({
  name: "Transaction",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.field("account", {
      type: "Account",
      resolve(parent, args, context) {
        return context.prisma.transaction
          .findUnique({
            where: { id: parent.id },
          })
          .account();
      },
    });
    t.field("category", {
      type: "Category",
      resolve(parent, args, context) {
        return context.prisma.transaction
          .findUnique({
            where: { id: parent.id },
          })
          .category();
      },
    });
    t.string("reference");
    t.nonNull.float("amount");
    t.nonNull.string("currency");
    t.nonNull.dateTime("date");
    t.nonNull.dateTime("createdAt");
    t.dateTime("updatedAt");
  },
});

export const TransactionsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("transactionList", {
      type: "TransactionList",
      args: {
        startMonth: stringArg(),
        endMonth: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({ type: list(nonNull(TransactionOrderByInput)) }),
      },
      async resolve(parent, args, context) {
        let query: any = {
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
          orderBy: args?.orderBy as
            | Prisma.Enumerable<Prisma.TransactionOrderByWithRelationInput>
            | undefined,
        };

        if (args?.startMonth && args?.endMonth) {
          const where = {
            date: {
              gte: new Date(args.startMonth),
              lte: new Date(args.endMonth),
            },
          };
          query.where = where;
        }

        console.log(query);

        const transactions = await context.prisma.transaction.findMany(query);

        const count = await context.prisma.transaction.count(query);
        const id = `transaction-list:${JSON.stringify(args)}`;

        return { transactions, count, id };
      },
    });
  },
});

export const TransactionDetailsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("transactionDetails", {
      type: "Transaction",
      args: {
        id: nonNull(stringArg()),
      },
      resolve(parent, args, context) {
        const { id } = args;
        return context.prisma.transaction.findFirst({ where: { id } });
      },
    });
  },
});
