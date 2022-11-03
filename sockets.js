let readyPlayerCount = 0;

function listen(io) {
  const pongNamesapce = io.of("/pong");

  pongNamesapce.on("connection", (socket) => {
    let room;

    // console.log(`client connected : ${socket_detail[0]}/${socket_detail[1]}`);
    console.log(`client connected : ${socket.id}`);

    socket.on("ready", () => {
      room = "room:" + Math.floor(readyPlayerCount / 2);
      socket.join(room);
      console.log(room)
      readyPlayerCount++;
      console.log({ readyPlayerCount, _: [...socket.rooms][1] });
      if (readyPlayerCount % 2 == 0) {
        pongNamesapce.in(room).emit("startGame", socket.id);
      }
    });

    

    socket.on("paddleMovement", (paddleData) => {
      socket.to(room).emit("paddleMovement", paddleData);
    });

    socket.on("ballMove", (ballData) => {
      socket.to(room).emit("ballMove", ballData);
    });

    socket.on("winner", (winner) => {
      // readyPlayerCount = readyPlayerCount - 2;
      pongNamesapce.in(room).emit("winnerFound", winner);
      console.log(`winner found from srever:${winner}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`client ${socket.id} disconnected:${reason}`);
      socket.leave(room);
    });
  });
}

module.exports = { listen };
