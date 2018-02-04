/*
    globals $, score, retry, mute
*/

/**
 * Array which contains the array with users
 */
let usersJson = [];

/**
 * Position in the array from the current user
 */
let userId;

/**
 * Load the name user
 */
let name;

/**
 * Load the title user
 */
let title;

/**
 * Load the email user
 */
let email;

/**
 * Load the avatar user
 */
let avatar;

/**
 * Initial modal, Sign Up form
 */
let $modalForm;

/**
 * Modal with the users ranking
 */
let $modalRanking;

/**
 * Warning modal which appears when you try retry the game
 */
let $modalRetry;

/**
 * Button to toggle the music mute
 */
let $mute;

$(document).ready(function() {
    $modalForm = $('#modalForm');
    $modalRanking = $('#modalRanking');
    $modalRetry = $('#modalWarningRetry');
    $mute = $('#mute');

    initializeModals();

    $modalForm.modal('open');
    // Initialize selects
    $('select').material_select();

    // Handlers to submit the form
    let $form = $('#signForm');
    $modalForm.find('#submit').on('click', function() {
        $form.submit();
    });
    $modalForm.on('keydown', function(event) {
        if (event.which == 13) {
            $form.submit();
        }
    });

    // Listeners to the form submit, and the click on retry
    $form.on('submit', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (localStorage.users != undefined) {
            usersJson = downFromLocalStorage('users');
        }
        userId = usersJson.length;
        name = $('#name').val();
        title = $('#title').val();
        email = $('#email').val();
        avatar = $('#avatar').val();

        if ($form[0].checkValidity()) {
            registerUser();
            loadNavBar();
            $modalForm.modal('close');
        }
        updateScore();
        sortUsersByScore();
    });
    $modalRetry.find('#retry').on('click', function() {
        retry();
        $modalRetry.modal('close');
    });
    $mute.on('click', function() {
        mute();
        let icon = $(this).find('i');
        if (icon.text() != 'volume_mute' ) {
            icon.text('volume_mute');
        } else {
            icon.text('volume_up');
        }
    });
});

/**
 * Set the modal params
 */
function initializeModals() {
    $modalForm.modal({
        dismissible: false,
        opacity: 1,
        inDuration: 300,
        outDuration: 200,
        startingTop: '4%',
        endingTop: '10%',
    });
    $modalRanking.modal({
        dismissible: true,
        opacity: .5,
        inDuration: 300,
        outDuration: 200,
        startingTop: '4%',
        endingTop: '10%',
    });
    $modalRetry.modal({
        dismissible: true,
        opacity: .5,
        inDuration: 300,
        outDuration: 200,
        startingTop: '4%',
        endingTop: '10%',
    });
}

/**
 * Push in the users array, the current user and upload to LocalStorage
 * This function is called from the form submit
 */
function registerUser() {
    usersJson.push({
            name: name,
            title: title,
            email: email,
            avatar: `resources/avatar_${avatar}.png`,
            score: score,
        }
    );
    loadStorage(usersJson, 'users');
}

/**
 * Update the score to the current user
 * This function is called when yo pass to the next level, when you win,
 * and when you lose
 */
function updateScore() {
    usersJson = downFromLocalStorage('users');
    usersJson[userId].score = score;
    loadStorage(usersJson, 'users');
}

/**
 * Sort all the array according the score, major to minor
 */
function sortUsersByScore() {
    usersJson = downFromLocalStorage('users');
    usersJson.sort(function(a, b) {
        let x = a.score;
        let y = b.score;
        if (x > y) {
            return -1;
        }
        if (x < y) {
            return 1;
        }
        return 0;
    });
    loadStorage(usersJson, 'users');
    loadRanking();
}

/**
 * Load the navbar with the current user data
 */
function loadNavBar() {
    $('#avatarContent').attr('src', `resources/avatar_${avatar}.png`);
    $('#nameContent').text(`${name} ${title}`);
}

/**
 * Load the modal ranking with the HTML
 */
function loadRanking() {
    let $container = $modalRanking.find('.collection');
    let cont = 1;
    $container.empty();
    for (const key in usersJson) {
        if (usersJson.hasOwnProperty(key)) {
            const element = usersJson[key];
            let $html = $(
                `<li class="collection-item avatar">
                    <img src="${element.avatar}" class="circle">
                    <span class="title">${element.name}</span>
                    <p>
                        ${element.title}
                        <br/>
                        #${cont}
                    </p>
                    <a class="secondary-content">${element.score} puntos</a>
                </li>`
            );
            $container.append($html);
        }
        cont++;
    }
}

/**
 * Download the localStorage a item, no check if exist
 * @param {String} item to download
 * @return {Object}
 */
function downFromLocalStorage(item) {
    return JSON.parse(localStorage.getItem(item));
}

/**
 * Upload to localStorage a item
 * @param {Object} item to upload, will be stringify
 * @param {String} name which will be identified the Object in the localStorage
 */
function loadStorage(item, name) {
    localStorage.setItem(name, JSON.stringify(item));
}
