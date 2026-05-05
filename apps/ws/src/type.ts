import type { WebSocket } from "ws";

export interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
  userId: string;
}