import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { Room } from "../types/common";

import { Static, Type } from "@sinclair/typebox";
import { DiscriminatedUnionValidator } from "typebox-validators/discriminated/discriminated-union-validator";

/*



*/

const rooms: { [name: string]: Room } = {};

const connectedClients: {
  [id: string]: { roomId: string };
} = {};

const wsMessages = Type.Union(
  [
    Type.Object({
      type: Type.Literal("create"),
      name: Type.String(),
      size: Type.Number({ minimum: 2, maximum: 99 }),
    }),
    Type.Object({
      type: Type.Literal("join"),
      name: Type.String(),
    }),
    Type.Object({
      type: Type.Literal("start"),
    }),
    Type.Object({
      type: Type.Literal("leave"),
    }),
    Type.Object({
      type: Type.Literal("pull"),
    }),
    Type.Object({
      type: Type.Literal("kick"),
      id: Type.String(),
    }),
  ],
  { discriminantKey: "type" }
);

const unionValidator = new DiscriminatedUnionValidator(wsMessages);

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(swagger())
  .use(cors())

  .ws("/play", {
    open: async (ws) => {},

    message: async (ws, message: Object) => {
      try {
        unionValidator.assert(message);
      } catch (error) {
        return ws.send(JSON.stringify({ type: "error", data: error }));
      }
      const data = message as Static<typeof wsMessages>;
      if (data.type === "create") {
        if (rooms[data.name]) {
          return ws.send(JSON.stringify({ type: "error", data: "Room already exists" }));
        }
        rooms[data.name] = {
          // 🔥
          roomName: data.name,
          status: "pending",
          clients: [
            {
              id: ws.id,
              name: data.name,
            },
          ],
          masterId: ws.id,
        };
        return ws.send(
          JSON.stringify({
            type: "room+",
            roomName: data.name,
            status: "pending",
          })
        );
      }

      if (data.type == "join") {
        if (!rooms[data.name]) {
          return ws.send(JSON.stringify({ type: "error", data: "Room not found" }));
        }
        if (rooms[data.name].status !== "pending") {
          return ws.send(JSON.stringify({ type: "error", data: "Room is not pending" }));
        }
        if (rooms[data.name].clients.find((client) => client.name === data.name)) {
          return ws.send(JSON.stringify({ type: "error", data: "Client already connected" }));
        }
        rooms[data.name].clients.push({
          id: ws.id,
          name: data.name,
        });
        connectedClients[ws.id] = {
          roomId: data.name,
        };
        ws.send(
          JSON.stringify({
            type: "room+",
            data: { roomName: data.name, status: "pending" },
          })
        );
        ws.publish(
          `room/${data.name}`,
          JSON.stringify({
            type: "client+",
            data: { id: ws.id, name: data.name },
          })
        );
        return;
      }

      if (data.type == "leave") {
        const roomId = connectedClients[ws.id]?.roomId;
        if (!roomId) {
          return ws.send(JSON.stringify({ type: "error", data: "Not in a room" }));
        }
        const room = rooms[roomId];
        if (room.masterId === ws.id) {
        } else {
          room.clients = room.clients.filter((client) => client.id !== ws.id);
          ws.publish(
            `room/${roomId}`,
            JSON.stringify({
              type: "client-",
              data: { id: ws.id },
            })
          );
        }
        delete connectedClients[ws.id];
        return ws.send(JSON.stringify({ type: "room-" }));
      }
    },
    close(ws, code, reason) {},
  })

  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
