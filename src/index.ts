import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import supplier from "./supplier";
import receipt from "./receipt";
import quotation from "./quotation";
import user from "./user";
import delivery_note from "./delivery_note";

const app = new Elysia();
app.use(
  swagger({
    path: "/docs",
    documentation: {
      info: { title: "SA_DB Api Document", version: "1.0.0" },
      tags: [
        { name: "Supplier", description: "Supplier endpoint" },
        { name: "Receipt", description: "Reciept endpoint" },
        { name: "Quotation", description: "Quotation endpoint" },
        { name: "DeliveryNote", description: "DeliveryNote endpoint" },
        { name: "User", description: "User endpoint" },
      ],
    },
  })
);

app.use(supplier);
app.use(receipt);
app.use(quotation);
app.use(user);
app.use(delivery_note);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
