import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { Board, exampleBoard, Room } from "../../types/common";
import { Errors } from "../../types/errors";

import { Static, Type } from "@sinclair/typebox";
import { DiscriminatedUnionValidator } from "typebox-validators/discriminated/discriminated-union-validator";

/*



*/

const rooms: { [name: string]: Room } = {};

const clientData: {
  [id: string]: {
    board: Board;
  };
} = {};

const wsMessages = Type.Union(
  [
    Type.Object(
      {
        type: Type.Literal("rename"),
        name: Type.String({
          minLength: 1,
          maxLength: 100,
          pattern: "^[a-zA-Z0-9_]+$",
        }),
      },
      { required: ["name"], additionalProperties: false }
    ),
    Type.Object({
      type: Type.Literal("pickSet"),
      set: Type.Object(
        {
          "0": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 1, maximum: 10 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "1": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 11, maximum: 20 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "2": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 21, maximum: 30 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "3": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 31, maximum: 40 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "4": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 41, maximum: 50 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "5": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 51, maximum: 60 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "6": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 61, maximum: 70 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "7": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 71, maximum: 80 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
          "8": Type.Array(
            Type.Object({
              value: Type.Number({ minimum: 81, maximum: 90 }),
              y: Type.Number({ minimum: 0, maximum: 8 }),
            }),
            { minItems: 5, maxItems: 5 }
          ),
        },
        {
          required: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
          additionalProperties: false,
        }
      ),
    }),
    Type.Object(
      {
        type: Type.Literal("start"),
      },
      { required: ["name"], additionalProperties: false }
    ),
    Type.Object(
      {
        type: Type.Literal("pull"),
      },
      { required: ["name"], additionalProperties: false }
    ),
    Type.Object(
      {
        type: Type.Literal("kick"),
        id: Type.String(),
      },
      { required: ["name"], additionalProperties: false }
    ),
    Type.Object(
      {
        type: Type.Literal("pick"), // server check if in player number table and in number rolled table then add score to player
        number: Type.Number(),
      },
      { required: ["name"], additionalProperties: false }
    ),
  ],
  { discriminantKey: "type" }
);

const unionValidator = new DiscriminatedUnionValidator(wsMessages);

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(swagger())
  .use(cors())

  .ws("/room/:id", {
    query: t.Object({
      name: t.String({
        minLength: 1,
        maxLength: 100,
        pattern: "^[a-zA-Z0-9_]+$",
      }),
    }),

    open: async (ws) => {
      const room = ws.data.params.id;

      if (!rooms[room]) {
        rooms[room] = {
          name: room,
          status: "pending",
          clients: [],
          masterId: ws.id,
        };
      }

      ws.send(
        JSON.stringify({
          type: "room+",
          data: rooms[room],
        })
      );

      rooms[room].clients.push({
        id: ws.id,
        name: ws.data.query.name,
        board: exampleBoard,
      });

      ws.publish(`room/${room}`, JSON.stringify({ type: "room*", data: rooms[room] }));

      ws.subscribe(`room/${room}`);
    },

    message: async (ws, message: Object) => {
      try {
        unionValidator.assert(message);
      } catch (error) {
        if (!(error instanceof Error)) return console.error(error);

        return ws.send(
          JSON.stringify({
            type: "error",
            data: {
              error: Errors.BAD_MESSAGE,
              message: error.message,
            },
          })
        );
      }
      const data = message as Static<typeof wsMessages>;

      const room = rooms[ws.data.params.id];

      if (data.type == "pickSet") {
        const ys = [0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (const y of Object.values(data.set)) {
          for (const cell of y) {
            ys[cell.y] += 1;
          }
        }

        if (ys.some((y) => y !== 5)) {
          return ws.send(
            JSON.stringify({
              type: "error",
              data: {
                error: Errors.INVALID_SET,
                message: "Each row must have 5 numbers",
              },
            })
          );
        }

        const client = clientData[ws.id];

        client.board = data.set;
      }

      if (data.type == "rename") {
        if (room.masterId !== ws.id) return;

        room.name = data.name;

        ws.publish(`room/${room}`, JSON.stringify({ type: "room*", data: room }));
      }

      if (data.type == "start") {
        if (room.masterId !== ws.id) return;

        room.status = "active";

        ws.publish(`room/${room}`, JSON.stringify({ type: "room*", data: room }));
      }
    },
    close(ws, code, reason) {
      const roomId = ws.data.params.id;

      const room = rooms[roomId];

      if (room.masterId === ws.id) {
        if (room.clients.length == 0) {
          delete rooms[roomId];
          return;
        }

        // second joined player becomes master
        room.masterId = room.clients[1].id;
      }

      room.clients = room.clients.filter((client) => client.id !== ws.id);
      ws.publish(`room/${roomId}`, JSON.stringify({ type: "room*", data: room })); // room* = room update
    },
  })

  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
