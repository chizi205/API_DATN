const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join_invoice", (invoiceId) => {
      socket.join(`invoice_${invoiceId}`);
      console.log(`Socket ${socket.id} joined room: invoice_${invoiceId}`);
    });

    socket.on("join_branch", (branchId) => {
      socket.join(`branch_${branchId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
