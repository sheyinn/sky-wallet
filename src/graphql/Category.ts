import { extendType, objectType } from "nexus";

export const Category = objectType({
  name: "Category",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.string("color");
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

export const CategoriesQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("categories", {
      type: "Category",
      resolve(parent, args, context) {
        return context.prisma.category.findMany();
      },
    });
  },
});
