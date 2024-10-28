import { Elysia, t } from "elysia";
import db from "./db";

const app = new Elysia({ prefix: "/user" });

// Raw Query //
app.get(
  "/get",
  async () => {
    const userList = await db.$queryRaw`
      SELECT uuid,
      username,
      priority
      FROM user`;
    return userList;
  },
  {
    detail: {
      tags: ["User"],
    },
  }
);

app.post(
  "/post",
  async ({ body }) => {
    try {
      const user = await db.$queryRaw`
        INSERT INTO supplier (username, password, salt, priority)
        VALUES (
          ${body.username}, 
          ${body.password},
          ${body.salt},
          ${body.priority},
          )
        RETURNING uuid, username, password, salt, priority
        `;

      console.log("User inserted successfully: ", user);
      return { message: "User inserted successfully", user };
    } catch (error) {
      console.error("Error insrting user: ", error);
      return { error: "Failed to insert user" };
    }
  },
  {
    body: t.Object({
      username: t.String(),
      password: t.String(),
      salt: t.String(),
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
      const updates = [];

      if (body.username !== undefined) {
        updates.push(`username = ${body.username}`);
      }

      if (body.password !== undefined) {
        updates.push(`password = ${body.password}`);
      }

      if (body.salt !== undefined) {
        updates.push(`salt = ${body.salt}`);
      }

      if (body.priority !== undefined) {
        updates.push(`priority = ${body.priority}`);
      }

      const updateFields = updates.join(", ");

      const updatedUser: any = await db.$executeRaw`
        UPDATE user
        SET ${updateFields}
        WHERE uuid = ${body.uuid}
        RETURNING uuid, username, password, salt, priority
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
        uuid: t.String(),
        username: t.Optional(t.String()),
        password: t.Optional(t.String()),
        salt: t.Optional(t.String()),
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
        DELETE FROM user
        WHERE uuid = ${body.uuid}
        RETURNING uuid
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
        uuid: t.Number(),
    }),
    detail: {
      tags: ["User"],
    },
  }
);

export default app;