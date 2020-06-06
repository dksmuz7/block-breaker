const cvs = document.getElementById("blockBreaker");
const ctx = cvs.getContext("2d");

const paddleWidth = 100;
const paddleHeight = 15;
const paddleBottomMargin = 40;
let life = 3;
let score=0;
let scoreUnit=10;
let level=1;
let maxLevel=4;

// Media contents
const bgImg = new Image();
bgImg.src = "images/game-bg.jpg";
const scoreImg=new Image();
scoreImg.src="images/score.png";
const lifeImg=new Image();
lifeImg.src="images/life.png";
const levelImg=new Image();
levelImg.src="images/level.png"


const paddle = {
    x: cvs.width / 2 - paddleWidth / 2,
    y: cvs.height - paddleBottomMargin - paddleHeight,
    width: paddleWidth,
    height: paddleHeight,
    dx: 4
}

function drawPaddle() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = "gray";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// To control using keyboard
let leftArrow = false;
let rightArrow = false;

document.addEventListener("keydown", function (event) {
    if (event.keyCode == 37) {
        leftArrow = true;
    } else if (event.keyCode == 39) {
        rightArrow = true;
    }
});

document.addEventListener("keyup", function (event) {
    if (event.keyCode == 37) {
        leftArrow = false;
    } else if (event.keyCode == 39) {
        rightArrow = false;
    }
});

function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < cvs.width) {
        paddle.x += paddle.dx;
    } else if (leftArrow && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

// To draw ball
const ballRadius = 8;
const ball = {
    x: cvs.width / 2,
    y: paddle.y - ballRadius,
    radius: ballRadius,
    speed: 3,
    dx: 3,
    dy: -3
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.closePath;
}

function resetBall() {
    ball.x = paddle.x + (paddle.width) / 2;
    ball.y = paddle.y - ball.radius;
    ball.dy = -3;
    ball.dx = 3 * (Math.random() * 2 - 1);
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballWallCollison() {
    if (ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if ((ball.y - ballRadius) < 0) {
        ball.dy = -ball.dy;
    }
    if ((ball.y + ballRadius) > cvs.height) {
        life--;
        resetBall();
    }
}

function ballPaddleColision() {
    if (ball.y > paddle.y && ball.y < paddle.y + paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        let collidePt = ball.x - (paddle.x + paddle.width / 2);
        collidePt = collidePt / (paddle.width / 2);
        let angle = collidePt * (Math.PI / 3);
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = -ball.speed * Math.cos(angle);
    }
}

function ballBrickCollision(){
    for(let r=0;r<brick.row;r++){
        for(let c=0;c<brick.col;c++){
            let b=bricks[r][c];
            if(b.status){
                if(ball.x+ball.radius>b.x && ball.x-ball.radius<b.x+brick.width && ball.y+ball.radius>b.y && ball.y-ball.radius<b.y+brick.height){
                    bricks[r][c].status=false;
                    ball.dy=-ball.dy;
                    score+=scoreUnit;
                }
            }
        }
    }
}

const brick = {
    row: 1,
    col: 5,
    width: 55,
    height: 20,
    offSetLeft: 20,
    offSetTop: 20,
    marginTop: 40,
    fillColor: "white",
    strokeColor: "black"
}

let bricks = [];

function createBricks() {
    for (let r = 0; r < brick.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brick.col; c++) {
            bricks[r][c] = {
                x: c * (brick.offSetLeft + brick.width) + brick.offSetLeft,
                y: r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop,
                status: true
            };
        }
    }
}
createBricks();

function drawBricks() {
    for (let r = 0; r < brick.row; r++) {
        for (let c = 0; c < brick.col; c++) {
            if (bricks[r][c].status) {
                ctx.fillStyle = brick.fillColor;
                ctx.fillRect(bricks[r][c].x,bricks[r][c].y,brick.width,brick.height);
                ctx.strokeStyle = brick.strokeColor;
                ctx.strokeRect(bricks[r][c].x,bricks[r][c].y,brick.width,brick.height);
            }
        }
    }
}

function showGameStats(text,textX,textY,img,imgX,imgY){
    ctx.fillStyle="white";
    ctx.font="25px serif";
    ctx.fillText(text,textX,textY);
    ctx.drawImage(img,imgX,imgY,20,20);
}

let isGameOver=false;

function gameOver(){
    if(life<=0){
        showYouLoose();
        isGameOver=true;
    }
}

function levelUp(){
    let isLevelDone=true;
    for(let r=0;r<brick.row;r++){
        for(let c=0;c<brick.col;c++){
            isLevelDone=isLevelDone && ! bricks[r][c].status;
        }
    }
    if(isLevelDone){
        if(level>maxLevel){
            showYouWon();
            gameOver=true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed+=0.5;
        resetBall();
        level++;
    }
}

function draw() {
    drawPaddle();
    drawBall();
    drawBricks();
    showGameStats(score,35,30,scoreImg,10,10);
    showGameStats(life,cvs.width-25,30,lifeImg,cvs.width-55,10);
    showGameStats(level,cvs.width/2,30,levelImg,cvs.width/2-30,10);
}

function update() {
    movePaddle();
    moveBall();
    ballWallCollison();
    ballPaddleColision();
    ballBrickCollision();
    gameOver();
    levelUp();
}

function loop() {
    ctx.drawImage(bgImg, 0, 0);
    draw();
    update();
    if(! isGameOver){
        requestAnimationFrame(loop);
    }
}

loop();


const gameover=document.getElementById(gameover);
const youwon=document.getElementById(youwon);
const youloose=document.getElementById(youloose);
const restart=document.getElementById(restart);

restart.addEventListener("click",function(){
    location.reload();
});

function showYouWon(){
    gameover.style.display="block";
    youwon.style.display="block"
}

function showYouLoose(){
    gameOver.style.display="block";
    youloose.style.display="block";
}