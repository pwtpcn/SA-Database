import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/supplier" });

// Raw Query //
app.get(
  "/getAllSupplier",
  async () => {
    const supplierList = await db.$queryRaw`
    SELECT "supplier_id",
    "supplier_name",
    "tax_number",
    "user_id"
    FROM "supplier"`;
    return supplierList;
  },
  {
    detail: {
      tags: ["Supplier"],
    },
  }
);

app.post(
  "/getByID",
  async ({ body }) => {
    try {
      const selectedSupplier: any = await db.$queryRaw`
      SELECT "supplier_id", "supplier_name", "tax_number", "user_id"
      FROM "supplier" 
      WHERE "supplier_id" = ${body.supplier_id} 
      LIMIT 1
      `;

      console.log("Get supplier successfully: ", selectedSupplier[0]);
      return selectedSupplier[0];
    } catch (error) {
      console.error("Error getting supplier by ID: ", error);
      return { error: "Fail to get supplier by ID" };
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

app.post(
  "/post",
  async ({ body }) => {
    try {
      const insertSupplier = await db.$queryRaw`
      INSERT INTO "supplier" ("supplier_name", "tax_number", "user_id")
      VALUES (
        ${body.supplier_name}, 
        ${body.tax_number},
        ${body.user_id}::uuid
        )
      RETURNING "supplier_id", "supplier_name", "tax_number", "user_id"
      `;

      console.log("Supplier inserted successfully: ", insertSupplier);
      return { message: "Supplier inserted successfully", insertSupplier };
    } catch (error) {
      console.error("Error insrting supplier: ", error);
      return { error: "Failed to insert supplier" };
    }
  },
  {
    body: t.Object({
      supplier_name: t.String(),
      tax_number: t.Number({
        minimum: 1000000000000,
        maximum: 9999999999999,
      }),
      user_id: t.String(),
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
      interface Supplier {
        supplier_id: number;
        supplier_name: string;
        tax_number: number;
        user_id: string;
      }

      const supplierList: Supplier[] = await db.$queryRaw`
      SELECT "supplier_id", "supplier_name", "tax_number", "user_id"
      FROM "supplier"
      WHERE "supplier_id" = ${body.supplier_id}
      LIMIT 1;
      `;
      const supplier = supplierList[0];

      const updatedSupplier: any = await db.$queryRaw`
      UPDATE "supplier"
      SET "supplier_name" = ${body.supplier_name || supplier.supplier_name}, 
      "tax_number" = ${body.tax_number || supplier.tax_number}, 
      "user_id" = ${body.user_id || supplier.user_id}::uuid
      WHERE "supplier_id" = ${body.supplier_id}
      RETURNING "supplier_id", "supplier_name", "tax_number", "user_id";
      `;

      console.log("Supplier updated successfully:", updatedSupplier);
      return updatedSupplier;
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
      user_id: t.Optional(t.String()),
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
      const deletedSupplier: any = await db.$queryRaw`
      DELETE FROM "supplier"
      WHERE "supplier_id" = ${body.supplier_id}
      RETURNING "supplier_id", "supplier_name"
      `;

      console.log("Supplier deleted successfully: ", deletedSupplier);
      return {
        message: "Supplier deleted successfully",
        supplier_id: deletedSupplier,
      };
    } catch (error) {
      console.error("Error deleting supplier: ", error);
      return { error: "Failed to delete supplier" };
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
