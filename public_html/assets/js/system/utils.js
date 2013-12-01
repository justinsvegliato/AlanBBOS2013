/** 
 * An auxiliary class that contains utility functions.
 */

// Converts a string to title case
function toTitleCase(str) {
    // Random code I found on stack overflow
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Capitalizes the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Removes leading and trailing white space from a string
function trim(str) {
    // Uses a regular expression to remove leading and trailing spaces
    return str.replace(/^\s+ | \s+$/g, "");

    /* 
     * Huh?  Take a breath.  Here we go:
     * The "|" separates this into two expressions, as in A or B.
     * "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
     * "\s+$" is the same thing, but at the end of the string.
     * "g" makes is global, so we get all the whitespace.
     * "" is nothing, which is what we replace the whitespace with.
     */
}

// An easy-to understand implementation of the famous and common Rot13 obfuscator.
// You can do this in three lines with a complex regular expression, but I'd have
// trouble explaining it in the future. There's a lot to be said for obvious code.
function rot13(str) {
    var retVal = "";
    for (var i = 0; i < str.length; i++) {
        var ch = str[i];
        var code = 0;
        if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
            code = str.charCodeAt(i) + 13;
            retVal = retVal + String.fromCharCode(code);
        } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
            code = str.charCodeAt(i) - 13;
            retVal = retVal + String.fromCharCode(code);
        } else {
            retVal = retVal + ch;
        }
    }
    return retVal;
}

// This is an extension of the String class to provide string formatting functionality. 
// In order to see how this formatting function is utilized, see taskBar.js. In essence, 
// any bracketed number in a string, i.e., "Hi {0}, how are you?', will be replaced by the
// corresponding parameter sent to the function
String.prototype.format = String.prototype.f = function() {
    var s = this,
            i = arguments.length;
    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// Adds padding to a word to ensure that it is of the specified size
function pad(word, size, padder) {
    var paddedWord = "" + word;
    while (paddedWord.length < size) {
        paddedWord = padder + paddedWord;
    }
    return paddedWord;
}

// Converts a string to hexidecimal
function toHexidecimal(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
}

function toASCII(hex) {
    var str = "";
    for (var i = 0; i < hex.length; i += 2) {
        var characterCode = parseInt(hex.substr(i, 2), 16);
        var character = (characterCode === 0) ? "0" : String.fromCharCode(characterCode);
        str += character;
    }
    return str;
}