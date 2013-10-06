/**
 * Requires global.js.
 *  
 * Routines for the hardware simulation, NOT for our client OS itself. In this manner, it's A LITTLE BIT like a hypervisor,
 * in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code that
 * hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using JavaScript in 
 * both the host and client environments.
 * 
 * This (and other host/simulation scripts) is the only place that we should see "web" code, like 
 * DOM manipulation and JavaScript event handling, and so on.
 */

// TODO: This logic in conjunction with log, taskbar, and display must be cleaned up.
// Perhaps we need a base hardware object that will be extended by specific hardware? 
// In any case, clean this stuff up.

function Control() {};

// Initializes the control object by creating the canvas, clearing the log, and shifting
// the taskbar to the inactive state
Control.init = function() {
    // Create the canvas, clear the log, and change the taskbar
    ConsoleDisplay.createCanvas();
    LogDisplay.clear();
    TaskBarDisplay.enterInactiveState();

    // Check for our testing and enrichment core
    if (typeof Glados === "function") {
        _GLaDOS = new Glados();
        _GLaDOS.init();
    };
};

// Handles logging messages
Control.log = function(msg, source) {
    LogDisplay.record(_OSclock, source, msg);
};

//
// Control Events
//

// Handles all logic associated with starting the operating system
Control.start = function() {
    Control.log("Starting bootstrap process", "host");

    // Disable the start button, and enable the handle/reset button
    TaskBarDisplay.enterActiveState();
    
    // Send focus to the display (this will do more the in future)
    ConsoleDisplay.enterActiveState();
        
    // Initialize the CPU
    _CPU = new Cpu();

    _hardwareClockID = setInterval(hostClockPulse, CPU_CLOCK_INTERVAL);
    
    // Start the bootstrap process for the operating system
    Kernel.bootstrap();
};

// Handles all logic associated with halting the operating system
Control.halt = function() {
    Control.log("Emergency halt", "host");
    Control.log("Attempting Kernel shutdown", "host");

    // Terminate the operating system and clear the hardware clock
    Kernel.shutdown();    
    
    // Enable the start button and disable the halt/restart buttons
    TaskBarDisplay.enterInactiveState();
};

// Handles all logic associated with the blue screen of death
// TODO: Combine functionality between bsod() and halt()
Control.bsod = function() {
    // Terminate the operating system and clear the hardware block 
    Kernel.shutdown();    
    
    // Adjusts the display (show bsod) and taskbar (disable all buttons but restart) accordingly
    ConsoleDisplay.enterErrorState();
    TaskBarDisplay.enterErrorState();
};

Control.update = function() {
    TaskBarDisplay.updateDateTime();
    ProcessDisplay.update(_CPU);
    CpuDisplay.update(_CPU);
    MemoryDisplay.update(Kernel.memoryManager, _CPU, Kernel.isStepModeActivated);  
};

Control.enterStepMode = function() {
    TaskBarDisplay.startStepMode();
    Kernel.handleInterupts(STEP_MODE_IRQ);
};

Control.exitStepMode = function() {
    TaskBarDisplay.exitStepMode();
    Kernel.handleInterupts(STEP_MODE_IRQ);
};

Control.step = function() {
    Kernel.handleInterupts(STEP_IRQ);
};

// Handles all logic associated with resetting the operating system (just a restart)
Control.reset = function() {
    location.reload(true);
};

// Attaches functions to the three buttons in the taskbar and initializes the console
$(document).ready(function() {
    $(TaskBarDisplay.startStopElement).click(function() {
        if (TaskBarDisplay.startStopElement.hasClass("btn-success")) {
            Control.start(this);
        } else {
            Control.halt(this);
        }
    });
    
    $(TaskBarDisplay.resetElement).click(function() {
        Control.reset();
    });
    
    $(TaskBarDisplay.startStepModeButton).click(function() {
        if (TaskBarDisplay.startStepModeButton.hasClass("btn-success")) {
            Control.enterStepMode();
        } else {
            Control.exitStepMode();
        }
    });
    
    $(TaskBarDisplay.stepButton).click(function() {
       Control.step(); 
    });
    
    $(".btn-group, #content").hide().fadeIn();
    Control.init();
});