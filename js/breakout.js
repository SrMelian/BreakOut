/*
    globals Phaser, rows, columns, screenWidth, screenHeight,
    heightPaddlePosition, widthPaddlePosition, brickWidth,
    brickHeight, distanceWithLateralBounds,
    distanceWithTopBound, distanceBetweenBricks,
    widthPaddle, $, heightBallPosition, heightBall,
    heightTextPosition, widthTextLivesPosition, sizeText
*/
let game = new Phaser.Game(500, 700, Phaser.AUTO, 'game', {
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

let scoreText;

let countBricks = 0;

let currentLevel = 0;

let breakoutLevels;

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
    loadLevels();
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
    printLevel(0);
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
    scoreText = game.add.text(10, heightTextPosition, 'Score: 0', {
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
        game.physics.arcade.collide(ball, bricks,
            collisionBallBricks, null, this);
    }
}

/**
 *
 */
function render() {
    // game.debug.body(paddle);
    // game.debug.body(bricks);
    // game.debug.body(ball);
}

/**
 *
 */
function ballOutOfBounds() {
    countBricks = 0;
    lives--;
    livesText.text = `Lives: ${lives}`;

    if (lives == 0) {
        gameOver();
    } else {
        ballOnPaddle = true;
        ball.reset(game.world.centerX, heightBallPosition);
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
    if (countBricks > 1) {
        score += (10 * countBricks);
        scoreText.text = `Score: ${score}`;
    }
    countBricks = 0;
    if (ball.x < paddle.centerX) {
        // Left
        diff = paddle.centerX - ball.x;
        ball.body.velocity.x = (-5 * diff);
    } else if (ball.x > paddle.x) {
        // Right
        diff = ball.x - paddle.x;
        ball.body.velocity.x = (5 * diff);
    } else {
        // Center
        ball.body.velocity.x = 2 + Math.random() * 8;
    }
}

/**
 *
 * @param {*} _ball
 * @param {*} brick
 */
function collisionBallBricks(_ball, brick) {
    brick.kill();
    countBricks++;

    score += 10;
    scoreText.text = `Score: ${score}`;

    if (bricks.countLiving() == 0) {
        score += 200 * lives;
        scoreText.text = 'score: ' + score;
        insertCoinText.text = 'NEXT LEVEL';
        insertCoinText.visible = true;

        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;

        //  And bring the bricks back from the dead :)
        nextLevel();
        game.input.onDown.add(shootBall, this);
    }
}

/**
 *
 */
function nextLevel() {
    if (currentLevel >= 3) {
        gameWin();
    }
    if (currentLevel <= 2) {
        currentLevel++;
        printLevel(currentLevel);
    }
}

/**
 *
 */
function gameOver() {
    ball.body.velocity.setTo(0, 0);
    insertCoinText.text = 'Game Over!';
    insertCoinText.visible = true;
}

/**
 *
 */
function loadLevels() {
    currentLevel = 0;

    let r = 'red';
    let b = 'blue';
    let o = 'orange';
    let g = 'green';
    let X = null;

    // you can uncoment the dev level and or/add a level of your own
    // powerUps are not picked from the values bellow but set
    // with: this.dropItemLimit
    breakoutLevels = [
        {
            name: 'letsa begin',
            bricks: [
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, X, X],
                [X, X, X, X, X, X, X, X, X, X, X, o, X],
            ],
            powerUps: 1,
            powerDowns: 1,
        },
        {
            name: 'letsa begin',
            bricks: [
                [r, r, r, r, r, r, r, r, r, r, r, r, r],
                [X, X, r, X, X, r, X, X, r, X, X, r, X],
                [X, r, r, X, r, r, X, r, r, X, r, r, X],
                [X, X, r, X, X, r, X, X, r, X, X, r, X],
                [g, g, g, g, g, g, g, g, g, g, g, g, g],
                [X, g, X, X, g, X, X, g, X, X, g, X, X],
                [X, g, g, X, g, g, X, g, g, X, g, g, X],
                [X, g, X, X, g, X, X, g, X, X, g, X, X],
                [o, o, o, o, o, o, o, o, o, o, o, o, o],
                [X, X, o, X, X, o, X, X, o, X, X, o, X],
                [X, o, o, X, o, o, X, o, o, X, o, o, X],
                [X, X, o, X, X, o, X, X, o, X, X, o, X],
                [o, o, r, r, r, r, r, r, r, r, r, o, o],
            ],
            powerUps: 1,
            powerDowns: 1,
        },
        {
            name: 'how\'s it going?',
            bricks: [
                [r, r, r, r, r, r, r, r, r, r, r, r, r],
                [r, X, X, X, X, X, X, X, X, X, X, X, r],
                [r, X, o, o, o, o, o, o, o, o, o, X, r],
                [r, X, X, X, X, X, o, X, X, X, X, X, r],
                [r, r, r, r, X, X, o, X, X, r, r, r, r],
                [X, X, X, X, X, X, o, X, X, X, X, X, X],
                [r, r, r, r, X, X, o, X, X, r, r, r, r],
                [r, X, X, X, X, X, o, X, X, X, X, X, r],
                [r, X, b, b, b, b, o, b, b, b, b, X, r],
                [r, X, X, X, X, X, X, X, X, X, X, X, r],
                [r, X, g, g, g, g, X, g, g, g, g, X, r],
                [r, X, g, X, X, g, X, g, X, X, g, X, r],
                [r, X, g, g, X, g, X, g, X, g, g, X, r],
                [r, X, X, X, X, g, X, g, X, X, X, X, r],
                [r, X, g, g, g, g, X, g, g, g, g, X, r],
            ],
            powerUps: 1,
            powerDowns: 1,
        },
        {
            name: 'tie fighta!',
            bricks: [
                [X, X, X, X, r, X, X, X, r, X, X, X, X],
                [X, X, X, r, r, X, X, X, r, r, X, X, X],
                [X, X, r, r, X, X, b, X, X, r, r, X, X],
                [X, r, r, X, X, X, X, X, X, X, r, r, X],
                [X, r, X, X, X, X, b, X, X, X, X, r, X],
                [X, r, X, X, X, b, b, b, X, X, X, r, X],
                [X, r, X, X, b, b, o, b, b, X, X, r, X],
                [X, r, X, X, X, b, b, b, X, X, X, r, X],
                [X, r, X, X, X, X, b, X, X, X, X, r, X],
                [X, r, X, X, X, X, b, X, X, X, X, r, X],
                [X, r, r, X, X, X, X, X, X, X, r, r, X],
                [X, X, r, r, X, X, b, X, X, r, r, X, X],
                [X, X, X, r, r, X, X, X, r, r, X, X, X],
                [X, X, X, X, r, X, X, X, r, X, X, X, X],
            ],
            powerUps: 2,
            powerDowns: 2,
        },
        {
            name: 'swirl',
            bricks: [
                [X, X, X, X, X, b, X, b, X, X, X, X, X],
                [r, X, b, b, X, b, b, b, X, b, b, X, r],
                [X, X, X, b, b, b, b, b, b, b, X, X, X],
                [X, X, b, b, b, X, b, X, b, b, b, X, X],
                [X, X, X, b, b, X, b, X, b, b, X, X, X],
                [r, X, b, b, r, r, b, r, r, b, b, X, r],
                [r, X, X, X, r, r, b, r, r, X, X, X, r],
                [r, X, X, X, r, r, b, r, r, X, X, X, r],
                [r, X, b, b, r, r, b, r, r, b, b, X, r],
                [X, X, X, b, b, X, b, X, b, b, X, X, X],
                [X, X, b, b, b, X, b, X, b, b, b, X, X],
                [X, X, X, b, b, b, b, b, b, b, X, X, X],
                [r, X, b, b, X, b, b, b, X, b, b, X, r],
                [X, X, X, X, X, b, X, b, X, X, X, X, X],
            ],
            powerUps: 2,
            powerDowns: 3,
        },
    ];
}

/**
 * populateLevel
 * @param {*} level
 */
function printLevel(level) {
    if (bricks) {
        bricks.destroy();
    }
    bricks = game.add.group();
    bricks.enableBody = true;

    let Level = breakoutLevels[level];

    for (let y = 0; y < Level.bricks.length; ++y) {
        for (let x = 0; x < Level.bricks[y].length; ++x) {
            let color = Level.bricks[y][x];

            if (color) {
                let tempBrick;

                let bID = 1;
                if (color == 'red') {
                    bID = 3;
                } else if (color == 'blue') {
                    bID = 1;
                } else if (color == 'orange') {
                    bID = 2;
                } else if (color == 'green') {
                    bID = 4;
                }
                tempBrick = bricks.create(
                    x * brickWidth + distanceWithLateralBounds,
                    y * brickHeight + distanceWithTopBound,
                    'bricks', 'brick_' + bID + '_1.png'
                );

                let tempCount = 0;
                if (bricks.countLiving() > 0) {
                    tempCount = bricks.countLiving();
                }
                tempBrick.name = 'brick' + (tempCount + 1);
                tempBrick.frameName = 'brick_' + bID + '_1.png';

                tempBrick.body.bounce.setTo(1);
                tempBrick.body.immovable = true;

                bricks.add(tempBrick);
            }
        }
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
