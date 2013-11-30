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

// The height and width of the container
ConsoleDisplay.CONTAINER_HEIGHT = 457;
ConsoleDisplay.CONTAINER_WIDTH = 515;

// The height and width of the canvas
ConsoleDisplay.CANVAS_HEIGHT = 450;
ConsoleDisplay.CANVAS_WIDTH = 505;

// The margin of the canvas within the container
ConsoleDisplay.MARGIN_OFFSET = 20;

// The elements that correspond to the display
ConsoleDisplay.canvasElement = $("#display");
ConsoleDisplay.canvasContainer = $("#display-container");

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
};

// Handles the transition of the display to the error state. The error state occurs when 
// the kernel traps and error.
ConsoleDisplay.enterErrorState = function() {
    $("#display").css("display", "none");
    $("#display-container").css("background-image", "url('assets/img/bsod.png')");
    $("#display-container").css("background-size", "515px 535px");
};