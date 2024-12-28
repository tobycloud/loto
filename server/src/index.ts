import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { Client, Room } from "../types/common";

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
    Type.Object({
      type: Type.Literal("pick"), // server check if in player number table and in number rolled table then add score to player
      number: Type.Number(),
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
    open: async (ws) => { },

    message: async (ws, message: Object) => {
      try {
        unionValidator.assert(message);
      } catch (error) {
        return ws.send(JSON.stringify({ type: "error", data: error }));
      }
      const data = message as Static<typeof wsMessages>;
      if (data.type === "create") {
        if (rooms[data.name]) {
          return ws.send(JSON.stringify({
            type: "error",
            code: 400,
            data: "Room already exists"
          }));
        }
        rooms[data.name] = {
          // 🔥
          roomName: data.name,
          status: "pending",
          clients: [
            {
              id: ws.id,
              name: data.name,
              score: 0,
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
          score: 0,
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
            data: { id: ws.id, name: data.name, score: 0 } as Client,
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
    close(ws, code, reason) { },
  })
  .get("/room/:name", ctx => {
    const room = rooms[ctx.params.name];
    if (!room) ctx.set.status = 404;
    return room;
  })

  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
