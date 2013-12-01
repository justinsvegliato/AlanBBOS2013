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
    // These variables keep track of the current location on the screen
    this.xPosition = 0;
    this.yPosition = ConsoleDisplay.FONT_SIZE;   

    this.buffer = "";
    this.filters = [];
    
    this.init();
};

// 
// Methods
//

// Initializes the console by reseting the coordinates and clearing the screen
Console.prototype.init = function() {
    this.clearScreen();
    this.resetPosition();
};

// Clears the screen
Console.prototype.clearScreen = function() {
    ConsoleDisplay.drawingContext.clearRect(0, 0, ConsoleDisplay.canvas.width, ConsoleDisplay.canvas.height);
};

// Resets the XY positions
Console.prototype.resetPosition = function() {
    this.xPosition = 0;
    this.yPosition = ConsoleDisplay.FONT_SIZE;
};

// Resets the size of the canvas (this is called if cls is typed into the console)
Console.prototype.resetSize = function() {
    ConsoleDisplay.canvasElement.attr('height', ConsoleDisplay.CANVAS_HEIGHT - ConsoleDisplay.MARGIN_OFFSET);
    ConsoleDisplay.canvasElement.attr('width', ConsoleDisplay.CANVAS_WIDTH - ConsoleDisplay.MARGIN_OFFSET);
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
            Kernel.shell.handleInput(this.buffer);
            this.buffer = "";
        } else if (chr === String.fromCharCode(8)) {
            // Removes the last character from the screen and decreases the buffer by a character
            this.removeText(this.buffer.charAt(this.buffer.length - 1));
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
        } else if ((chr === "UP") || (chr === "DOWN")) {
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
        var lines = text.match(/.{1,15}/g);
        for (var i = 0; i < lines.length; i++) {
            // Draw the text at the current X and Y coordinates
            ConsoleDisplay.drawingContext.drawText(ConsoleDisplay.FONT_FAMILY, ConsoleDisplay.FONT_SIZE, this.xPosition, this.yPosition, lines[i]);

            if (this.xPosition >= ConsoleDisplay.CANVAS_WIDTH - ConsoleDisplay.MARGIN_OFFSET * 2) {
                this.advanceLine();
            } else {
                // Move the current X position forward
                var offset = ConsoleDisplay.drawingContext.measureText(ConsoleDisplay.FONT_FAMILY, ConsoleDisplay.FONT_SIZE, lines[i]);
                this.xPosition += offset;
            }
        }
    }
};
    
// Removes the specified text from the screen
Console.prototype.removeText = function(text) {
    if (text !== "") {
        // Move the current X position backward
        var offset = ConsoleDisplay.drawingContext.measureText(ConsoleDisplay.FONT_FAMILY, ConsoleDisplay.FONT_SIZE, text);
        this.xPosition = this.xPosition - offset;

        // Draw a rectangle over the last character in the buffer
        ConsoleDisplay.drawingContext.clearRect(this.xPosition, this.yPosition - ConsoleDisplay.FONT_SIZE - 1, offset, ConsoleDisplay.FONT_SIZE * 2);
    }
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
    }
    return this.isValid(line);
};

// Advances the line and scrolls the screen if necessary
Console.prototype.advanceLine = function() {
    if (this.filters.length === 0 || (this.filters.length > 0 && this.xPosition > 0)) {
        this.yPosition += ConsoleDisplay.FONT_SIZE + ConsoleDisplay.FONT_HEIGHT_MARGIN;
    }
    this.xPosition = 0;
        
      
    this.handleScrolling();
};

// Handle scrolling the screen downward if there is more text than what fits on the canvas
Console.prototype.handleScrolling = function () {
    // Scroll down if the y position is greater than the height of the container
    if (this.yPosition > ConsoleDisplay.CONTAINER_HEIGHT - ConsoleDisplay.MARGIN_OFFSET) {
        // Store the current contents of the canvas into a storage canvas
        var buffer = document.getElementById('storage');
        buffer.width = ConsoleDisplay.canvas.width;
        buffer.height = ConsoleDisplay.canvas.height;
        buffer.getContext('2d').drawImage(ConsoleDisplay.canvas, 0, 0);
        
        // Change the height of the div so the container can scroll down
        var height = +ConsoleDisplay.canvasElement.attr('height') + ConsoleDisplay.FONT_SIZE + ConsoleDisplay.FONT_HEIGHT_MARGIN;
        ConsoleDisplay.canvasElement.attr('height', height);

        // Clear the screen to put more text on the screen
        this.clearScreen();
        
        // Draw the image from the storage canvas onto the viewable canvas
        ConsoleDisplay.canvas.getContext('2d').drawImage(buffer, 0, 0);
       
        // Scroll to the bottom of the canvas
        ConsoleDisplay.canvasContainer.scrollTop(ConsoleDisplay.canvasElement.height());
    }
};