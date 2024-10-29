import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/reciept" });

// Raw Query //
app.get(
  "/getAllReciept",
  async () => {
    const receiptList = await db.$queryRaw`
    SELECT "id",
    "receipt_date",
    "total_price",
    "supplier_id",
    "confirmation"
    FROM "receipt"`;
    return receiptList;
  },
  {
    detail: {
      tags: ["Receipt"],
    },
  }
);

app.post(
  "/getByID",
  async ({body}) => {
    try {
      const selectedReceipt = await db.$queryRaw`
      SELECT "id", "receipt_date", "total_price", "supplier_id", "confirmation"
      FROM "receipt"
      WHERE "id" = ${body.id}
      LIMIT 1
      `;

      console.log("Get receipt successfully: ", selectedReceipt);
      return selectedReceipt;
    } catch (error) {
      console.error("Error getting receipt by ID: ", error);
      return { error: "Fail to get receipt by ID" };
    }
  },
  {
    body: t.Object({
      id: t.Number(),
    }),

    detail: {
      tags: ["Receipt"],
    },
  }
);

app.post(
  "/post",
  async ({ body }) => {
    try {
      const receipt = await db.$queryRaw`
      INSERT INTO "receipt" ("receipt_date", "total_price", "supplier_id")
      VALUES (
        NOW() AT TIME ZONE 'Asia/Bangkok',
        ${body.total_price},
        ${body.supplier_id}
        )
      RETURNING "id", "receipt_date", "total_price", "supplier_id", "confirmation"
      `;

      console.log("Receipt inserted successfully: ", receipt);
      return { message: "Receipt inserted successfully", receipt };
    } catch (error) {
      console.error("Error insrting receipt: ", error);
      return { error: "Failed to insert receipt" };
    }
  },
  {
    body: t.Object({
      total_price: t.Number(),
      supplier_id: t.Number(),
    }),
    detail: {
      tags: ["Receipt"],
    },
  }
);

app.put(
  "/put",
  async ({ body }) => {
    try {
      interface Receipt {
        id: number, 
        receipt_date: Date, 
        total_price: number, 
        supplier_id: number, 
        confirmation: string
      }

      const receiptList: Receipt[] = await db.$queryRaw`
      SELECT "id", "receipt_date", "total_price", "supplier_id", "confirmation"
      FROM "receipt"
      WHERE "id" = ${body.id}
      LIMIT 1
      `;
      const receipt = receiptList[0];

      const updatedReceipt: any = await db.$queryRaw`
      UPDATE "receipt"
      SET "total_price" = ${body.total_price || receipt.total_price},
      "supplier_id" = ${body.supplier_id || receipt.supplier_id},
      "confirmation" = ${body.confirmation || receipt.confirmation}
      WHERE "id" = ${body.id}
      RETURNING "id", "receipt_date", "total_price", "supplier_id", "confirmation"
      `;

      console.log("Receipt updated successfully:", updatedReceipt);
      return updatedReceipt;
    } catch (error) {
      console.error("Error updating receipt: ", error);
      return { error: "Failed to update receipt" };
    }
  },
  {
    body: t.Object({
      id: t.Number(),
      receipt_date: t.Optional(t.Date()),
      total_price: t.Optional(t.Number()),
      supplier_id: t.Optional(t.Number()),
      confirmation: t.Optional(t.String()),
    }),

    detail: {
      tags: ["Receipt"],
    },
  }
);

app.delete(
  "/delete",
  async ({ body }) => {
    try {
      const deletedReceipt: any = await db.$queryRaw`
      DELETE FROM "receipt"
      WHERE id = ${body.id}
      RETURNING "id"
      `;

      console.log("Receipt deleted successfully: ", deletedReceipt);
      return {
        message: "Receipt deleted successfully",
        id: deletedReceipt,
      };
    } catch (error) {
      console.error("Error deleting receipt: ", error);
      return { error: "Failed to delete receipt" };
    }
  },
  {
    body: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ["Receipt"],
    },
  }
);

export default app;
