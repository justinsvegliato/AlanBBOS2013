/**
 * Singleton class that handles the taskbar for the host
 */

function TaskBarDisplay() {};

// Elements that comprise the task bar - we set them to variables to promote maintainability
TaskBarDisplay.startStopElement = $("#start-stop");
TaskBarDisplay.startStopIcon = $("#start-stop-icon");
TaskBarDisplay.resetElement = $("#reset");
TaskBarDisplay.statusElement = $("#status");
TaskBarDisplay.dateTimeElement = $("#date-time");
TaskBarDisplay.startStepModeButton = $("#step-mode");
TaskBarDisplay.stepButton = $("#step");

// Handles the transition of the taskbar to the inactive state. The inactive state occurs
// before the start button has been clicked.
TaskBarDisplay.enterInactiveState = function() {
    TaskBarDisplay.startStopElement.removeClass("btn-danger").addClass("btn-success");
    TaskBarDisplay.startStopIcon.hide().fadeIn();
    TaskBarDisplay.startStopIcon.addClass("glyphicon-play").removeClass("glyphicon-stop");
    TaskBarDisplay.startStopElement.focus();

    TaskBarDisplay.statusElement.removeClass("btn-success").addClass("btn-danger");
    TaskBarDisplay.dateTimeElement.find("span").html("Unavailable").hide().fadeIn();
    TaskBarDisplay.setStatus("Off");

    TaskBarDisplay.startStepModeButton.prop("disabled", true);
};

// Handles the transition of the taskbar to the error state. The error state occurs when 
// the kernel traps and error.
TaskBarDisplay.enterErrorState = function() {
    TaskBarDisplay.startStopElement.prop("disabled", true);
    TaskBarDisplay.startStopIcon.hide().fadeIn();
    TaskBarDisplay.startStopElement.removeClass("btn-success").addClass("btn-danger");
    TaskBarDisplay.startStopIcon.addClass("glyphicon-ban-circle").removeClass("glyphicon-play");

    TaskBarDisplay.statusElement.removeClass("btn-success").addClass("btn-danger");
    TaskBarDisplay.dateTimeElement.find("span").html("Unavailable").hide().fadeIn();
    TaskBarDisplay.resetElement.focus();

    TaskBarDisplay.startStepModeButton.prop("disabled", true);
};

// Handles the transition of the taskbar to the active state. The active state occurs right
// after the operating system has been initialized.
TaskBarDisplay.enterActiveState = function() {
    TaskBarDisplay.startStopIcon.hide().fadeIn();
    TaskBarDisplay.startStopElement.removeClass("btn-success").addClass("btn-danger");
    TaskBarDisplay.startStopIcon.addClass("glyphicon-stop").removeClass("glyphicon-play");

    TaskBarDisplay.statusElement.removeClass("btn-danger").addClass("btn-success");
    TaskBarDisplay.setStatus("On");

    TaskBarDisplay.startStepModeButton.prop("disabled", false);
};

// Changes the task bar for when the OS is in step mode
TaskBarDisplay.startStepMode = function() {
    TaskBarDisplay.stepButton.prop("disabled", false);
    TaskBarDisplay.startStepModeButton.removeClass("btn-success").addClass("btn-danger").html("Exit Step Mode");
};

// Changes the task bar for when the OS is not in step mode
TaskBarDisplay.exitStepMode = function() {
    TaskBarDisplay.stepButton.prop("disabled", true);
    TaskBarDisplay.startStepModeButton.removeClass("btn-danger").addClass("btn-success").html("Enter Step Mode");
};

// Sets the status of the task bar - with a pretty fade!   
TaskBarDisplay.setStatus = function(status) {
    TaskBarDisplay.statusElement.find("span").html(toTitleCase(status)).hide().fadeIn();
};

// Updates the date and time using moment.js
TaskBarDisplay.updateDateTime = function() {
    TaskBarDisplay.dateTimeElement.find("span").html(moment().format("ddd, MMM Do YYYY, h:mm:ss a"));
};