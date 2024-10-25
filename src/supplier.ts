import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/supplier" });

app.get(
  "/get",
  async () => {
    const supplierList = await db.supplier.findMany();
    return supplierList;
  },
  {
    detail: {
      tags: ["Supplier"],
    },
  }
);

app.post(
  "/post",
  async ({ body }) => {
    const supplier = await db.supplier.create({
      data: body,
    });
    return supplier;
  },
  {
    body: t.Object({
      supplier_name: t.String(),
      tax_number: t.Number(),
    }),
    detail: {
      tags: ["Supplier"],
    },
  }
);

app.put(
  "/put",
  async ({ body }) => {
    const supplier = await db.supplier.update({
      where: {
        supplier_id: body.supplier_id,
      },
      data: body,
    });
    return supplier;
  },
  {
    body: t.Object({
      supplier_id: t.Number(),
      supplier_name: t.Optional(t.String()),
      tax_number: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["Supplier"],
    },
  }
);

app.delete(
  "/delete",
  async ({ body }) => {
    const supplier = await db.supplier.delete({
      where: {
        supplier_id: body.supplier_id,
      },
    });
    return supplier;
  },
  {
    body: t.Object({
      supplier_id: t.Number(),
    }),
    detail: {
      tags: ["Supplier"],
    },
  }
);

export default app;
