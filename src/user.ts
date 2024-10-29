import { Elysia, t } from "elysia";
import crypto from "crypto";
import db from "./db";
import { $, password } from "bun";
import { join, Sql } from "@prisma/client/runtime/library";
import { Prisma } from "@prisma/client";

const app = new Elysia({ prefix: "/user" });

// Raw Query //
app.get(
  "/get",
  async () => {
    const userList = await db.$queryRaw`
      SELECT "uuid",
      "username",
      "priority"
      FROM "user"`;
    return userList;
  },
  {
    detail: {
      tags: ["User"],
    },
  }
);

app.post(
  "/getByUsername",
  async ({ body }) => {
    const encryptWithSalt = (password: string, salt: string): string => {
      const hashedPassword = crypto
        .createHash("sha256")
        .update(password + salt)
        .digest("hex");
      return hashedPassword;
    };

    const username = body.username;

    interface Authenticate {
      salt: string;
      password: string;
    }

    const authen: Authenticate[] = await db.$queryRaw`
    SELECT "salt", "password" FROM "user" WHERE "username" = ${username} LIMIT 1
    `;

    const hashedPassword = encryptWithSalt(body.password, authen[0].salt);

    if (authen[0].password === hashedPassword) {
      return db.$queryRaw`
      SELECT "username", "priority" FROM "user" WHERE "username" = ${username} LIMIT 1
      `;
    } else {
      return JSON.stringify({
        username: "Error authen failed",
        priority: -1,
      });
    }
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
    }),
    detail: {
      tags: ["User"],
    },
  }
);

app.post(
  "/post",
  async ({ body }) => {
    try {
      const generateSalt = (length: number = 16): string => {
        return crypto
          .randomBytes(Math.ceil(length / 2))
          .toString("hex")
          .slice(0, length);
      };

      const encryptWithSalt = (password: string, salt: string): string => {
        const hashedPassword = crypto
          .createHash("sha256")
          .update(password + salt)
          .digest("hex");
        return hashedPassword;
      };

      const salt = generateSalt();
      const hashedPassword = encryptWithSalt(body.password, salt);

      const insertUser = await db.$queryRaw`
      INSERT INTO "user" ("username", "password", "salt", "priority")
      VALUES (
      ${body.username}, 
      ${hashedPassword},
      ${salt},
      ${body.priority}
      )
      RETURNING "uuid", "username", "password", "salt", "priority";
      `;

      console.log("User inserted successfully: ", insertUser);
      return { message: "User inserted successfully", insertUser };
    } catch (error) {
      console.error("Error insrting user: ", error);
      return { error: "Failed to insert user" };
    }
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
      priority: t.Number(),
    }),
    detail: {
      tags: ["User"],
    },
  }
);

app.put(
  "/put",
  async ({ body }) => {
    try {
      const generateSalt = (length: number = 16): string => {
        return crypto
          .randomBytes(Math.ceil(length / 2))
          .toString("hex")
          .slice(0, length);
      };

      const encryptWithSalt = (password: string, salt: string): string => {
        const hashedPassword = crypto
          .createHash("sha256")
          .update(password + salt)
          .digest("hex");
        return hashedPassword;
      };
      
      let salt = "";
      let hashedPassword = "";

      if(body.password !== undefined){
      salt = generateSalt();
      hashedPassword = encryptWithSalt(body.password, salt);
      }

      interface User {
        username: string;
        password: string;
        salt: string;
        priority: number;
      }

      const userList: User[] = await db.$queryRaw`
      SELECT "username", "password", "salt", "priority" 
      FROM "user" 
      WHERE "username" = ${body.old_username} 
      LIMIT 1;
      `;
      const user = userList[0];

      const updatedUser: any = await db.$queryRaw`
      UPDATE "user" 
      SET "username" = ${body.new_username || user.username}, "password" = ${hashedPassword || user.password}, "salt" = ${salt || user.salt}, "priority" = ${body.priority || user.priority}
      WHERE "username" = ${body.old_username}
      RETURNING "uuid", "username", "priority";
      `;

      console.log("User updated successfully:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Error updating user: ", error);
      return { error: "Failed to update user" };
    }
  },
  {
    body: t.Object({
      old_username: t.String(),
      new_username: t.Optional(t.String()),
      password: t.Optional(t.String()),
      priority: t.Optional(t.Number()),
    }),
    detail: {
      tags: ["User"],
    },
  }
);


app.delete(
  "/delete",
  async ({ body }) => {
    try {
      const deletedUser: any = await db.$queryRaw`
        DELETE FROM "user"
        WHERE "username" = ${body.username}
        RETURNING "username"
        `;

      console.log("User deleted successfully: ", deletedUser);
      return {
        message: "User deleted successfully",
        supplier_id: deletedUser,
      };
    } catch (error) {
      console.error("Error deleting user: ", error);
      return { error: "Failed to delete user" };
    }
  },
  {
    body: t.Object({
      username: t.String(),
    }),
    detail: {
      tags: ["User"],
    },
  }
);

export default app;
