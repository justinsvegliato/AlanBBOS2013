/** 
 * Requires deviceDriver.js
 * 
 * The driver that handles all keyboard actions.
 */

// Inherit from prototype DeviceDriver in deviceDriver.js
DeviceDriverKeyboard.prototype = new DeviceDriver;

function DeviceDriverKeyboard() {};

DeviceDriverKeyboard.prototype.keyCodeToAsciiMap = {
    186: 59, // ;
    187: 61, // =    
    188: 44, // ,
    189: 45, // -    
    190: 46, // .
    191: 47, // /
    192: 96, // `    
    219: 91, // [
    220: 92, // \
    221: 93, // ]
    222: 39,  // '
};

DeviceDriverKeyboard.prototype.shiftedCharacterMap = {
    '`': '~',
    '0': ')',
    '1': '!',
    '2': '@',
    '3': '#',
    '4': '$',
    '5': '%',
    '6': '^',
    '7': '&',
    '8': '*',
    '9': '(',
    '-': '_',
    '=': '+',
    '[': '{',
    ']': '}',
    '\\': '|',
    ';': ':',
    "'": '"',
    '"': "'",
    ',': '<',
    '.': '>',
    '/': '?'
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
    
    // Throw an error if we receive bad parameters
    if (keyCode === null || isShifted === null || typeof keyCode !== "number" || typeof isShifted !== "boolean") {
        Kernel.trapError("Invalid parameters passed to the keyboard ISR");
        return;
    }
    
    Kernel.trace("Key code:" + keyCode + " shifted:" + isShifted);

    // An enumeration of the conditions just to clean up the code a bit
    var isLetter = (keyCode >= 65) && (keyCode <= 90);
    var isDigit = (keyCode >= 48) && (keyCode <= 57);
    var isSpecialCharacter = ((keyCode >= 219) && (keyCode <= 222)) || ((keyCode >= 186) && (keyCode <= 192));
    var isControlCharacter = keyCode === 13 || keyCode === 8 || keyCode === 32 || keyCode === 38 || keyCode === 40;
    if (isLetter || isDigit || isSpecialCharacter || isControlCharacter) {          
        // Convert the key code to ASCII if appropriate
        keyCode = (keyCode in this.keyCodeToAsciiMap) ? this.keyCodeToAsciiMap[keyCode] : keyCode;
            
        var chr = String.fromCharCode(keyCode).toLowerCase();
        
        // Assume it's unshifted and shift if necessary  
        if (isShifted) {
            if (isLetter) {
                chr = chr.toUpperCase();
            } else if (!isControlCharacter) {
                chr = this.shiftedCharacterMap[chr];
            }
        }
        
        // TODO: Check for caps-lock and handle as shifted if so
        
        // Replace conflicting keys if necessary
        if (!isDigit) {
            chr = (chr === "&") ? "UP" : chr;
            chr = (chr === "(") ? "DOWN" : chr;  
        }
        
        Kernel.inputQueue.enqueue(chr);
    }
};