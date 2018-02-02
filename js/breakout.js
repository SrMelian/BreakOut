/*
    globals Phaser, rows, columns, screenWidth, screenHeight,
    heightPaddlePosition, widthPaddlePosition, brickWidth,
    brickHeight, distanceWithLateralBounds,
    distanceWithTopBound, distanceBetweenBricks,
    widthPaddle, $, heightBallPosition, heightBall,
    heightTextPosition, widthTextLivesPosition, sizeText
*/
let game = new Phaser.Game('100%', '100%', Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render,
});

let paddle;

let bricks;

let ball;

let ballOnPaddle = true;

let lives = 3;

let score = 0;

let insertCoinText;

let livesText;

/**
 *
 */
function preload() {
    game.load.atlas('bricks', 'resources/breakout.png',
        'resources/breakout.json');
    game.load.image('background', 'resources/background.jpg');
    game.load.image('paddle', 'resources/paddle.png');
    game.load.bitmapFont('atari',
        'resources/Atari.png', 'resources/Atari.fnt');
}

/**
 *
 */
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;

    game.add.sprite(0, 0, 'background');
    initializeParams();

    // <Paddle>
    paddle = game.add.sprite(
        widthPaddlePosition,
        heightPaddlePosition,
        'paddle'
    );

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;
    // </Paddle>

    // <Bricks>
    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    let brick;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            brick = bricks.create(
                // x
                distanceWithLateralBounds + (j * brickWidth),
                // y
                distanceWithTopBound + (i * distanceBetweenBricks),
                'bricks', `brick_${i + 1}_1.png`
            );
            brick.body.bounce.set(1);
            brick.body.immovable = true;
        }
    }
    // </Bricks>

    // <Ball>
    ball = game.add.sprite(game.world.centerX, heightBallPosition,
        'bricks', 'ball_1.png');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    ball.events.onOutOfBounds.add(ballOutOfBounds, this);
    // </Ball>

    // <Text>
    let scoreText = game.add.text(10, heightTextPosition, 'Score: 0', {
        font: `${sizeText}px atari`,
        fill: '#ffffff',
    });

    livesText = game.add.text(widthTextLivesPosition,
        heightTextPosition, 'Lives: 3', {
            font: `${sizeText}px atari`,
            fill: '#ffffff',
        });

    insertCoinText = game.add.text(0, 0, 'INSERT COIN', {
        font: `${sizeText}px atari`,
        fill: '#ffffff',
        boundsAlignH: 'center',
        boundsAlignV: 'middle',
    });

    insertCoinText.setTextBounds(0, 0, screenWidth, screenHeight);
    // </Text>

    // <Start>
    game.input.onDown.add(shootBall, this);
    // </Start>
}

/**
 *
 */
function update() {
    // Paddle moving
    paddle.x = game.input.x;

    // Control limits
    if (paddle.x < 0) {
        paddle.x = 0;
    } else if (paddle.x > game.width - widthPaddle) {
        paddle.x = game.width - widthPaddle;
    }

    if (ballOnPaddle) {
        ball.body.x = paddle.x + widthPaddle / 2;
    } else {
        game.physics.arcade.collide(ball, paddle,
            collisionBallPaddle, null, this);
        // game.physics.arcade.collide(ball, bricks, collisionBallBricks, null, this);
    }
}

/**
 *
 */
function render() {
    game.debug.body(paddle);
    game.debug.body(bricks);
    game.debug.body(ball);
}

/**
 * Check this function///////////////////////////////////////////////////////////
 */
function ballOutOfBounds() {
    lives--;
    livesText.text = `Lives: ${lives}`;

    if (lives == 0) {
        // gameOver();
    } else {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);
    }
}

/**
 *
 */
function shootBall() {
    if (ballOnPaddle) {
        ballOnPaddle = false;
        ball.body.velocity.y = -300;
        ball.body.velocity.x = -75;
        insertCoinText.visible = false;
    }
}

/**
 *
 */
function collisionBallPaddle() {
    let diff = 0;

    if (ball.x < paddle.centerX) {
        // Ball is on the left-hand side of the paddle
        diff = paddle.centerX - ball.x;
        ball.body.velocity.x = (-5 * diff);
    } else if (ball.x > paddle.x) {
        // Ball is on the right-hand side of the paddle
        diff = ball.x - paddle.x;
        ball.body.velocity.x = (5 * diff);
    } else {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        ball.body.velocity.x = 2 + Math.random() * 8;
    }
}

/**
 * Function called when the canvas was defined, and initialize the
 * globals params
 */
function initializeParams() {
    let board = $('canvas')[0];

    screenWidth = board.width;
    screenHeight = board.height;

    heightPaddlePosition = screenHeight - (screenHeight * 0.25);

    // Columns number according
    columns = Math.floor(screenWidth / brickWidth) - 2;

    // Distance from bricks to the left and right bounds
    let decPart = (screenWidth / brickWidth + '').split('.')[1];
    decPart = parseFloat('0.' + decPart);
    distanceWithLateralBounds = ((decPart * brickWidth) / 2) + 32;

    distanceWithTopBound = screenHeight * 0.1;

    widthPaddlePosition = game.world.centerX - (widthPaddle / 2);

    heightBallPosition = heightPaddlePosition - heightBall / 2;

    sizeText = screenWidth * 0.04;

    heightTextPosition = screenHeight - sizeText - 10;

    widthTextLivesPosition = screenWidth - sizeText * 8.5;
}
