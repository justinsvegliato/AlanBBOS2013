/** 
 * Requires globals.js
 *
 * The OS Console - stdIn and stdOut by default.
 * 
 * Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or 
 * interpreter for this console.
 */

// Instantiates the console with values derived from the display driver
function Console() {
    // Properties
    this.font = Display.FONT_FAMILY;
    this.fontSize = Display.FONT_SIZE;
    this.fontHeightMargin = Display.FONT_HEIGHT_MARGIN;
    this.xPosition = 0;
    this.yPosition = Display.FONT_SIZE;

    this.buffer = "";
    this.outputHistory = [];
    this.filters = [];
    
    this.init();
};

// 
// Methods
//

// Initializes the console by reseting the coordinates and clearing the screen
Console.prototype.init = function() {
    this.clearScreen();
    this.resetXY();
};

// Clears the screen
Console.prototype.clearScreen = function() {
    // Draws a rectangle the size of the canvas
    Display.drawingContext.clearRect(0, 0, Display.canvas.width, Display.canvas.height);
};

// Resets the XY positions
Console.prototype.resetXY = function() {
    this.xPosition = 0;
    this.yPosition = this.fontSize;
};

// Handles the user input 
Console.prototype.handleInput = function() {
    // Only iterate the there is input in the input queue
    while (Kernel.inputQueue.getSize() > 0) {
        // Take the first character off the input queue
        var chr = Kernel.inputQueue.dequeue();
        
        // Check if it's enter, backspace, left or right arrow, and lastly if it's any other key
        if (chr === String.fromCharCode(13)) {
            // Handle the input and reset the buffer since the input was handled
            this.handleRequest(this.buffer);
            Kernel.shell.handleInput(this.buffer);
            this.buffer = "";
        } else if (chr === String.fromCharCode(8)) {
            // Removes the last character from the screen and decreases the buffer by a character
            this.removeText(this.buffer.charAt(this.buffer.length - 1));
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
        } else if ((chr === String.fromCharCode(38)) || (chr === String.fromCharCode(40))) {
            // Removes data currently in the buffer to replace it with previous command
            this.removeText(this.buffer);
            
            // Grabs the previous command, stores it into the buffer, and displays the data
            var pastCommand = Kernel.shell.traverseHistory(chr);
            this.buffer = pastCommand;
            this.putText(this.buffer);
        } else {
            // Otherwise print the characters to the screen while adding to the buffer
            this.putText(chr);
            this.buffer += chr;
        }
    }
};

// Displays the specified text on the screen
Console.prototype.putText = function(text) {
    if (text) {
        // Draw the text at the current X and Y coordinates
        Display.drawingContext.drawText(this.font, this.fontSize, this.xPosition, this.yPosition, text);

        // Move the current X position forward
        var offset = Display.drawingContext.measureText(this.font, this.fontSize, text);
        this.xPosition = this.xPosition + offset;
    }
};
    
// Remvoves the specified text from the screen
Console.prototype.removeText = function(text) {
    if (text !== "") {
        // Move the current X position backward
        var offset = Display.drawingContext.measureText(this.font, this.fontSize, text);
        this.xPosition = this.xPosition - offset;

        // Draw a rectangle over the last character in the buffer
        Display.drawingContext.clearRect(this.xPosition, this.yPosition - this.fontSize, offset, this.fontSize * 2);
    }
};

// Handles a request, where a request is merely just user input
Console.prototype.handleRequest = function(line) {
    this.outputHistory.push(Kernel.shell.promptStr + line);
    return true;
};

// Checks if the response, i.e., the data returned from the execution of a command, is valid
Console.prototype.isValid = function(line) {
    // Iterate through the filters specified by the 'filter' command to determine
    // if the data in question should be printed to the screen
    var isValid = true;
    $.each(this.filters, function(index, value) {
        if (isValid) {
            isValid = line.match(value);
        }
    });
    return isValid;
};

// Handles the response returned by the execution of a command
Console.prototype.handleResponse = function(line) {
    // Only print the command if it is valid according to the currently specified filters
    if (line && this.isValid(line)) {
        this.putText(line);
        this.outputHistory.push(line);                        
    }
    return this.isValid(line);
};

// Advances the line and scrolls the screen if necessary
Console.prototype.advanceLine = function() {
    this.xPosition = 0;
    this.yPosition += this.fontSize + this.fontHeightMargin;
    this.handleScrolling();
};

// Handles the scrolling of the screen by using an array that keeps track of all commands
// that have been entered. 
Console.prototype.handleScrolling = function () {
    // The max line length is the number of lines that can fit onto the canvas
    var maxLineLength = Math.floor(Display.HEIGHT / (this.fontSize + this.fontHeightMargin)) + 1;
    
    // If the output history is longer than the number of lines that can fit onto the canvas
    if (this.outputHistory.length > maxLineLength) {
        // Reduce output history by the differential amount
        this.outputHistory = this.outputHistory.slice(this.outputHistory.length - maxLineLength);
        
        // Clear the screen and reset the coordinates
        this.resetXY();
        this.clearScreen();
        
        // Redraw the screen with the adjusted output history
        for (var i = 1; i < this.outputHistory.length; i++) {
            Display.drawingContext.drawText(this.font, this.fontSize, this.xPosition, this.yPosition, this.outputHistory[i]);
            this.yPosition += this.fontSize + this.fontHeightMargin;
        }
    }
};