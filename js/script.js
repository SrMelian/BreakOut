/*
    globals $, score
*/

let usersJson = [];

let userId;

let name;

let title;

let email;

let avatar;

$(document).ready(function() {
    let $modalForm = $('#modalForm');
    let $modalRanking = $('#modalRanking');

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
    $modalForm.modal('open');
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
    });
});

/**
 *
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
 *
 */
function updateScore() {
    usersJson = downFromLocalStorage('users');
    usersJson[userId].score = score;
    loadStorage(usersJson, 'users');
}

/**
 *
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
}

/**
 *
 */
function loadNavBar() {
    $('#avatarContent').attr('src', `resources/avatar_${avatar}.png`);
    $('#nameContent').text(`${name} ${title}`);
}

/**
 *
 * @param {*} item
 * @return {*}
 */
function downFromLocalStorage(item) {
    return JSON.parse(localStorage.getItem(item));
}

/**
 *
 * @param {*} element
 * @param {*} name
 */
function loadStorage(element, name) {
    localStorage.setItem(name, JSON.stringify(element));
}
