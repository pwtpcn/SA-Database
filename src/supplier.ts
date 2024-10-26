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
      const supplier = await db.$queryRaw`
      INSERT INTO supplier (supplier_name, tax_number)
      VALUES (
        ${body.supplier_name}, 
        ${body.tax_number}
        )
      RETURNING supplier_name, tax_number
      `;

      console.log("Supplier inserted successfully: ", supplier);
      return { message: "Supplier inserted successfully", supplier };
    } catch (error) {
      console.error("Error insrting supplier: ", error);
      return { error: "Failed to insert supplier" };
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
      const updates = [];

      if (body.supplier_name !== undefined) {
        updates.push(`supplier_name = ${body.supplier_name}`);
      }

      if (body.tax_number !== undefined) {
        updates.push(`tax_number = ${body.tax_number}`);
      }

      const updateFields = updates.join(", ");

      const updatedSupplier: any = await db.$executeRaw`
      UPDATE supplier
      SET ${updateFields}
      WHERE supplier_id = ${body.supplier_id}
      RETURNING supplier_id, supplier_name, tax_number
      `;

      if (updatedSupplier.length > 0) {
        console.log("Supplier updated successfully:", updatedSupplier);
        return updatedSupplier;
      } else {
        console.log("No record found with the given ID to update");
        return { message: "No record found with the given ID" };
      }
    } catch (error) {
      console.error("Error updating supplier: ", error);
      return { error: "Failed to update supplier" };
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
      const existingSupplier: any = await db.$queryRaw`
        SELECT id FROM supplier WHERE supplier_id = ${body.supplier_id};
      `;

      if (existingSupplier.length === 0) {
        console.log("No record found with the given ID to delete");
        return { message: "No record found with the given ID" };
      }

      const deletedSupplier: any = await db.$queryRaw`
      DELETE FROM supplier
      WHERE supplier_id = ${body.supplier_id}
      RETURNING supplier_id
      `;

      console.log("Record deleted successfully: ", deletedSupplier);
      return {
        message: "Record deleted successfully",
        supplier_id: deletedSupplier[0].supplier_id,
      };
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
