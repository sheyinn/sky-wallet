import { extendType, objectType } from "nexus";

export const Account = objectType({
  name: "Account",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.nonNull.list.nonNull.field("transactions", {
      type: "Transaction",
      resolve(parent, args, context) {
        return context.prisma.account
          .findUnique({ where: { id: parent.id } })
          .transactions();
      },
    });
    t.nonNull.dateTime("createdAt");
    t.dateTime("updatedAt");
  },
});

export const AccountsQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("accounts", {
      type: "Account",
      resolve(parent, args, context) {
        return context.prisma.account.findMany();
      },
    });
  },
});
