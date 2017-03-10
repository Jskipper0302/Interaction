var AM = new AssetManager();
var socket = io.connect("http://76.28.150.193:8888");
var points = 0;
var tfArray = [];
var brickArray = [];
var ball, panel, row, totallSpeed;
function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;s
};

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
        xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
        this.frameWidth, this.frameHeight,
        x, y,
        this.frameWidth * this.scale,
        this.frameHeight * this.scale);
};

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
};

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
};

function Background(game) {
    this.x = 0;
    this.y = 0;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, 1280, 720);
};

Background.prototype.update = function () {

};

function Panel(game) {
    this.x = 620;
    this.y = 700;
    this.ctx = game.ctx;
    this.speed = 6;
}

Panel.prototype.draw = function () {
    this.ctx.clearRect(this.x, this.y, 140, 30);
};

Panel.prototype.update = function () {

};

function Ball(game, panel) {
    this.x = 620;
    this.y = 350;
    this.ctx = game.ctx;
    var pnX = Math.random();
    var pnY = Math.random();

    if (pnX < 0.5) {
        this.speedX = -Math.ceil(Math.random() * 10);
    } else {
        this.speedX = Math.ceil(Math.random() * 10);
    }
    if (pnX < 0.5) {
        this.speedY = -Math.ceil(Math.random() * 10);
    } else {
        this.speedY = Math.ceil(Math.random() * 10);
    }
    totallSpeed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
    this.panel = panel;
};

Ball.prototype.draw = function () {
    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI);
    this.ctx.fill();
};

Ball.prototype.update = function () {
    if (this.x > 0 && this.x < 1280 ){
        this.x += this.speedX;
    }
    if (this.x > 1270 - this.speedX || this.x < 10 - this.speedX){
        this.speedX = -this.speedX;
    }
    if (this.y < 10 - this.speedY){
        this.speedY = -this.speedY;
    }
    if (this.y > 0 && this.y < 730){
        this.y += this.speedY;
    } else{
        points = 0;
        if (confirm('Ball Fell, Game Over!')){
            window.location.reload();
        } else {
            window.location.reload();
        }
    }
    if(points == row * 12) {
        points = 0;
        if (confirm('No more Brick, Game Over!')){
            window.location.reload();
        } else {
            window.location.reload();
        }
    }
    if (this.panel.y - this.y < 10 + this.speedY && this.panel.y - this.y > -15 + this.speedY) {
        if (this.x - this.panel.x < 150 && this.x - this.panel.x > -10){
            this.speedX = this.speedX + (this.x - this.panel.x - 70) / 70;
            this.speedY = -(Math.sqrt(totallSpeed * totallSpeed - this.speedX * this.speedX));
        }
    }
    if (this.panel.x + 70 > this.x && this.panel.x > 0){
        this.panel.x -= this.panel.speed;
    } else if (this.panel.x < 1140){
        this.panel.x += this.panel.speed;
    }
};

function Brick(game, ball, x, y) {
    this.x = x;
    this.y = y;
    this.ball = ball;
    this.ctx = game.ctx;
    this.dis = true;
};

Brick.prototype.draw = function () {
    if (this.dis) {
        this.ctx.clearRect(this.x, this.y, 100, 20);
    }
};

Brick.prototype.update = function () {
    if (this.dis) {
        if (this.ball.x - this.x > -10  && this.ball.x - this.x < 110) {
            if (this.y - this.ball.y < 10 && this.y - this.ball.y > -30){
                this.ball.speedX = -this.ball.speedX;
                this.ball.speedY = -this.ball.speedY;
                this.dis = false;
                points++;
            }
        }
    }
};

function addBrick(row, gameEngine, ball) {
    for (var i = 0; i < 12; i++) {
        for (j = 0; j < row; j++) {
            var brick = new Brick(gameEngine, ball, 10 + i * 105, 0 + j * 25);
            brickArray.push(brick);
            gameEngine.addEntity(brick);
        }
    }
};

function DisBoard(game, ball) {
    this.ctx = game.ctx;
    this.ball = ball;
};

DisBoard.prototype.draw = function () {
    this.ctx.fillStyle = "blue";
    this.ctx.font = "30px Arial";
    this.ctx.fillText("Target Points: " + row * 12, 960,630);
    this.ctx.fillText("Points: " + points, 1030,680);
    this.ctx.fillText("Current ball speed: " + totallSpeed.toFixed(2), 50,580);
    this.ctx.fillText("Current ball X speed: " + this.ball.speedX.toFixed(2), 50,630);
    this.ctx.fillText("Current ball Y speed: " + this.ball.speedY.toFixed(2), 50,680);
};

DisBoard.prototype.update = function () {

};

socket.on("load", function (data) {
    tfArray = data["display"];
    ball.speedX = data["ballSpeedX"];
    ball.speedY = data["ballSpeedY"];
    ball.x = data["ballX"];
    ball.y = data["ballY"];
    totallSpeed = data["ballSpeed"];
    row = data["startRow"];
    points = data["currentPoint"];
    panel.x = data["panelX"];
    for (var i = 0; i < row * 12; i++) {
        brickArray[i].dis = tfArray[i];
    }
});

function LoadButtonListener() {
    document.getElementById("loadB").addEventListener("click", function () {
        socket.emit("load", { studentname: "Yunhang Jiang", statename: "YHJ0302"});}
    )
};

function SaveButtonListener() {
    this.ball = ball;
    document.getElementById("saveB").addEventListener("click", function () {console.log("save");
        for (var i = 0; i < row * 12; i++) {
            tfArray [i] = brickArray[i].dis;
        }
        socket.emit("save", { studentname: "Yunhang Jiang", statename: "YHJ0302", display: tfArray, ballSpeed: totallSpeed,
            ballSpeedX: ball.speedX, ballSpeedY: ball.speedY, ballX: ball.x, ballY: ball.y, startRow: row, currentPoint: points,
            panelX: panel.x});}
    )
};

AM.queueDownload();
AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    gameEngine.addEntity(new Background(gameEngine));
    panel = new Panel(gameEngine);
    gameEngine.addEntity(panel);
    ball = new Ball(gameEngine, panel);
    gameEngine.addEntity(new DisBoard(gameEngine, ball));
    gameEngine.addEntity(ball);
    row = 3;
    addBrick(row, gameEngine, ball);
    LoadButtonListener();
    SaveButtonListener();
    console.log("All Done!");
});