/**
 * Singleton class that handles the taskbar for the host
 */

function TaskBarDisplay() {};

// Elements that comprise the task bar - we set them to variables to promote maintainability
TaskBarDisplay.startElement = "#start";
TaskBarDisplay.haltElement = "#halt";
TaskBarDisplay.resetElement = "#reset";
TaskBarDisplay.statusElement = "#status";
TaskBarDisplay.dateTimeElement = "#date-time";

// Handles the transition of the taskbar to the inactive state. The inactive state occurs
// before the start button has been clicked.
TaskBarDisplay.enterInactiveState = function() {
    $(TaskBarDisplay.statusElement).removeClass("btn-success").addClass("btn-danger");
    $(TaskBarDisplay.startElement).prop("disabled", false);
    $(TaskBarDisplay.haltElement).prop("disabled", true);
    $(TaskBarDisplay.resetElement).prop("disabled", true);
    $(TaskBarDisplay.dateTimeElement).find("span").html("Unavailable").hide().fadeIn();
    $(TaskBarDisplay.startElement).focus();
    TaskBarDisplay.setStatus("Off");
};

// Handles the transition of the taskbar to the error state. The error state occurs when 
// the kernel traps and error.
TaskBarDisplay.enterErrorState = function() {
    $(TaskBarDisplay.statusElement).removeClass("btn-success").addClass("btn-danger");
    $(TaskBarDisplay.startElement).prop("disabled", true);
    $(TaskBarDisplay.haltElement).prop("disabled", true);
    $(TaskBarDisplay.resetElement).prop("disabled", false);
    $(TaskBarDisplay.dateTimeElement).find("span").html("Unavailable").hide().fadeIn();
    $(TaskBarDisplay.resetElement).focus();
};

// Handles the transition of the taskbar to the active state. The active state occurs right
// after the operating system has been initialized.
TaskBarDisplay.enterActiveState = function() {
    $(TaskBarDisplay.statusElement).removeClass("btn-danger").addClass("btn-success");
    $(TaskBarDisplay.startElement).prop("disabled", true);
    $(TaskBarDisplay.haltElement).prop("disabled", false);
    $(TaskBarDisplay.resetElement).prop("disabled", false);
    TaskBarDisplay.setStatus("On");
};

// Sets the status of the task bar - with a pretty fade!   
TaskBarDisplay.setStatus = function(status) {
    $(TaskBarDisplay.statusElement).find("span").html(toTitleCase(status)).hide().fadeIn();
};

// Updates the date and time using moment.js
TaskBarDisplay.updateDateTime = function() {
    $(TaskBarDisplay.dateTimeElement).find("span").html(moment().format("ddd, MMM Do YYYY, h:mm:ss a"));
};