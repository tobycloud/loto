export interface Client {
  id: string;
  name: string; // display name
}

export interface Room {
  roomName: string;
  status: "pending" | "active" | "ended";
  clients: Client[];

  masterId: string;
}
