import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/reciept" });

// app.get(
//   "/get",
//   async () => {
//     const receiptList = await db.receipt.findMany();
//     return receiptList;
//   },
//   {
//     detail: {
//       tags: ["Receipt"],
//     },
//   }
// );

// app.post(
//   "/post",
//   async ({ body }) => {
//     const receipt = await db.receipt.create({
//       data: body,
//     });
//     return receipt;
//   },
//   {
//     body: t.Object({
//       receipt_date: t.Date(),
//       total_price: t.Number({
//         minimum: 0,
//       }),
//     }),
//     detail: {
//       tags: ["Receipt"],
//     },
//   }
// );

// app.put(
//   "/put",
//   async ({ body }) => {
//     const receipt = await db.receipt.update({
//       where: {
//         id: body.id,
//       },
//       data: body,
//     });
//     return receipt;
//   },
//   {
//     body: t.Object({
//       id: t.Number(),
//       receipt_date: t.Optional(t.Date()),
//       total_price: t.Optional(
//         t.Number({
//           minimum: 0,
//         })
//       ),
//       supplier_id: t.Optional(t.Number()),
//       confirmation: t.Optional(t.String()),
//     }),
//     detail: {
//       tags: ["Receipt"],
//     },
//   }
// );

// app.delete(
//   "/delete",
//   async ({ body }) => {
//     const receipt = db.receipt.delete({
//       where: {
//         id: body.id,
//       },
//     });
//     return receipt;
//   },
//   {
//     body: t.Object({
//       id: t.Number(),
//     }),
//     detail: {
//       tags: ["Receipt"],
//     },
//   }
// );

// Raw Query //
app.get(
  "/get",
  async () => {
    const receiptList = await db.$queryRaw`
    SELECT id,
    receipt_date,
    total_price,
    supplier_id,
    confirmation
    FROM receipt`;
    return receiptList;
  },
  {
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
      INSERT INTO receipt (receipt_date, total_price, supplier_id)
      VALUES (
        ${body.receipt_date}, 
        ${body.total_price},
        ${body.supplier_id}
        )
      RETURNING id, receipt_date, total_price, supplier_id, confirmation
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
      receipt_date: t.Date(),
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
      const updates = [];

      if (body.receipt_date !== undefined) {
        updates.push(`receipt_date = ${body.receipt_date}`);
      }

      if (body.total_price !== undefined) {
        updates.push(`total_price = ${body.total_price}`);
      }

      if (body.supplier_id !== undefined) {
        updates.push(`supplier_id = ${body.supplier_id}`);
      }

      if (body.confirmation !== undefined) {
        updates.push(`confirmation = ${body.confirmation}`);
      }

      const updateFields = updates.join(", ");

      const updatedReceipt: any = await db.$executeRaw`
      UPDATE receipt
      SET ${updateFields}
      WHERE id = ${body.id}
      RETURNING id, receipt_date, total_price, supplier_id, confirmation
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
      DELETE FROM receipt
      WHERE id = ${body.id}
      RETURNING id
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
