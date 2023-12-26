const { Client } = require('discord.js-selfbot-v13');
const client = new Client({
    checkUpdate: false,
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let snake = [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }];
let direction = 'right';
let gameRunning = false;
let gameInterval;
let snakeMessage;
let apples = []; 

client.on('messageCreate', async (message) => {
  if (message.content === '!startsnake' && !gameRunning) {
    gameRunning = true;
    snake = [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }];
    direction = 'right';
    snakeMessage = await message.channel.send(getSnakeBoard(snake));
    placeApple(); 
    gameInterval = setInterval(() => moveSnake(), 1000);
  }

  if (gameRunning && message.content === '!stopsnake') {
    clearInterval(gameInterval);
    gameRunning = false;
    snakeMessage.edit(getSnakeBoard(snake) + '\nGame Over!');
    apples = [];
  }

  if (['left', 'right', 'up', 'down'].includes(message.content.toLowerCase())) {
    direction = message.content.toLowerCase();
  }
});

function getSnakeBoard(snake) {
  let board = '';
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (snake.some((segment) => segment.x === x && segment.y === y)) {
        board += '🟩';
      } else if (apples.some((apple) => apple.x === x && apple.y === y)) {
        board += '🍎'; 
      } else {
        board += '⬜';
      }
    }
    board += '\n';
  }
  return board;
}

function placeApple() {
  const appleX = Math.floor(Math.random() * 10);
  const appleY = Math.floor(Math.random() * 10);
  apples.push({ x: appleX, y: appleY });
}

function checkAppleCollision() {
  const head = snake[0];
  for (let i = 0; i < apples.length; i++) {
    if (head.x === apples[i].x && head.y === apples[i].y) {
      snake.push({ ...snake[snake.length - 1] });
      apples.splice(i, 1);
      placeApple();
    }
  }
}

function moveSnake() {
  const newHead = getNextHead(snake[0], direction);
  snake.unshift(newHead);
  if (checkGameOver(snake)) {
    clearInterval(gameInterval);
    gameRunning = false;
    snakeMessage.edit(getSnakeBoard(snake) + '\nGame Over!');
    apples = [];
  } else {
    checkAppleCollision();
    if (snake.length > 3) {
      snake.pop();
    }
    snakeMessage.edit(getSnakeBoard(snake));
  }
}

function getNextHead(currentHead, direction) {
  switch (direction) {
    case 'left':
      return { x: currentHead.x - 1, y: currentHead.y };
    case 'up':
      return { x: currentHead.x, y: currentHead.y - 1 };
    case 'right':
      return { x: currentHead.x + 1, y: currentHead.y };
    case 'down':
      return { x: currentHead.x, y: currentHead.y + 1 };
    default:
      return currentHead;
  }
}

function checkGameOver(snake) {
  const head = snake[0];
  return (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= 10 ||
    head.y >= 10 ||
    snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
  );
}


client.login('UrToken');