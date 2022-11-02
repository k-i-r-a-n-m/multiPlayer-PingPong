let readyPlayerCount = 0;
let playAgain = 0;

function listen(io) {
  io.on("connection", (socket) => {
    console.log(`client connected : ${socket.id}`);

    socket.on("ready", () => {
      readyPlayerCount++;
      console.log({ readyPlayerCount });
      if (readyPlayerCount % 2 == 0) {
        io.emit("startGame", socket.id);
      }
    });

    socket.on("paddleMovement", (paddleData) => {
      socket.broadcast.emit("paddleMovement", paddleData);
    });

    socket.on("ballMove", (ballData) => {
      socket.broadcast.emit("ballMove", ballData);
    });

    socket.on("winner", (winner) => {
      io.emit("winnerFound", winner);
      console.log(`winner found from srever:${winner}`);
    });

    
    socket.on("disconnect", (reason) => {
      console.log(`client ${socket.id} disconnected:${reason}`);
    });
  });
}

module.exports = { listen };
