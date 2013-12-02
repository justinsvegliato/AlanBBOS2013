/**
 * Singleton class that handles process management
 */

function ProcessManager() {};

// The list of all processes waiting to be handled
ProcessManager.processControlBlocks = {};

// Loads the specified program into memory
ProcessManager.load = function(program, priority) {
    // Allocate memory space if available, otherwise store it on the hard drive
    if (Object.keys(ProcessManager.processControlBlocks).length < MemoryManager.NUMBER_OF_BLOCKS) {
        // Create a new pcb and add it to the ready queue
        var pcb = new ProcessControlBlock(true, priority);
        ProcessManager.processControlBlocks[pcb.processId] = pcb;

        
        // Set the base and limit of the pcb as well as the memory locations
        var memoryLocations = program.split(/\s+/);
        MemoryManager.allocate(pcb, memoryLocations);

        return pcb;
    } else {
        // Create a new pcb and add it to the ready queue
        var pcb = new ProcessControlBlock(false, priority);
        ProcessManager.processControlBlocks[pcb.processId] = pcb;
        
        // Send the program to the disk
        var modifiedProgram = program.split(/\s+/).join('');
        Kernel.handleInterupts(DISK_OPERATION_IRQ, ["loadProcess", pcb, modifiedProgram]);
        return pcb;
    }
};

// Unloads the specified program from memory
ProcessManager.unload = function(pcb) {
    if (pcb.inMemory) {
        MemoryManager.deallocate(pcb);
    } else {
        Kernel.handleInterupts(DISK_OPERATION_IRQ, ["unloadProcess", pcb]);
    }
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
function ProcessControlBlock(inMemory, priority) {
    // Increment the process id every time a pcb is constructed
    this.processId = ProcessControlBlock.lastProcessId++;

    this.programCounter = 0;
    this.instructionRegister = 0;
    this.accumulator = 0;
    this.xRegister = 0;
    this.yRegister = 0;
    this.zFlag = 0;
    
    this.base = null;
    this.limit = null;
    
    this.state = ProcessControlBlock.State.NEW;
    
    this.output = "";    
    this.inMemory = inMemory;
    this.priority = priority;

    // Updates the pcb - this will be used for context switching
    this.update = function(programCounter, instructionRegister, accumulator, xRegister, yRegister, zFlag) {
        this.programCounter = programCounter;
        this.instructionRegister = instructionRegister;
        this.accumulator = accumulator;
        this.xRegister = xRegister;
        this.yRegister = yRegister;
        this.zFlag = zFlag;
    };

    // Retrieves the program associated with this particular PCB only if stored in memory
    this.getProgram = function() {
        if (this.base !== null && this.limit !== null) {
            var program = "";
            for (var i = 0; i < this.limit; i++) {
                program += MemoryManager.read(i, this);
            }
            return program;
        }
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

// TODO
// Make sure hard drive doesn't go over capacity
// Check if hard drive is correct size
// Line wrap files