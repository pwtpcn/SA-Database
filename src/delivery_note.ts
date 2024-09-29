import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({prefix:"/delivery"});

app.get("/get", async () => {
    const deliveryList = await db.delivery_note.findMany();
    return deliveryList;
},{
    detail: {
        tags: ["DeliveryNote"]
    }
});

export default app