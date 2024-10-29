import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/delivery" });

// Raw Query //
app.get(
  "/getAllDeliveryNote",
  async () => {
    const deliveryList = await db.$queryRaw`
    SELECT "id", "quotation_id", "sender_name", "purchase_date", "reciever_signature", "reciever_name", "receipt_id"
    FROM "delivery_note"
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
  "getNoteByID",
  async ({ body }) => {
    try {
      const selectedNote: any = await db.$queryRaw`
      SELECT "id", "quotation_id", "sender_name", "purchase_date", "reciever_signature", "reciever_name", "receipt_id"
      FROM "delivery_note"
      WHERE "id" = ${body.id}
      LIMIT 1
      `;

      console.log("Get delivery note successfully: ", selectedNote[0]);
      return selectedNote[0];
    } catch (error) {
      console.error("Error getting delivery note by ID: ", error);
      return { error: "Fail to get delivery note by ID" };
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

app.post(
  "/post",
  async ({ body }) => {
    try {
      const note = await db.$queryRaw`
      INSERT INTO "delivery_note" ("quotation_id", "sender_name")
      VALUES (
        ${body.quotation_id}, 
        ${body.sender_name}
        )
      RETURNING "id", "quotation_id", "sender_name", "purchase_date", "reciever_signature", "reciever_name", "receipt_id"
      `;

      console.log("Delivery note inserted successfully: ", note);
      return { message: "Delivery note inserted successfully", note };
    } catch (error) {
      console.error("Error inserting delivery note: ", error);
      return { error: "Failed to insert delivery note" };
    }
  },
  {
    body: t.Object({
      quotation_id: t.Number(),
      sender_name: t.String(),
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
      interface DeliveryNote {
        id: number,
        quotation_id: number,
        sender_name: string,
        purchase_date: Date,
        reciever_signature: string,
        reciever_name: string,
        receipt_id: number,
      }

      const noteList: DeliveryNote[] = await db.$queryRaw`
      SELECT "id", "quotation_id", "sender_name", "purchase_date", "reciever_signature", "reciever_name", "receipt_id"
      FROM "delivery_note"
      WHERE "id" = ${body.id}
      LIMIT 1
      `;
      const delivary_note = noteList[0];

      const updatedNote: any = await db.$queryRaw`
      UPDATE "delivery_note"
      SET "quotation_id" = ${body.quotation_id || delivary_note.quotation_id},
      "sender_name" = ${body.sender_name || delivary_note.sender_name},
      "purchase_date" = ${body.purchase_date || delivary_note.purchase_date},
      "reciever_signature" = ${body.reciever_signature || delivary_note.reciever_signature},
      "reciever_name" = ${body.reciever_name || delivary_note.reciever_name},
      "receipt_id" = ${body.receipt_id || delivary_note.receipt_id}
      WHERE "id" = ${body.id}
      RETURNING "id", "quotation_id", "sender_name", "purchase_date", "reciever_signature", "reciever_name", "receipt_id"
      `;

      console.log("Delivery note updated successfully:", updatedNote[0]);
      return updatedNote[0];
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
    }),
    detail: {
      tags: ["DeliveryNote"],
    },
  }
);

app.delete(
  "/delete",
  async ({ body }) => {
    try {
      const deletedNote: any = await db.$queryRaw`
        DELETE FROM "delivery_note"
        WHERE "id" = ${body.id}
        RETURNING "id";
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
