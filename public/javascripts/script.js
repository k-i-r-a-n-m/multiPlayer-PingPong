// Canvas Related
const canvas = document.createElement("canvas");
const playAgainButton = document.createElement("button");
const context = canvas.getContext("2d");
// const socket = io(`http://localhost:3000`);

// creating namespace for pong game
const socket = io('/pong');

const h1 = document.querySelector("#winScore_h1");

let isReferee = false;
let winner = "";

let paddleIndex = 0;

let width = 500;
let height = 700;

// Paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [225, 225];
let trajectoryX = [0, 0];
let playerMoved = false;

// Ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0;
// let computerSpeed = 4;

// Score for Both Players
let score = [0, 0];

// winning score
const winScore = 10;

// check for winner using score array
function checkWinner(score) {
  if (score.includes(winScore)) {
    winner = score[0] === winScore ? "p1" : "p2";
    socket.emit("winner", winner);
  }
}

// Create Canvas Element
function createCanvas() {
  canvas.id = "canvas";
  canvas.width = width;
  canvas.height = height;
  // document.body.appendChild(canvas);
  h1.after(canvas);

  renderCanvas();
}

// Wait for Opponents
function renderIntro() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = "white";
  context.font = "32px Courier New";
  context.fillText("Waiting for opponent...", 20, canvas.height / 2 - 30);
}

function renderWinner(player) {
  console.log("inside renderWinner:" + player);
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Winenr  Text
  context.fillStyle = "white";
  context.font = "32px Courier New";
  context.fillText(
    `${player} wins the game!🎊🎉...`,
    20,
    canvas.height / 2 - 30
  );

  // playagain button is created
  playAgainButton.id = "playAgain";
  playAgainButton.innerHTML = "PLAY AGAIN!";
  // document.body.appendChild(canvas);
  canvas.after(playAgainButton);

  playAgainButton.addEventListener(
    "click",
    () => {
      playAgainButton.remove();

      winner = "";

      // Paddle
      paddleX = [225, 225];
      trajectoryX = [0, 0];
      playerMoved = false;

      // Ball
      ballX = 250;
      ballY = 350;
      ballDirection = 1;

      // Speed
      speedY = 2;
      speedX = 0;
      // computerSpeed = 4;

      // Score for Both Players
      score = [0, 0];

      
      loadGame()
    },
    { once: true }
  );
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = "black";
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = "white";

  // Bottom Paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = "grey";
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = "white";
  context.fill();

  // Score
  context.font = "32px Courier New";
  context.fillText(score[0], 20, canvas.height / 2 + 50);
  context.fillText(score[1], 20, canvas.height / 2 - 30);

  // players
  context.font = "18px Courier New";
  context.fillText("P1", 480, canvas.height / 2 + 20);
  context.fillText("P2", 480, canvas.height / 2 - 10);
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = 3;

  // send the ball position to server
  socket.emit("ballMove", {
    ballX,
    ballY,
    score,
  });
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }

  // send the ball position to server
  socket.emit("ballMove", {
    ballX,
    ballY,
    score,
  });
}

// Determine What Ball Bounces Off, Score Points, Reset Ball,winners declaration!
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
      // check for winners
      checkWinner(score);
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      // Reset Ball, Increase Computer Difficulty, add to Player Score
      // if (computerSpeed < 6) {
      //   computerSpeed += 0.5;
      // }
      ballReset();
      score[0]++;
      // check for winners
      checkWinner(score);
    }
  }
}

// Computer Movement
// function computerAI() {
//   if (playerMoved) {
//     if (paddleX[1] + paddleDiff < ballX) {
//       paddleX[1] += computerSpeed;
//     } else {
//       paddleX[1] -= computerSpeed;
//     }
//     if (paddleX[1] < 0) {
//       paddleX[1] = 0;
//     } else if (paddleX[1] > (width - paddleWidth)) {
//       paddleX[1] = width - paddleWidth;
//     }
//   }
// }

// Called Every Frame
function animate() {
  // computerAI();

  console.log("winner:inside animate" + winner);
  if (isReferee) {
    ballMove();
    ballBoundaries();
  }

  if (winner === "") {
    renderCanvas();
    window.requestAnimationFrame(animate);
  }
}

// Load Game, Reset Everything
function loadGame() {
  createCanvas();
  renderIntro();
  socket.emit("ready");
}

// capturing the mouse movements for the paddle to move inside the canvas
function captureMouseMovement(e) {
   playerMoved = true;
   paddleX[paddleIndex] = e.offsetX;
   if (paddleX[paddleIndex] < 0) {
     paddleX[paddleIndex] = 0;
   }
   if (paddleX[paddleIndex] > width - paddleWidth) {
     paddleX[paddleIndex] = width - paddleWidth;
   }
   // sent the paddle movement data to the server
   socket.emit("paddleMovement", {
     xPosition: paddleX[paddleIndex],
   });
   // Hide Cursor
   canvas.style.cursor = "none";
}


//Start the game
function startGame() {
  paddleIndex = isReferee ? 0 : 1;
  window.requestAnimationFrame(animate);
  if (winner === "") {
    canvas.addEventListener("mousemove",captureMouseMovement);
  }
}

// On Load
loadGame();

socket.on("connect", () => {
  console.log(`my socket id:${socket.id}`);
});

socket.on("startGame", (refereeId) => {
  console.log(`Referee ID : ${refereeId}`);
  isReferee = socket.id === refereeId;
  startGame();
});

socket.on("paddleMovement", (paddleData) => {
  let opponentPaddleIndex = 1 - paddleIndex;
  paddleX[opponentPaddleIndex] = paddleData.xPosition;
});

socket.on("ballMove", (ballData) => {
  ({ ballX, ballY, score } = ballData);
});

socket.on("winnerFound", (finalWinner) => {
  winner = finalWinner;
  canvas.style.cursor = "auto";
  renderWinner(winner);
  canvas.removeEventListener("mousemove",captureMouseMovement);
});

