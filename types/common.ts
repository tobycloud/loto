export interface Client {
  id: string;
  name: string; // display name
  board: Board;
  // score: number; // number of correct numbers they have // ????
}

export interface Room {
  name: string;
  status: "pending" | "active" | "ended";
  clients: Client[];

  masterId: string;
}

export interface Cell {
  value: number;
  y: number; // 0-8
}

export interface Board {
  "0": Cell[];
  "1": Cell[];
  "2": Cell[];
  "3": Cell[];
  "4": Cell[];
  "5": Cell[];
  "6": Cell[];
  "7": Cell[];
  "8": Cell[];
}

export const exampleBoard: Board = {
  "0": [
    { value: 1, y: 1 },
    { value: 4, y: 3 },
    { value: 6, y: 4 },
    { value: 8, y: 7 },
    { value: 9, y: 2 },
  ],
  "1": [
    { value: 11, y: 1 },
    { value: 16, y: 3 },
    { value: 12, y: 4 },
    { value: 17, y: 7 },
    { value: 20, y: 2 },
  ],
  "2": [
    { value: 21, y: 1 },
    { value: 26, y: 3 },
    { value: 22, y: 4 },
    { value: 28, y: 7 },
    { value: 30, y: 2 },
  ],
  "3": [
    { value: 31, y: 1 },
    { value: 36, y: 3 },
    { value: 32, y: 4 },
    { value: 37, y: 7 },
    { value: 40, y: 2 },
  ],
  "4": [
    { value: 41, y: 1 },
    { value: 46, y: 3 },
    { value: 42, y: 4 },
    { value: 47, y: 7 },
    { value: 50, y: 2 },
  ],
  "5": [
    { value: 51, y: 0 },
    { value: 56, y: 5 },
    { value: 52, y: 6 },
    { value: 57, y: 8 },
    { value: 60, y: 9 },
  ],
  "6": [
    { value: 61, y: 0 },
    { value: 66, y: 5 },
    { value: 62, y: 6 },
    { value: 67, y: 8 },
    { value: 70, y: 9 },
  ],
  "7": [
    { value: 71, y: 0 },
    { value: 76, y: 5 },
    { value: 72, y: 6 },
    { value: 77, y: 8 },
    { value: 80, y: 9 },
  ],
  "8": [
    { value: 81, y: 0 },
    { value: 86, y: 5 },
    { value: 82, y: 6 },
    { value: 87, y: 8 },
    { value: 90, y: 9 },
  ],
};
