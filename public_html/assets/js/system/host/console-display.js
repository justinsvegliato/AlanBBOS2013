/**
 * Singleton class that handles the display for the host
 */

function ConsoleDisplay() {};

// Necessary canvas variables
ConsoleDisplay.canvas = null;
ConsoleDisplay.drawingContext = null;

// Basic default variables
ConsoleDisplay.FONT_FAMILY = "arial";
ConsoleDisplay.FONT_SIZE = 13;
ConsoleDisplay.FONT_HEIGHT_MARGIN = 4;
ConsoleDisplay.HEIGHT = 505;
ConsoleDisplay.WIDTH = 515;

// Creates the canvas by getting the canvas via the ID and the context
ConsoleDisplay.createCanvas = function() {
    ConsoleDisplay.canvas = document.getElementById('display');
    ConsoleDisplay.drawingContext = ConsoleDisplay.canvas.getContext('2d');
    CanvasTextFunctions.enable(ConsoleDisplay.drawingContext);
};

// Handles the transition of the display to the active state. The active state occurs right
// after the operating system has been initialized.
ConsoleDisplay.enterActiveState = function() {
    $("#display").focus();
    // TODO: More...
};

// Handles the transition of the display to the error state. The error state occurs when 
// the kernel traps and error.
ConsoleDisplay.enterErrorState = function() {
    $("#display").css("display", "none");
    $("#display-container").css("background-image", "url('assets/img/bsod.png')");
    $("#display-container").css("background-size", "515px 535px");
};