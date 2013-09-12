/** 
 * Requires deviceDriver.js
 * 
 * The driver that handles all keyboard actions.
 */

// Inherit from prototype DeviceDriver in deviceDriver.js
DeviceDriverKeyboard.prototype = new DeviceDriver;

// Constructor that as of right now does nothing...
function DeviceDriverKeyboard() {
    // More stuff will probably go here in the fiture...
};

//
// Methods (these override the methods in the parent class)
//

// Initialization routine for the kernel-mode keyboard device driver
DeviceDriverKeyboard.prototype.driverEntry = function() {
    this.status = "loaded";
};

// The interupt service routine that handles user input
DeviceDriverKeyboard.prototype.isr = function(params) {
    // TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    Kernel.trace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";

    // Check if the keyboard input is between A-Z and a-z and then check if the input is a 
    // digit, space, backspace, or enter
    if (((keyCode >= 65) && (keyCode <= 90)) || ((keyCode >= 97) && (keyCode <= 123))) {
        // Assume it's lowercase and re-adjust to uppercase if necessary
        chr = String.fromCharCode(keyCode + 32);
        if (isShifted) {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so
        Kernel.inputQueue.enqueue(chr);
    } else if (((keyCode >= 48) && (keyCode <= 57)) || (keyCode === 32) 
            || (keyCode === 13) || (keyCode === 8) || (keyCode === 38) 
            || (keyCode === 40) || (keyCode === 186)) {
        chr = String.fromCharCode(keyCode);
        Kernel.inputQueue.enqueue(chr);
    }
};

