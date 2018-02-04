/*
    globals Phaser, screenWidth, screenHeight,
    heightPaddlePosition, widthPaddlePosition, brickWidth,
    brickHeight, distanceWithLateralBounds, updateScore, sortUsersByScore,
    distanceWithTopBound, widthPaddle, $, heightBallPosition,
    heightBall, heightTextPosition, widthTextLivesPosition, sizeText
*/

/**
 * Variable which contain the game
 */
let game = new Phaser.Game(500, 700, Phaser.AUTO, 'game', {
    preload: preload,
    create: create,
    update: update,
    render: render,
});

/**
 * Object paddle
 */
let paddle;

/**
 * Object group bricks
 */
let bricks;

/**
 * Object ball
 */
let ball;

/**
 * Boolean which tell us if the ball is on the paddle
 */
let ballOnPaddle = true;

/**
 * Lives count
 */
let lives = 3;

/**
 * Store the score
 */
let score = 0;

/**
 * Object text from Phaser, store the initial text
 */
let insertCoinText;

/**
 * Object text from Phaser, store the lives text
 */
let livesText;

/**
 * Object text from Phaser, store the score text
 */
let scoreText;

/**
 * Store the brick's count, since the ball is out the paddle, until the ball
 * return the paddle. Use it to apply the bonus
 */
let countBricks = 0;

let currentLevel = 0;

/**
 * Object which contains the level structure, is loaded in loadLevels function
 */
let breakoutLevels;

/**
 * Object audio from Phaser, which store the sound of a brick death
 */
let brickDeath;

/**
 * Object audio from Phaser, which store the sound when the ball hit the paddle
 */
let numKey;

/**
 * Object audio from Phaser, which store the sound of Game Over
 */
let playerDeath;

/**
 * Object audio from Phaser, which store the sound of background
 */
let backgroundMusic;

/**
 * Load all the resources needed by the game
 * Sprites, audios and levels
 */
function preload() {
    game.load.atlas('bricks', 'resources/breakout.png',
        'resources/breakout.json');
    game.load.image('background', 'resources/background.jpg');
    game.load.image('paddle', 'resources/paddle.png');
    game.load.bitmapFont('atari',
        'resources/Atari.png', 'resources/Atari.fnt');

    game.load.audio('brickDeath', [
        'resources/sfx/brickDeath.mp3',
        'resources/sfx/brickDeath.ogg',
        'resources/sfx/brickDeath.wav',
    ]);
    game.load.audio('numKey', [
        'resources/sfx/numkey.wav',
    ]);
    game.load.audio('playerDeath', [
        'resources/sfx/player_death.wav',
    ]);
    game.load.audio('backgroundMusic', [
        'resources/sfx/bodenstaendig_2000_in_rock_4bit.ogg',
        'resources/sfx/bodenstaendig_2000_in_rock_4bit.mp3',
    ]);

    loadLevels();
}

/**
 * Initialize all the elements which interact in the game
 */
function create() {
    // Start physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.checkCollision.down = false;

    // Add background image
    game.add.sprite(0, 0, 'background');

    // Start params needed to the positions
    initializeParams();
    createSoundsAndMusic();
    backgroundMusic.loopFull(.5);

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
 * Moves the bricks, update the paddle position, control the limits to the ball
 * and listen the collides between the ball, the paddle, and bricks
 */
function update() {
    moveBricks();
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
 * Help to see the elements body
 */
function render() {
    // game.debug.body(paddle);
    // game.debug.body(bricks);
    // game.debug.body(ball);
}

/**
 * Handler if the ball out the bottom bound
 * redirect to game over or put the ball on the paddle
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
 * Fire this function when click and the ball is on the paddle
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
 * Update the score with the bonus, and manage the bounce angle of the ball
 */
function collisionBallPaddle() {
    let diff = 0;
    numKey.play();
    if (countBricks > 1) {
        score += (10 * countBricks);
        scoreText.text = `Score: ${score}`;
    }
    countBricks = 0;
    if (ball.x < paddle.centerX) {
        // Left
        diff = paddle.centerX - ball.x;
        ball.body.velocity.x = (-8 * diff);
    } else if (ball.x > paddle.x) {
        // Right
        diff = ball.x - paddle.x;
        ball.body.velocity.x = (8 * diff);
    }
}

/**
 * Kill the brick, update the score and manage the remaining number of bricks,
 * to redirect you to the next level
 * @param {Object} _ball Useless
 * @param {Object} brick Kicked brick
 */
function collisionBallBricks(_ball, brick) {
    brick.kill();
    brickDeath.play();
    countBricks++;

    if (isCrazyBrick(brick)) {
        let random;
        do {
            random = getRandomInt(0, 361);
        } while (random == 0 || random == 180);
        game.physics.arcade.velocityFromAngle(random, 300, ball.body.velocity);
    }
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

        //  And bring the bricks back from the dead
        nextLevel();
        game.input.onDown.add(shootBall, this);
    }
}

/**
 * If true, the ball will bounce to the random angle
 * @param {Object} brick Kicked brick
 * @return {boolean}
 */
function isCrazyBrick(brick) {
    let isCrazy = false;
    let arrayFrameName = brick.frameName.split('_');

    if (arrayFrameName[1] == '5') {
        isCrazy = true;
    }
    return isCrazy;
}

/**
 * Update the ranking with the current score, and manage if you win,
 * or go to the next level
 */
function nextLevel() {
    updateScore();
    sortUsersByScore();
    if (currentLevel >= 3) {
        gameWin();
    }
    if (currentLevel <= 2) {
        currentLevel++;
        printLevel(currentLevel);
    }
}

/**
 * Update the ranking, and put the game in state of GameOver, you can't no play
 */
function gameOver() {
    playerDeath.play();
    updateScore();
    sortUsersByScore();
    ball.body.velocity.setTo(0, 0);
    insertCoinText.text = 'Game Over!';
    insertCoinText.visible = true;
}

/**
 * Put the game in state of Win, you can't no play
 */
function gameWin() {
    ball.body.velocity.setTo(0, 0);
    insertCoinText.text = 'You Win!';
    insertCoinText.visible = true;
    ball.visible = false;
    paddle.visible = false;
    bricks.visible = false;
}

/**
 * Draw and load the array with the levels
 */
function loadLevels() {
    currentLevel = 0;

    let r = 'red';
    let b = 'blue';
    let o = 'orange';
    let g = 'green';
    let c = 'crazy';
    let X = null;

    breakoutLevels = [
        // {
        //     name: 'letsa begin',
        //     bricks: [
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, X, X],
        //         [X, X, X, X, X, X, X, X, X, X, X, r, X],
        //     ],
        //     powerUps: 1,
        //     powerDowns: 1,
        // },
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
                [o, o, c, c, c, c, c, c, c, c, c, o, o],
            ],
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
        },
    ];
}

/**
 * Read the level, and print it, also prepares them to read the brick name
 * @param {Integer} level Level which wants print
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
                } else if (color == 'crazy') {
                    bID = 5;
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
 * Animation to moves the bricks
 * When the bricks is on the 0 x position, go to the right and vice versa
 */
function moveBricks() {
    if (bricks.x == 0) {
        game.add.tween(bricks).to(
            {x: distanceWithLateralBounds},
            2000, Phaser.Easing.Linear.None, true, 0, 1000, true
        );
    } else if (bricks.x == distanceWithLateralBounds) {
        game.add.tween(bricks).to(
            {x: -distanceWithLateralBounds},
            2000, Phaser.Easing.Linear.None, true, 0, 1000, true
        );
    }
}

/**
 * Put all the vars and objects to 0, and initial position to retry the game
 */
function retry() {
    ball.reset(game.world.centerX, heightBallPosition);
    ballOnPaddle = true;
    lives = 3;
    livesText.text = 'Lives: 3';
    score = 0;
    scoreText.text = 'Score: 0';
    insertCoinText.text = 'INSERT COIN';
    insertCoinText.visible = true;
    currentLevel = 0;
    ball.visible = true;
    paddle.visible = true;
    bricks.visible = true;
    printLevel(0);
}

/**
 * Load the sounds vars
 */
function createSoundsAndMusic() {
    brickDeath = game.add.audio('brickDeath');
    numKey = game.add.audio('numKey');
    playerDeath = game.add.audio('playerDeath');
    backgroundMusic = game.add.audio('backgroundMusic');
}

/**
 * Toggle the music mute
 */
function mute() {
    if (!backgroundMusic.mute) {
        backgroundMusic.mute = true;
    } else {
        backgroundMusic.mute = false;
    }

    if (!brickDeath.mute) {
        brickDeath.mute = true;
    } else {
        brickDeath.mute = false;
    }

    if (!numKey.mute) {
        numKey.mute = true;
    } else {
        numKey.mute = false;
    }

    if (!playerDeath.mute) {
        playerDeath.mute = true;
    } else {
        playerDeath.mute = false;
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

/**
 * Get a random
 * @param {Integer} min Min number, included
 * @param {Integer} max Max number, excluded
 * @return {Integer} Random number between the params
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
