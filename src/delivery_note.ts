import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/delivery" });

// app.get(
//   "/get",
//   async () => {
//     const deliveryList = await db.delivery_note.findMany();
//     return deliveryList;
//   },
//   {
//     detail: {
//       tags: ["DeliveryNote"],
//     },
//   }
// );

// app.post(
//   "/post",
//   async ({ body }) => {
//     const note = await db.delivery_note.create({
//       data: body,
//     });
//     return note;
//   },
//   {
//     body: t.Object({
//       quotation_id: t.Number(),
//       sender_name: t.String(),
//       purchase_date: t.Optional(t.Date()),
//       reciever_sign: t.Optional(t.String()),
//       reciever_name: t.Optional(t.String()),
//     }),
//     detail: {
//       tags: ["DeliveryNote"],
//     },
//   }
// );

// app.put(
//   "/put",
//   async ({ body }) => {
//     const note = await db.delivery_note.update({
//       where: {
//         id: body.id,
//       },
//       data: body,
//     });
//     return note;
//   },
//   {
//     body: t.Object({
//       id: t.Number(),
//       quotation_id: t.Optional(t.Number()),
//       sender_name: t.Optional(t.String()),
//       purchase_date: t.Optional(t.Date()),
//       reciever_sign: t.Optional(t.String()),
//       reciever_name: t.Optional(t.String()),
//       receipt_id: t.Optional(t.Number()),
//       supplier_id: t.Optional(t.Number()),
//     }),
//     detail: {
//       tags: ["DeliveryNote"],
//     },
//   }
// );

// app.delete(
//     "/delete",
//     async ({ body }) => {
//       const note = await db.delivery_note.delete({
//         where: {
//           id: body.id,
//         },
//       });
//       return note;
//     },
//     {
//       body: t.Object({
//         id: t.Number(),
//       }),
//       detail: {
//         tags: ["DeliveryNote"],
//       },
//     }
//   );

// Raw Query //
app.get(
  "/get",
  async () => {
    const deliveryList = await db.$queryRaw`
    SELECT id,
    quotation_id,
    sender_name,
    purchase_date,
    reciever_signature,
    reciever_name,
    receipt_id,
    supplier_id
    FROM delivery_note
    `;
    return deliveryList;
  },
  {
    detail: {
      tags: ["DeliveryNote"],
    },
  }
);

app.post(
  "/post",
  async ({ body }) => {
    try {
      const note = await db.$queryRaw`
      INSERT INTO delivery_note (quotation_id, sender_name, supplier_id)
      VALUES (
        ${body.quotation_id}, 
        ${body.sender_name},
        ${body.supplier_id}
        )
      RETURNING quotation_id, sender_name, supplier_id
      `;

      console.log("Delivery note inserted successfully: ", note);
      return { message: "Delivery note inserted successfully", note };
    } catch (error) {
      console.error("Error insrting delivery note: ", error);
      return { error: "Failed to insert delivery note" };
    }
  },
  {
    body: t.Object({
      quotation_id: t.Number(),
      sender_name: t.String(),
      supplier_id: t.Number(),
    }),
    detail: {
      tags: ["DeliveryNote"],
    },
  }
);

app.put(
  "/put",
  async ({ body }) => {
    try {
      const existingNote: any = await db.$queryRaw`
        SELECT id FROM delivery_note WHERE id = ${body.id};
      `;

      if (existingNote.length === 0) {
        console.log("No record found with the given ID to delete");
        return { message: "No record found with the given ID" };
      }

      const updates = [];

      if (body.quotation_id !== undefined) {
        updates.push(`quotation_id = ${body.quotation_id}`);
      }

      if (body.sender_name !== undefined) {
        updates.push(`sender_name = ${body.sender_name}`);
      }

      if (body.purchase_date !== undefined) {
        updates.push(`purchase_date = ${body.purchase_date}`);
      }

      if (body.reciever_signature !== undefined) {
        updates.push(`reciever_signature = ${body.reciever_signature}`);
      }

      if (body.reciever_name !== undefined) {
        updates.push(`reciever_name = ${body.reciever_name}`);
      }

      if (body.receipt_id !== undefined) {
        updates.push(`receipt_id = ${body.receipt_id}`);
      }

      if (body.supplier_id !== undefined) {
        updates.push(`supplier_id = ${body.supplier_id}`);
      }

      const updateFields = updates.join(", ");

      const updatedNote: any = await db.$executeRaw`
      UPDATE delivery_note
      SET ${updateFields}
      WHERE id = ${body.id}
      RETURNING id, quotation_id, sender_name, purchase_date, reciever_signature, reciever_name, receipt_id, supplier_id
      `;

      console.log("Delivery note updated successfully:", updatedNote);
      return updatedNote;
    } catch (error) {
      console.error("Error updating delivery note: ", error);
      return { error: "Failed to update delivery note" };
    }
  },
  {
    body: t.Object({
      id: t.Number(),
      quotation_id: t.Optional(t.Number()),
      sender_name: t.Optional(t.String()),
      purchase_date: t.Optional(t.Date()),
      reciever_signature: t.Optional(t.String()),
      reciever_name: t.Optional(t.String()),
      receipt_id: t.Optional(t.Number()),
      supplier_id: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["DeliveryNote"],
    },
  }
);

app.delete(
  "/quotation/delete",
  async ({ body }) => {
    try {
      const deletedNote: any = await db.$executeRaw`
        DELETE FROM delivery_note
        WHERE id = ${body.id}
        RETURNING id;
      `;

      console.log("Delivery note deleted successfully: ", deletedNote);
      return {
        message: "Delivery note deleted successfully",
        id: deletedNote,
      };
    } catch (error) {
      console.error("Error deleting delivery note: ", error);
      return { error: "Failed to delete delivery note." };
    }
  },
  {
    body: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ["DeliveryNote"],
    },
  }
);

export default app;
