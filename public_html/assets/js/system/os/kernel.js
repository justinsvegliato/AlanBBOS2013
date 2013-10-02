/**
 * Requires globals.js
 * 
 * Routines for the Operating System and not the host.
 * 
 * This code references page numbers in the text book: 
 * Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  
 * ISBN 978-0-470-12872-5
 */

// Empty constructor - this class is essentially a singleton in a certain sense
function Kernel() {};

//
// Properties
//

Kernel.keyboardDriver = null;
Kernel.interruptQueue = null;
Kernel.buffers = null;
Kernel.inputQueue = null;
Kernel.console = null;
Kernel.stdIn = null;
Kernel.stdOut = null;
Kernel.shell = null;
Kernel.memoryManager = null;
Kernel.processManager = null;

//
// OS Startup and Shutdown Routines   
//

// Handles logic associated with starting up the system
Kernel.bootstrap = function() {
    // Instantiate associated data structures
    Kernel.trace("Loading underlying data structures");
    Kernel.interruptQueue = new Queue();
    Kernel.buffers = new Array();
    Kernel.inputQueue = _KernelInputQueue = new Queue();
    
    // Initialize the console
    Kernel.trace("Loading the console");
    Kernel.console = new Console();

    // Initialize the standard input and output
    Kernel.trace("Initializing standard input/output");
    Kernel.stdIn = Kernel.console;
    Kernel.stdOut = Kernel.console;

    // Load the keyboard device driver
    Kernel.trace("Loading the keyboard device driver");
    Kernel.keyboardDriver = new Queue();
    Kernel.keyboardDriver = new DeviceDriverKeyboard();
    Kernel.keyboardDriver.driverEntry();
    Kernel.trace(Kernel.keyboardDriver.status);
    
    Kernel.memoryManager = MemoryManager;
    Kernel.processManager = ProcessManager;  

    // Enable the OS interrupts 
    // Note: This is not the CPU clock interrupt, as that is done in the host
    Kernel.trace("Enabling the interrupts");
    Kernel.enableInterrupts();

    // Launch the shell
    Kernel.trace("Initializing the shell");
    Kernel.shell = new Shell();

    // Initiate testing if available
    if (_GLaDOS) {
        Kernel.trace("Initializing testing hook");
        _GLaDOS.afterStartup();
    }
};

// Handles logic associated with terminating the system
Kernel.shutdown = function() {
    Kernel.trace("Terminating OS");
    // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...       
    Kernel.trace("Disabling the interrupts");
    Kernel.disableInterrupts();
    clearInterval(_hardwareClockID);
    
    // 
    // Unload the Device Drivers?
    // More?
    //
    Kernel.trace("Termination successful");
};

// Handle each clock pulse of the system
Kernel.pulse = function() {
    /* 
     * This gets called from the host hardware sim every time there is a hardware clock pulse.
     * This is NOT the same as a TIMER, which causes an interrupt and is handled like other 
     * interrupts. This, on the other hand, is the clock pulse from the hardware (or host) 
     * that tells the kernel that it has to look for interrupts and process them if it finds any.  
     */
    
    // Handle the interrupt if there is an interrupt on the queue or otherwise check if the
    // CPU is currently processing. The kernel remains idle if neither case applies.
    if (Kernel.interruptQueue.getSize() > 0) {
        // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
        var interrupt = Kernel.interruptQueue.dequeue();
        Kernel.handleInterupts(interrupt.irq, interrupt.params);
    } else if (_CPU.isExecuting) {
        _CPU.cycle();
    } else {
        Kernel.trace("Idle");
    }
    Control.update();
};

//
// Interrupt Handling
//

// Simply enables the interrupts
Kernel.enableInterrupts = function() {
    hostEnableKeyboardInterrupt();
};

// Simply disables the interrupts
Kernel.disableInterrupts = function() {
    hostDisableKeyboardInterrupt();
};

// Handles all interrupts - this is the interrupt handler rourtine
Kernel.handleInterupts = krnInterruptHandler = function(irq, params) {
    // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on
    Kernel.trace("Handling IRQ~" + irq);

    // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector
    // TODO: Consider using an Interrupt Vector in the future
    switch (irq) {
        // The Kernel built-in routine for timers
        case TIMER_IRQ:
            Kernel.timerIsr();
            break;
        // The kernal-mode device driver
        case KEYBOARD_IRQ:
            Kernel.keyboardDriver.isr(params);
            Kernel.stdIn.handleInput();
            break;
        case PROCESS_INITIATION_IRQ:
            Kernel.processInitiationIsr(params);
            break;
        case PROCESS_TERMINATION_IRQ:
            Kernel.processTerminationIsr(params);
            break; 
        case MEMORY_FAULT_IRQ:
            Kernel.memoryFaultIsr(params);
            break;
        // The routine for a system call from a user program
        case SYSTEM_CALL_IRQ:
            Kernel.systemCallIsr(params);
            break;
        // Trap if the interrupt is not recognized
        default:
            Kernel.trapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
    }
};

//
// OS Utility Routines
//

// The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver)
Kernel.timerIsr = function() {
    // Check multiprogramming parameters and enforce quanta here - call the scheduler
    // and context switch here if necessary
};

Kernel.processInitiationIsr = function(pcb) {
    _CPU.start(pcb);
};

Kernel.processTerminationIsr = function(pcb) {
    _CPU.stop();
    ProcessManager.unload(pcb);
};

Kernel.memoryFaultIsr = function(message) {
    Kernel.console.handleResponse(message);
};

Kernel.systemCallIsr = function(register) {
    var xRegister = register[0];
    var yRegister = register[1];
    if (xRegister === 1) {
        Kernel.console.putText(yRegister.toString());
    } else {
        var byte = null;
        while ((byte = parseInt(MemoryManager.read(yRegister), 16)) !== "00") {
            Kernel.console.putText(byte);
        }
    }
};

// Handles messages being outputted by the kernal
Kernel.trace = function(msg) {
    // Print messages if the trace has been enabled
    if (_Trace) {
        if (msg === "Idle") {
            // Only log idle messages occassionally to avoid browser lag
            if (_OSclock % 10 === 0) {
                Control.log(msg, "OS");
            }
        } else {
            Control.log(msg, "OS");
        }
    }
};

// Traps an error triggering a blue screen of death!
Kernel.trapError = function(msg) {
    Control.log("Error: " + msg, "OS");
    Control.bsod();
};