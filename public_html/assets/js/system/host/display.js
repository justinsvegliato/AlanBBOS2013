/**
 * Singleton class that handles the display for the host
 */

function Display() {};

// Necessary canvas variables
Display.canvas = null;
Display.drawingContext = null;

// Basic default variables
Display.FONT_FAMILY = "arial";
Display.FONT_SIZE = 13;
Display.FONT_HEIGHT_MARGIN = 4;
Display.HEIGHT = 420;
Display.WIDTH = 515;

// Creates the canvas by getting the canvas via the ID and the context
Display.createCanvas = function() {
    Display.canvas = document.getElementById('display');
    Display.drawingContext = Display.canvas.getContext('2d');
    CanvasTextFunctions.enable(Display.drawingContext);
};

// Handles the transition of the display to the active state. The active state occurs right
// after the operating system has been initialized.
Display.enterActiveState = function() {
    $("#display").focus();
    // TODO: More...
};

// Handles the transition of the display to the error state. The error state occurs when 
// the kernel traps and error.
Display.enterErrorState = function() {
    $("#display").css("display", "none");
    $("#display-container").css("background-image", "url('assets/img/bsod.png')");
    $("#display-container").css("background-size", "525px 450px");
};