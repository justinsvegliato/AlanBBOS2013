/**
 * Singleton class that handles process management
 */

function ProcessManager() {};

// The list of all processes waiting to be handled (the ready queue!)
ProcessManager.processControlBlocks = {};

// Loads the specified program into memory
ProcessManager.load = function(program) {
    // If there is space available to be allocated, do so. Otherwise send an interrupt to the kernel
    if (Object.keys(ProcessManager.processControlBlocks).length < MemoryManager.NUMBER_OF_BLOCKS) {
        // Create a new pcb and add it to the ready queue
        var pcb = new ProcessControlBlock();
        ProcessManager.processControlBlocks[pcb.processId] = pcb;
        
        // Set the base and limit of the pcb
        MemoryManager.allocate(pcb);               

        // Load the program into memory
        var components = program.split(" ");
        for (var i = 0; i < components.length; i++) {
            MemoryManager.write(components[i], i + pcb.base);
        }

        return pcb;
    } else {
        Kernel.handleInterupts(PROCESS_LOAD_FAULT_IRQ, "Insufficient memory");
    }
};

// Unloads the specified program from memory
ProcessManager.unload = function(pcb) {
    MemoryManager.deallocate(pcb);
    delete ProcessManager.processControlBlocks[pcb.processId];
};

// Executes the specified program by sending an interrupt to the kernel
ProcessManager.execute = function(pcb) {
    pcb.state = ProcessControlBlock.State.READY;
    Kernel.handleInterupts(PROCESS_EXECUTION_IRQ, pcb);
};

//
// An interior class to represent the process control block
//
function ProcessControlBlock() {
    // Increment the process id every time a pcb is constructed
    this.processId = ProcessControlBlock.lastProcessId++;  
    
    this.programCounter = 0;
    this.instructionRegister = 0;
    this.accumulator = 0;
    this.xRegister = 0;
    this.yRegister = 0;
    this.zFlag = 0;
    this.state = ProcessControlBlock.State.NEW;
    
    this.output = "";
       
    this.base = null;
    this.limit = null;
    
    // Updates the pcb - this will be used for context switching
    this.update = function(programCounter, instructionRegister, accumulator, xRegister, yRegister, zFlag) {
        this.programCounter = programCounter;
        this.instructionRegister = instructionRegister;
        this.accumulator = accumulator;
        this.xRegister = xRegister;
        this.yRegister = yRegister;
        this.zFlag = zFlag;
    };
}

// Keeps track of the last process id
ProcessControlBlock.lastProcessId = 0;

// Enum that contains all possible states of a process
ProcessControlBlock.State = {
    NEW: "New",
    RUNNING: "Running",
    WAITING: "Waiting",
    READY: "Ready",
    TERMINATED: "Terminated"
};