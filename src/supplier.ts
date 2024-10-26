import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/supplier" });

// app.get(
//   "/get",
//   async () => {
//     const supplierList = await db.supplier.findMany();
//     return supplierList;
//   },
//   {
//     detail: {
//       tags: ["Supplier"],
//     },
//   }
// );

// app.post(
//   "/post",
//   async ({ body }) => {
//     const supplier = await db.supplier.create({
//       data: body,
//     });
//     return supplier;
//   },
//   {
//     body: t.Object({
//       supplier_name: t.String(),
//       tax_number: t.Number(),
//     }),
//     detail: {
//       tags: ["Supplier"],
//     },
//   }
// );

// app.put(
//   "/put",
//   async ({ body }) => {
//     const supplier = await db.supplier.update({
//       where: {
//         supplier_id: body.supplier_id,
//       },
//       data: body,
//     });
//     return supplier;
//   },
//   {
//     body: t.Object({
//       supplier_id: t.Number(),
//       supplier_name: t.Optional(t.String()),
//       tax_number: t.Optional(t.Number()),
//     }),
//     detail: {
//       tags: ["Supplier"],
//     },
//   }
// );

// app.delete(
//   "/delete",
//   async ({ body }) => {
//     const supplier = await db.supplier.delete({
//       where: {
//         supplier_id: body.supplier_id,
//       },
//     });
//     return supplier;
//   },
//   {
//     body: t.Object({
//       supplier_id: t.Number(),
//     }),
//     detail: {
//       tags: ["Supplier"],
//     },
//   }
// );

// Raw Query //
app.get("/get", async () => {
  const supplierList = await db.$queryRaw`
    SELECT supplier_id,
    supplier_name,
    tax_number
    FROM supplier`;
  return supplierList;
});

app.post(
  "/post",
  async ({ body }) => {
    try {
      const supplierList = await db.$queryRaw`
      INSERT INTO supplier (supplier_name, tax_number)
      VALUES (${body.supplier_name}, ${body.tax_number});
      `;
      console.log("Record inserted successfully: ", supplierList);
      return supplierList;
    } catch (error) {
      console.error("Error insrting record: ", error);
      return { error: "Failed to insert record" };
    }
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
    try {
      const supplierList: any = await db.$queryRaw`
    UPDATE supplier
    SET supplier_name = ${body.supplier_name},
    tax_number = ${body.tax_number}
    WHERE supplier_id = ${body.supplier_id}
    RETURNING supplier_id, supplier_name, tax_number;
    `;
      if (supplierList.length > 0) {
        console.log("Record updated successfully:", supplierList);
        return supplierList;
      } else {
        console.log("No record found with the given ID to update");
        return { message: "No record found with the given ID" };
      }
    } catch (error) {
      console.error("Error updating record: ", error);
      return { error: "Failed to update record" };
    }
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
    try {
      const supplierList = await db.$queryRaw`
      DELETE FROM supplier
      WHERE supplier_id = ${body.supplier_id}
      `;
      console.log("Record deleted successfully");
      return { message: "Record deleted successfully" };
    } catch (error) {
      console.error("Error deleting record: ", error);
      return { error: "Failed to delete record" };
    }
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
