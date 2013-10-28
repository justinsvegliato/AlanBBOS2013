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
Kernel.systemCallLibrary = null;

Kernel.isStepModeActivated = null;

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
    Kernel.systemCallLibrary= SystemCallLibrary;

    // Enable the OS interrupts 
    // Note: This is not the CPU clock interrupt, as that is done in the host
    Kernel.trace("Enabling the interrupts");
    Kernel.enableInterrupts();

    // Launch the shell
    Kernel.trace("Initializing the shell");
    Kernel.shell = new Shell();
    
    // By default the step mode will be false
    Kernel.isStepModeActivated = false;
    
    // Initiate testing if available
    if (_GLaDOS) {
        Kernel.trace("Initializing testing hook");
        _GLaDOS.afterStartup();
    }
    
    Control.update();
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
    } else if (_CPU.isExecuting && !Kernel.isStepModeActivated) {
        CpuScheduler.cycle++;
        _CPU.cycle();             
    } else {
        Kernel.trace("Idle");
    } 
    
    Control.update();
    CpuScheduler.schedule();
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
        // The routine for when a process begins execution
        case PROCESS_EXECUTION_IRQ:
            Kernel.processExecutionIsr(params);
            break;       
        // The routine for when a process tries to access an out-of-bounds memory location
        case MEMORY_ACCESS_FAULT_IRQ:
            Kernel.memoryAccessFaultIsr(params);
            break;
        // The routine for a system call from a user program
        case SYSTEM_CALL_IRQ:
            Kernel.systemCallIsr(params);
            break;
        // The routine which handles stepping through each intruction of a process
        case STEP_IRQ:
            Kernel.stepIsr();
            break;
        // The routine that handles step mode activation and deactivation
        case STEP_MODE_IRQ:
            Kernel.stepModeIsr();
            break;
        // The routine that handles errors in the program code
        case PROCESS_FAULT_IRQ:
            Kernel.processFaultIsr(params);
            break;
        // The routine that handles error that occur when a process is loaded
        case PROCESS_LOAD_FAULT_IRQ:
            Kernel.processLoadFaultIsr(params);
            break;
        // Trap if the interrupt is not recognized
        default:
            Kernel.trapError("Invalid Interrupt Request: irq=" + irq + " params=[" + params + "]");
    }
    
    Control.update();
};

//
// OS Utility Routines
//

// The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver)
Kernel.timerIsr = function() {
    // Check multiprogramming parameters and enforce quanta here - call the scheduler
    // and context switch here if necessary
};

// The interrupt service routine that handles the initialization of a process
Kernel.processExecutionIsr = function(pcb) {
    CpuScheduler.readyQueue.enqueue(pcb);
};

// The interrupt service routine that faults that occur during process loading
Kernel.processLoadFaultIsr = function(message) {
    Kernel.console.handleResponse(message);
};

// The interrupt service routine that handles memory access errors
Kernel.memoryAccessFaultIsr = function(pcb) {
    // Restore everything back to default settings
    _CPU.stop();
    ProcessManager.unload(pcb);  
    
    // Do some output to alert the use
    var message = "Memory access error from process " + pcb.processId;
    Kernel.console.handleResponse(message);
    Kernel.console.advanceLine();
    Kernel.console.putText(Kernel.shell.promptStr);
    
    Kernel.trace(message);     
};

// The interrupt service routine that handles system calls from a user program
Kernel.systemCallIsr = function(params) {
    var systemCallId = params[0];
    var params = params.slice(1);
    
    // Retrieve system call function and execute it if it exists
    var systemCall = Kernel.systemCallLibrary.systemCallInterface[systemCallId];
    if (systemCall) {
        systemCall(params);
    } else {
        var message = "Invalid system call id: " + systemCallId;
        Kernel.handleInterupts(PROCESS_FAULT_IRQ, [message, params[0]])
    }  
};

// The interrupt service routine that handles stepping through a user process
Kernel.stepIsr = function() {
    // Just simply call cycle() to handle the next instruction
    _CPU.cycle(); 
};

// The interrupt service routine that activates/deactivates step mode
Kernel.stepModeIsr = function() {
    Kernel.isStepModeActivated = !Kernel.isStepModeActivated;
};

// The interrupt service routine that handles errors in the user program
Kernel.processFaultIsr = function(params) {
    var message = params[0];
    var pcb = params[1];
    
    // Restore the default settings of the process manager and cpu
    _CPU.stop();
    ProcessManager.unload(pcb);
    
    // Do some output to alert the user of the error
    Kernel.console.handleResponse(message);
    Kernel.console.advanceLine();
    Kernel.console.putText(Kernel.shell.promptStr);  
    
    Kernel.trace(message);
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
