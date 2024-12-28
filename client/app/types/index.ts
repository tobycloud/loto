export interface Client {
  id: string;
  name: string; // display name
  score: number;
}
export interface Room {
  roomName: string;
  status: "pending" | "active" | "ended";
  clients: Client[];

  masterId: string;
}