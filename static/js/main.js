// Bootstrap alert
alert = function () { }
alert.show = function (message) {
    $('#alert_placeholder').html('<div class="alert alert-danger m-0" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span> ' + message + '</div>');
}
alert.hide = function () {
    $('#alert_placeholder').html('');
}

// When everything is loaded
$(document).ready(function () {
    // Click button when hitting "enter"
    $('#websiteInput').keypress(function (e) {
        if (e.keyCode == 13)
            $('#websiteButton').click();
    });

    // On button click
    $('#websiteButton').click(function () {
        // Get website
        var website = $('#websiteInput').val();
        // If nothing entered, show alert
        if (website == "") {
            alert.hide();
            alert.show('Please enter a valid website.');
        } else {
            alert.hide();
            window.location = '/' + website
        }

        //website_sdk = website + "/public/ghost-sdk.min.js"

    });

});