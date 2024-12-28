import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import { v7 } from "uuid";
import { Elysia, t } from "elysia";

const rooms = {} as {
  [key: string]: {
    public: {
      roomName: string;
      status: "pending" | "active" | "ended";
      clients: {
        id: string;
        name: string;
        status: "active" | "inactive";
      }[];
    };
    private: {
      masterToken: string;
      masterId?: string;
      clients: {
        [key: string]: {
          id: string;
        };
      };
    };
  };
};
const connectedClients = {} as {
  [key: string]: {
    roomId: string;
  };
};

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(swagger())
  .use(cors())
  .ws("/room/master/:id/:token", {
    open: async (ws) => {
      if (!rooms[ws.data.params.id]) {
        return ws.data.error(404, "Room not found");
      }
      if (
        rooms[ws.data.params.id].private.masterToken !== ws.data.params.token
      ) {
        return ws.data.error(401, "Invalid master token");
      }
      if (rooms[ws.data.params.id].private.masterId) {
        return ws.data.error(401, "Master already connected");
      }
      ws.subscribe(`room/${ws.data.params.id}`);
      ws.publish(
        `room/${ws.data.params.id}`,
        JSON.stringify({
          type: "master",
          id: ws.id,
          message: "Master connected",
        })
      );
      rooms[ws.data.params.id].private.masterId = ws.id;
      connectedClients[ws.id] = {
        roomId: ws.data.params.id,
      };
      ws.send(
        JSON.stringify({
          type: "init",
          id: ws.id,
          data: rooms[ws.data.params.id].public,
        })
      );
    },
    message: async (ws, message) => {
      console.log(message);
      ws.publish(
        `room/${ws.data.params.id}`,
        JSON.stringify({
          type: "master",
          id: ws.id,
          message,
        })
      );
    },
    close(ws, code, reason) {
      ws.unsubscribe(`room/${ws.data.params.id}`);
      console.debug("Master disconnected from room", ws.data.params.id);
      console.debug("with code", code, "and reason", reason);
    },
  })
  .ws("/room/:id", {
    open: async (ws) => {
      if (!rooms[ws.data.params.id]) {
        return ws.data.error(404, "Room not found");
      }
      rooms[ws.data.params.id].public.clients.push({
        id: ws.id,
        name: ws.data.params.id,
        status: "active",
      });
      connectedClients[ws.id] = {
        roomId: ws.data.params.id,
      };
      rooms[ws.data.params.id].private.clients[ws.id] = {
        id: ws.id,
      };
      ws.subscribe(`room/${ws.data.params.id}`);
      ws.publish(
        `room/${ws.data.params.id}`,
        JSON.stringify({
          type: "update",
          id: ws.id,
          data: rooms[ws.data.params.id].public,
        })
      );
      ws.send(
        JSON.stringify({
          type: "init",
          id: ws.id,
          data: rooms[ws.data.params.id].public,
        })
      );
    },
    message: async (ws, message) => {
      console.log(message);
    },
    close(ws, code, reason) {
      ws.unsubscribe(`room/${ws.data.params.id}`);
    },
  })
  .post(
    "/room/:id",
    ({ params, error }) => {
      console.log(params);
      if (rooms[params.id]) {
        return error(400, "Room already exists");
      } else {
        rooms[params.id] = {
          public: {
            roomName: params.id,
            status: "pending",
            clients: [],
          },
          private: {
            masterToken: v7(),
            clients: {},
          },
        };
        return {
          public: rooms[params.id].public,
          masterToken: rooms[params.id].private.masterToken,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get(
    "/room/:id",
    ({ params }) => {
      if (rooms[params.id]) {
        return rooms[params.id].public;
      } else {
        return null;
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
