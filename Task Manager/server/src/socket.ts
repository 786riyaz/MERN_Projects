import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", socket => {
    socket.on("join", userId => {
      socket.join(userId);
    });
  });
};

export const emitTaskAssigned = (userId: string, task: any) => {
  io.to(userId).emit("task:assigned", task);
};
