/**
 * Requires global.js.
 * 
 * Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
 * in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
 * that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
 * JavaScript in both the host and client environments.
 * 
 * This (and simulation scripts) is the only place that we should see "web" code, like 
 * DOM manipulation and JavaScript event handling, and so on.
 */

var _hardwareClockID = -1;

//
// Hardware/Host Clock Pulse
//
function hostClockPulse() {
    _OSclock++;
    Kernel.pulse();
}

//
// Keyboard Interrupt, a HARDWARE Interrupt Request
//
function hostEnableKeyboardInterrupt() {
    // Listen for key press (keydown, actually) events in the Document
    // and call the simulation processor, which will in turn call the 
    // OS interrupt handler
    document.addEventListener("keydown", hostOnKeypress, false);
}

function hostDisableKeyboardInterrupt() {
    // Removes the listeners that listens for key presses
//    $(document).keypress(hostOn)
    document.removeEventListener("keydown", hostOnKeypress, false);
}

function hostOnKeypress(event) {
    // The canvas element CAN receive focus if you give it a tab index, which we have.
    // Check that we are processing keystrokes only from the canvas's id (as set in index.html).
    if (event.target.id === "display") {
        event.preventDefault();
        var params = new Array((event.keyCode ? event.keyCode : event.which), event.shiftKey);
        Kernel.interruptQueue.enqueue(new Interrupt(KEYBOARD_IRQ, params));
    }
}