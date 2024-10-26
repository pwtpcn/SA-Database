import { Elysia, t } from "elysia";
import db from "./db";
import { QuotationStatus } from "@prisma/client";

const app = new Elysia({ prefix: "/reciept" });

// app.get(
//   "/get",
//   async () => {
//     const quotationList = await db.quotation.findMany();
//     return quotationList;
//   },
//   {
//     detail: {
//       tags: ["Quotation"],
//     },
//   }
// );

// app.post(
//   "/post",
//   async ({ body }) => {
//     const quotation = await db.quotation.create({
//       data: body,
//     });
//     return quotation;
//   },
//   {
//     body: t.Object({
//       unit: t.Integer({
//         minimum: 0,
//       }),
//       price: t.Number({
//         minimum: 0,
//       }),
//       total_price: t.Number({
//         minimum: 0,
//       }),
//       factory_sign: t.String(),
//       // supplier_sign: t.Optional(t.String()),
//       creation_date: t.Date(),
//       supplier_id: t.Number(),
//       status: t.Enum(status),
//     }),
//     detail: {
//       tags: ["Quotation"],
//     },
//   }
// );

// app.put(
//   "/put",
//   async ({ body }) => {
//     const quotation = await db.quotation.update({
//       where: {
//         id: body.id,
//       },
//       data: body,
//     });
//     return quotation;
//   },
//   {
//     body: t.Object({
//       id: t.Number(),
//       unit: t.Optional(
//         t.Integer({
//           minimum: 0,
//         })
//       ),
//       price: t.Optional(
//         t.Number({
//           minimum: 0,
//         })
//       ),
//       total_price: t.Optional(
//         t.Number({
//           minimum: 0,
//         })
//       ),
//       factory_sign: t.Optional(t.String()),
//       supplier_sign: t.Optional(t.String()),
//       creation_date: t.Optional(t.Date()),
//       supplier_id: t.Optional(t.Number()),
//       status: t.Optional(t.Enum(status)),
//     }),
//   }
// );

// app.delete(
//   "/delete",
//   async ({ body }) => {
//     const quotation = await db.quotation.delete({
//       where: {
//         id: body.id,
//       },
//     });
//     return quotation;
//   },
//   {
//     body: t.Object({
//       id: t.Number(),
//     }),
//     detail: {
//       tags: ["Quotation"],
//     },
//   }
// );

// Raw Query //
app.get("/get", async () => {
  const quotationList = await db.$queryRaw`
    SELECT id,
    unit,
    price,
    total_price,
    factory_sign,
    supplier_sign,
    creation_date,
    accept_date,
    status,
    supplier_id
    FROM supplier`;
  return quotationList;
});

app.post(
  "/post",
  async ({ body }) => {
    try {
      const quotation = await db.$queryRaw`
      INSERT INTO quotation (unit, price, total_price, factory_sign, supplier_sign, creation_date, accept_date, status, supplier_id)
      VALUES (
        ${body.unit}, 
        ${body.price},
        ${body.unit} * ${body.price}, -- total_price
        ${body.factory_sign},
        NULL,
        NOW(), -- Current date time
        NULL
        ${body.status},
        ${body.supplier_id}
        )
      RETURNING unit, price, total_price, factory_sign, supplier_sign, creation_date, accept_date, status, supplier_id
      `;

      console.log("Quotation inserted successfully: ", quotation);
      return { message: "Quotation inserted successfully", quotation };
    } catch (error) {
      console.error("Error inserting quotation: ", error);
      return { error: "Failed to insert quotation" };
    }
  },
  {
    body: t.Object({
      unit: t.Integer(),
      price: t.Number(),
      factory_sign: t.String(),
      status: t.Enum(QuotationStatus),
      supplier_id: t.Number(),
    }),
    detail: {
      tags: ["Quotaion"],
    },
  }
);

app.put(
  "/put",
  async ({ body }) => {
    try {
      const existingQuotation: any = await db.$queryRaw`
      SELECT id from quotaion WHERE id = ${body.id};
      `;

      if (existingQuotation.length === 0) {
        console.log("No record found with the given ID to update");
        return { message: "No record found with the given ID" };
      }

      const updates = [];
      let totalPriceUpdate = false;

      if (body.unit !== undefined) {
        updates.push(`unit = ${body.unit}`);
        totalPriceUpdate = true;
      }
      if (body.price !== undefined) {
        updates.push(`price = ${body.price}`);
        totalPriceUpdate = true;
      }
      if (body.factory_sign !== undefined) {
        updates.push(`factory_sign = ${body.factory_sign}`);
      }
      if (body.supplier_sign !== undefined) {
        updates.push(`supplier_sign = ${body.supplier_sign}`);
      }
      if (body.status !== undefined) {
        updates.push(`status = ${body.status}`);
      }
      if (body.accept_date !== undefined) {
        updates.push(`accept_date = ${body.accept_date}`);
      }

      if (updates.length === 0) {
        return { error: "No fields to update" };
      }

      if (totalPriceUpdate) {
        updates.push(`total_price = ${body.unit} * ${body.price}`);
      }

      const updateFields = updates.join(", ");

      const updatedQuotation: any = await db.$executeRaw`
      UPDATE quotaion
      SET ${updateFields}
      WHERE id = ${body.id}
      RETURNING unit, price, total_price, factory_sign, supplier_sign, creation_date, accept_date, status, supplier_id
      `;

      console.log("Quotation updated successfully: ", updatedQuotation);
      return updatedQuotation;
    } catch (error) {
      console.error("Error updateing quotation: ", error);
      return { error: "Failed to update quotation" };
    }
  },
  {
    body: t.Object({
      id: t.Number(),
      unit: t.Optional(t.Integer()),
      price: t.Optional(t.Number()),
      factory_sign: t.Optional(t.String()),
      supplier_sign: t.Optional(t.String()),
      accept_date: t.Optional(t.Date()),
      status: t.Optional(t.Enum(QuotationStatus)),
    }),
    detail: {
      tags: ["Quotaion"],
    },
  }
);

app.delete(
  "/quotation/delete",
  async ({ body }) => {
    try {
      const existingQuotation: any = await db.$queryRaw`
        SELECT id FROM quotation WHERE id = ${body.id};
      `;

      if (existingQuotation.length === 0) {
        console.log("No record found with the given ID to delete");
        return { message: "No record found with the given ID" };
      }

      const deletedQuotation: any = await db.$executeRaw`
        DELETE FROM quotation
        WHERE id = ${body.id}
        RETURNING id;
      `;

      console.log("Quotation deleted successfully:", deletedQuotation);
      return {
        message: "Quotation deleted successfully",
        id: deletedQuotation[0].quotation_id,
      }; // Return the deleted quotation ID
    } catch (error) {
      console.error("Error deleting quotation: ", error);
      return { error: "Failed to delete quotation." };
    }
  },
  {
    body: t.Object({
      id: t.Number(),
    }),
    detail: {
      tags: ["Quotation"],
    },
  }
);

export default app;
