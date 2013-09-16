/**
 * Singleton class that handles the taskbar for the host
 */

function TaskBar() {};

// Elements that comprise the task bar - we set them to variables to promote maintainability
TaskBar.startElement = "#start";
TaskBar.haltElement = "#halt";
TaskBar.resetElement = "#reset";
TaskBar.statusElement = "#status";
TaskBar.dateTimeElement = "#date-time";

// Handles the transition of the taskbar to the inactive state. The inactive state occurs
// before the start button has been clicked.
TaskBar.enterInactiveState = function() {
    $(TaskBar.statusElement).removeClass("btn-success").addClass("btn-danger");
    $(TaskBar.startElement).prop("disabled", false);
    $(TaskBar.haltElement).prop("disabled", true);
    $(TaskBar.resetElement).prop("disabled", true);
    $(TaskBar.dateTimeElement).find("span").html("Unavailable").hide().fadeIn();
    $(TaskBar.startElement).focus();
    TaskBar.setStatus("Off");
};

// Handles the transition of the taskbar to the error state. The error state occurs when 
// the kernel traps and error.
TaskBar.enterErrorState = function() {
    $(TaskBar.statusElement).removeClass("btn-success").addClass("btn-danger");
    $(TaskBar.startElement).prop("disabled", true);
    $(TaskBar.haltElement).prop("disabled", true);
    $(TaskBar.resetElement).prop("disabled", false);
    $(TaskBar.dateTimeElement).find("span").html("Unavailable").hide().fadeIn();
    $(TaskBar.resetElement).focus();
};

// Handles the transition of the taskbar to the active state. The active state occurs right
// after the operating system has been initialized.
TaskBar.enterActiveState = function() {
    $(TaskBar.statusElement).removeClass("btn-danger").addClass("btn-success");
    $(TaskBar.startElement).prop("disabled", true);
    $(TaskBar.haltElement).prop("disabled", false);
    $(TaskBar.resetElement).prop("disabled", false);
    TaskBar.setStatus("On");
};

// Sets the status of the task bar - with a pretty fade!   
TaskBar.setStatus = function(status) {
    $(TaskBar.statusElement).find("span").html(toTitleCase(status)).hide().fadeIn();
};

// Updates the date and time using moment.js
TaskBar.updateDateTime = function() {
    $(TaskBar.dateTimeElement).find("span").html(moment().format("ddd, MMM Do YYYY, h:mm:ss a"));
};