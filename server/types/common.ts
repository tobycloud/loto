export interface Client {
  id: string;
  name: string; // display name
  score: number; // number of correct numbers they have 
}

export interface Room {
  roomName: string;
  status: "pending" | "active" | "ended";
  clients: Client[];

  masterId: string;
}
