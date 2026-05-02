let io;

const initSocket = (server) => {
  io = require("socket.io")(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("User connected");
  });
};

const sendNotification = (data) => {
  io.emit("taskNotification", data);
};

module.exports = { initSocket, sendNotification };