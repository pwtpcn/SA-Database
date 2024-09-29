import { Elysia, t } from "elysia";
import db from "./db";
import { status } from "@prisma/client";

const app = new Elysia({prefix:"/reciept"});

app.get("/get", async () => {
    const quotationList = await db.quotation.findMany();
    return quotationList;
},{
    detail: {
        tags: [
            "Quotation"
        ]
    }
});

app.post("/post", async ({body}) => {
    const quotation = await db.quotation.create({
       data: body
    });
    return quotation;
},{
    body: t.Object({
        unit: t.Integer({
            minimum: 0
        }),
        price: t.Number({
            minimum: 0
        }),
        total_price: t.Number({
            minimum: 0
        }),
        factory_sign: t.String(),
        // supplier_sign: t.Optional(t.String()),
        creation_date: t.Date(),
        supplier_id: t.Number(),
        status: t.Enum(status)
    }),
    detail: {
        tags: [
            "Quotation"
        ]
    }
});

app.put("/put", async ({body}) => {
    const quotation = await db.quotation.update({
        where: {
            id: body.id
        },
        data: body
    });
    return quotation;
},{
    body: t.Object({
        id: t.Number(),
        unit: t.Optional(t.Integer({
            minimum: 0
        })),
        price: t.Optional(t.Number({
            minimum: 0
        })),
        total_price: t.Optional(t.Number({
            minimum: 0
        })),
        factory_sign: t.Optional(t.String()),
        supplier_sign: t.Optional(t.String()),
        creation_date: t.Optional(t.Date()),
        supplier_id: t.Optional(t.Number()),
        status: t.Optional(t.Enum(status))
    })
});

app.delete("/delete", async ({body}) => {
    const quotation = await db.quotation.delete({
        where: {
            id: body.id
        },
    });
    return quotation;
},{
    body: t.Object({
        id: t.Number()
    }),
    detail: {
        tags: [
            "Quotation"
        ]
    }
});

export default app