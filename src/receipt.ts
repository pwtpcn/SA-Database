import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({prefix:"/reciept"});

app.get("/get", async () => {
    const receiptList = await db.receipt.findMany();
    return receiptList;
},{
    detail: {
        tags: [
            "Receipt"
        ]
    }
});

app.post("/post", async ({body}) => {
    const receipt = await db.receipt.create({
        data: body
    });
    return receipt;
},{
    body: t.Object({
        receipt_date: t.Date(),
        total_price: t.Number({
            minimum:0,
        }),
        tax_number: t.Numeric({
            minimum:1000000000,
            maximum:9999999999999
        })
    }),
    detail: {
        tags: [
            "Receipt"
        ]
    }
});

app.put("/put", async ({body}) => {
    const receipt = await db.receipt.update({
        where: {
            id: body.id
        },
        data: body
    });
    return receipt;
},{
    body: t.Object({
        id: t.Number(),
        receipt_date: t.Date(),
        total_price: t.Number({
            minimum:0,
        }),
        tax_number: t.Numeric({
            minimum:1000000000,
            maximum:9999999999999
        })
    }),
    detail: {
        tags: [
            "Receipt"
        ]
    }
});

app.delete("/delete", async ({body}) => {
    const receipt = db.receipt.delete({
        where: {
            id: body.id
        },
    });
    return receipt
},{
    body: t.Object({
        id: t.Number()
    }),
    detail: {
        tags: [
            "Receipt"
        ]
    }
});

export default app;
