import { Elysia, t } from "elysia";
import db from "./db";
import { Prisma, quotation, QuotationStatus } from "@prisma/client";

const app = new Elysia({ prefix: "/quotation" });

// Raw Query //
app.get(
  "/getAllQuotation",
  async () => {
    const quotationList = await db.$queryRaw`
    SELECT "id",
    "unit",
    "price",
    "total_price",
    "factory_sign",
    "supplier_sign",
    "creation_date",
    "accept_date",
    "status",
    "supplier_id"
    FROM "quotation"`;
    return quotationList;
  },
  {
    detail: {
      tags: ["Quotation"],
    },
  }
);

app.post(
  "/getByID",
  async ({ body }) => {
    try {
      const selectedQuotation: any = await db.$queryRaw`
    SELECT "id",
    "unit",
    "price",
    "total_price",
    "factory_sign",
    "supplier_sign",
    "creation_date",
    "accept_date",
    "status",
    "supplier_id"
    FROM "quotation"
    WHERE "id" = ${body.id}
    LIMIT 1
    `;

      console.log("Get quotation successfully: ", selectedQuotation[0]);
      return selectedQuotation[0];
    } catch (error) {
      console.error("Error getting quotation by ID: ", error);
      return { error: "Fail to get quotation by ID" };
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

app.post(
  "/post",
  async ({ body }) => {
    try {
      const insertedQuotation = await db.$queryRaw`
      INSERT INTO "quotation" ("unit", "price", "total_price", "factory_sign", "creation_date", "status", "supplier_id")
      VALUES (
        ${body.unit}, 
        ${body.price},
        ${body.unit} * ${body.price}, -- total_price
        ${body.factory_sign},
        NOW() AT TIME ZONE 'Asia/Bangkok', -- Current date time
        ${Prisma.sql`${body.status}::"QuotationStatus"`},
        ${body.supplier_id}
        )
      RETURNING "id", "unit", "price", "total_price", "factory_sign", "supplier_sign", "creation_date", "accept_date", "supplier_id", "status"
      `;

      console.log("Quotation inserted successfully: ", insertedQuotation);
      return { message: "Quotation inserted successfully", insertedQuotation };
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
      tags: ["Quotation"],
    },
  }
);

app.put(
  "/put",
  async ({ body }) => {
    try {
      interface Quotation {
        unit: number,
        price: number,
        total_price: number,
        factory_sign: string,
        supplier_sign: string,
        creation_date: Date,
        accept_date: Date,
        supplier_id: number,
        status: QuotationStatus
      }

      const quotationList: Quotation[] = await db.$queryRaw`
      SELECT "unit", "price", "total_price", "factory_sign", "supplier_sign", "creation_date", "accept_date", "supplier_id", "status"
      FROM "quotation"
      WHERE "id" = ${body.id}
      LIMIT 1
      `;
      const quotation = quotationList[0];

      let total_price = 0;
      if(body.unit !== undefined && body.price !== undefined) {
        total_price = body.unit * body.price;
      } else if(body.unit !== undefined && body.price === undefined) {
        total_price = body.unit * quotation.price;
      } else if(body.unit === undefined && body.price !== undefined) {
        total_price = quotation.unit * body.price;
      }

      const updatedQuotation: any = await db.$queryRaw`
      UPDATE "quotation"
      SET "unit" = ${body.unit || quotation.unit},
      "price" = ${body.price || quotation.price},
      "total_price" = ${total_price},
      "factory_sign" = ${body.factory_sign || quotation.factory_sign},
      "supplier_sign" = ${body.supplier_sign || quotation.supplier_sign},
      "accept_date" = ${body.accept_date || quotation.accept_date},
      "status" = ${Prisma.sql`${body.status || quotation.status}::"QuotationStatus"`}
      WHERE "id" = ${body.id}
      RETURNING "id", "unit", "price", "total_price", "factory_sign", "supplier_sign", "creation_date", "accept_date", "supplier_id", "status"
      `;

      console.log("Quotation updated successfully: ", updatedQuotation[0]);
      return updatedQuotation[0];
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
      tags: ["Quotation"],
    },
  }
);

app.delete(
  "/delete",
  async ({ body }) => {
    try {
      const deletedQuotation: any = await db.$queryRaw`
        DELETE FROM "quotation"
        WHERE "id" = ${body.id}
        RETURNING "id";
      `;

      console.log("Quotation deleted successfully: ", deletedQuotation);
      return {
        message: "Quotation deleted successfully",
        id: deletedQuotation,
      };
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
