import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/delivery" });

app.get(
  "/get",
  async () => {
    const deliveryList = await db.delivery_note.findMany();
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
    const note = await db.delivery_note.create({
      data: body,
    });
    return note;
  },
  {
    body: t.Object({
      quotation_id: t.Number(),
      sender_name: t.String(),
      purchase_date: t.Optional(t.Date()),
      reciever_sign: t.Optional(t.String()),
      reciever_name: t.Optional(t.String()),
    }),
    detail: {
      tags: ["DeliveryNote"],
    },
  }
);

app.put(
  "/put",
  async ({ body }) => {
    const note = await db.delivery_note.update({
      where: {
        id: body.id,
      },
      data: body,
    });
    return note;
  },
  {
    body: t.Object({
      id: t.Number(),
      quotation_id: t.Optional(t.Number()),
      sender_name: t.Optional(t.String()),
      purchase_date: t.Optional(t.Date()),
      reciever_sign: t.Optional(t.String()),
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
    "/delete",
    async ({ body }) => {
      const note = await db.delivery_note.delete({
        where: {
          id: body.id,
        },
      });
      return note;
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
