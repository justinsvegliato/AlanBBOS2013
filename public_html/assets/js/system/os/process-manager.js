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
        var pcb = new ProcessControlBlock(true);
        ProcessManager.processControlBlocks[pcb.processId] = pcb;

        // Set the base and limit of the pcb
        MemoryManager.allocate(pcb);

        // Load the program into memory
        var components = program.split(/\s+/);
        for (var i = 0; i < components.length; i++) {
            MemoryManager.write(components[i], i + pcb.base);
        }

        return pcb;
    } else {
        var pcb = new ProcessControlBlock(false);
        ProcessManager.processControlBlocks[pcb.processId] = pcb;
        
        var modifiedProgram = program.split(/\s+/).join('');
        Kernel.handleInterupts(DISK_OPERATION_IRQ, ["loadProcess", pcb, modifiedProgram]);
        return pcb;
    }
//    else {
//        Kernel.handleInterupts(PROCESS_LOAD_FAULT_IRQ, "Insufficient memory");
//    }
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
function ProcessControlBlock(inMemory) {
    // Increment the process id every time a pcb is constructed
    this.processId = ProcessControlBlock.lastProcessId++;
    this.inMemory = inMemory;

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

    this.getProgram = function() {
        if (this.base !== null && this.limit !== null) {
            var program = "";
            for (var i = 0; i < this.limit; i++) {
                program += MemoryManager.memory.words[this.base + i].data;
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