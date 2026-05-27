import { WebSocketServer } from "ws";

const connections = new Map();

export function init(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws, req) => {
    const url = new URL(req.url, "ws://localhost");
    const userId = url.searchParams.get("user_id");
    if (!userId?.trim()) {
      ws.close(4001, "Unauthorized");
      return;
    }
    connections.set(ws, { userId: userId.trim() });
    console.log(`[WS] + ${userId} (total: ${connections.size})`);
    ws.on("close", () => {
      connections.delete(ws);
      console.log(`[WS] - ${userId}`);
    });
    ws.on("error", (err) => console.error(`[WS] Error: ${err.message}`));
  });
  return wss;
}

export function broadcast(userId, payload) {
  const msg = JSON.stringify(payload);
  for (const [ws, meta] of connections) {
    if (meta.userId === userId && ws.readyState === 1) ws.send(msg);
  }
}

export const getConnectionCount = () => connections.size;
