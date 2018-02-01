/*
    globals Phaser, rows, columns, screenWidth, screenHeight,
    heightPaddlePosition, widthPaddlePosition, brickWidth,
    brickHeight, distanceWithLateralBounds,
    distanceWithTopBound, distanceBetweenBricks,
    widthPaddle, $, heightBallPosition, heightBall,
    heightTextPosition, widthTextLivesPosition
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

let lives = 3;

let score = 0;

/**
 *
 */
function preload() {
    game.load.atlas('bricks', 'BreakOut/resources/breakout.png',
        'BreakOut/resources/breakout.json');
    game.load.image('background', 'BreakOut/resources/background.jpg');
    game.load.image('paddle', 'BreakOut/resources/paddle.png');
    game.load.bitmapFont('atari',
    'BreakOut/resources/Atari.png', 'BreakOut/resources/Atari.fnt');
}

/**
 *
 */
function create() {
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
    // https://www.joshmorony.com/adding-custom-fonts-to-your-phaser-game/
    game.add.bitmapText(10, heightTextPosition, 'atari', 'Score: 0', sizeText);
    game.add.bitmapText(widthTextLivesPosition, heightTextPosition,
        'atari', 'Lives: 0', sizeText);
    game.add.bitmapText(distanceWithLateralBounds, game.world.centerY,
        'atari', 'INSERT COIN', 40);
    // </Text>
}

/**
 *
 */
function update() {

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
    livesText.text = 'lives: ' + lives;

    if (lives === 0) {
        gameOver();
    } else {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);

        ball.animations.stop();
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

    widthTextLivesPosition = screenWidth - 130;
}
