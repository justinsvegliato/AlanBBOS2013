/* 
 * Requires global.js.
 * 
 * Routines for the host CPU simulation, NOT for the OS itself.  
 * In this manner, it's similiar to a hypervisor,
 * in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
 * that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
 * JavaScript in both the host and client environments.
 */

// Construcuts a newly-instantiated CPU object
function Cpu() {
    this.initialize();
}

// Starts CPU execution by setting isExecuting to true (this will cause cycle() to be called)
Cpu.prototype.start = function(pcb) {
    this.currentProcess = pcb;
    
    // Set the program counter to the first line of the program
    this.programCounter = pcb.programCounter;
    this.instructionRegister = pcb.instructionRegister;
    this.accumulator = pcb.accumulator;
    this.xRegister = pcb.xRegister;
    this.yRegister = pcb.yRegister;
    this.zFlag = pcb.zFlag;
    
    // Set to true so cycle() is invoked
    this.isExecuting = true;
};

// Stops CPU execution
Cpu.prototype.stop = function() {
   // Clears all the registers and set isExecuting to false
   this.initialize();
};

Cpu.prototype.initialize = function() {
    // Empties all registers
    this.programCounter = 0;
    this.instructionRegister = 0;
    this.accumulator = 0;
    this.xRegister = 0;
    this.yRegister = 0;
    this.zFlag = 0;
    
    // Sets this variable to false to stop cycle() from invocation
    this.isExecuting = false;
    
    // Reset operationg and current process to nothing to avoid interfering with next process
    this.currentProcess = null;
    this.operation = null;
};

Cpu.prototype.cycle = function() {
    Kernel.trace("CPU cycle");

    // If the program counter exceeds the process's memory limit, set the program counter to 
    // the process's base address (this simulates a loop)
    this.programCounter = (this.programCounter > this.currentProcess.limit) ? 0 : this.programCounter;

    // Fetch the first instruction and increment the program counter
    this.instructionRegister = MemoryManager.read(this.programCounter++, this.currentProcess).toLowerCase();
    
    // Decode the instruction (aka get the operationg associated with the instruction)
    this.operation = Cpu.prototype.operationMap[this.instructionRegister];   
    
    // Execute the operation if it is found otherwise throw an error
    if (this.operation) {
        this.operation();
        // TODO: Why is this sometimes null?
        if (this.currentProcess) {
            this.currentProcess.update(this.programCounter, this.instructionRegister, this.accumulator, this.xRegister, this.yRegister, this.zFlag);
        }
    } else {
        this.throwError("Unrecognized instruction: " + this.instructionRegister);
    }
};

// Loads the accumulator with a constant
Cpu.prototype.ldaImmediateOperation = function() {
    this.accumulator = this.readValueParameter();
};
Cpu.prototype.ldaImmediateOperation.argumentLength = 1;

// Loads the accumular from memory
Cpu.prototype.ldaDirectOperation = function() {
    this.accumulator = this.readFromMemory(this.readMemoryParameter());
};
Cpu.prototype.ldaDirectOperation.argumentLength = 2;

// Stores the accumulator in memory 
Cpu.prototype.staOperation = function() {
    this.writeToMemory(this.accumulator, this.readMemoryParameter());
};
Cpu.prototype.staOperation.argumentLength = 2;

// Stores the sum of the accumulator and the value in the specified memory location
Cpu.prototype.adcOperation = function() {
    var memoryLocation = this.readMemoryParameter();
    this.accumulator += this.readFromMemory(memoryLocation);
};
Cpu.prototype.adcOperation.argumentLength = 2;

// Load the x register with a constant
Cpu.prototype.ldxImmediateOperation = function() {
    this.xRegister = this.readValueParameter();
};
Cpu.prototype.ldxImmediateOperation.argumentLength = 1;

// Load the x register with a value from memory
Cpu.prototype.ldxDirectOperation = function() {
    this.xRegister = this.readFromMemory(this.readMemoryParameter());
};
Cpu.prototype.ldxDirectOperation.argumentLength = 2;

// Loads the y register with a constant
Cpu.prototype.ldyImmediateOperation = function() {
    this.yRegister = this.readValueParameter();
};
Cpu.prototype.ldyImmediateOperation.argumentLength = 1;

// Loads the y register with a value from memory
Cpu.prototype.ldyDirectOperation = function() {
    this.yRegister = this.readFromMemory(this.readMemoryParameter());
};
Cpu.prototype.ldyDirectOperation.argumentLength = 2;

// The best operation ever. Ensures that the CPU is allowed to chill out for one cycle.
Cpu.prototype.nopOperation = function() {};
Cpu.prototype.nopOperation.argumentLength = 0;

// Exits the process
Cpu.prototype.brkOperation = function() {
    Kernel.handleInterupts(SYSTEM_CALL_IRQ, [0, this.currentProcess]);
};
Cpu.prototype.brkOperation.argumentLength = 0;

// Compares the value of the x register to the value of the memory location. If they are 
// equal, then the z-flag register is set to 1.
Cpu.prototype.cpxOperation = function() {
    var byte = this.readFromMemory(this.readMemoryParameter());
    this.zFlag = (byte === this.xRegister) ? 1 : 0;
};
Cpu.prototype.cpxOperation.argumentLength = 2;

// Branches to the specified location in memory if the zFlag is 0. If the jump is goes out 
// of the alotted memory, loop around to the beginning of the block.
Cpu.prototype.bneOperation = function() {
    var jump = this.readValueParameter();
    if (!this.zFlag) {
        // To get the new location, add the program counter to the jump amount
        var location = this.programCounter + jump;
        
        // If the new location is larger than the limit, cycle back to the beginning of the block
        location = location > this.currentProcess.limit 
                 ? location - this.currentProcess.limit - 1 
                 : location;
                           
        this.programCounter = location;
        this.instructionRegister = MemoryManager.read(this.programCounter).toLowerCase();
    }
};
Cpu.prototype.bneOperation.argumentLength = 1;

// Increments the value of this memory location
Cpu.prototype.incOperation = function() {
    var memoryLocation = this.readMemoryParameter(this);
    var byte = this.readFromMemory(memoryLocation) + 1;
    this.writeToMemory(byte, memoryLocation);
};
Cpu.prototype.incOperation.argumentLength = 2;

// Prints out the value of the y register or the 00-terminated string stored at the address in 
// the Y register.
Cpu.prototype.sysOperation = function() {
    if (this.xRegister === 1 || this.xRegister === 2) {
        Kernel.handleInterupts(SYSTEM_CALL_IRQ, [this.xRegister, this.currentProcess, this.yRegister]);
    } else {
        this.throwError("Invalid parameter for system call");
    }
};
Cpu.prototype.sysOperation.argumentLength = 0;

// Reads the next parameter while incrementing the program counter. This handles retrieving
// the value of instructions such as AD 10. The value parameter is also converted to decimal
// for ease of use.
Cpu.prototype.readValueParameter = function() {
    var value = MemoryManager.read(this.programCounter++, this.currentProcess);
    return parseInt(value, 16);
};

// Reads the memory location (this is different than reading a value parameter because  
// it spans across two locations requiring that the program counter be incremented twice)
Cpu.prototype.readMemoryParameter = function() {
    // The suffix is read first due to the structure of the direct operations. For whatever reason,
    // the suffix is always before the prefix. If the command is st 10 00, we are storing into the
    // location 0x0010.
    var suffix = MemoryManager.read(this.programCounter++, this.currentProcess);
    var prefix = MemoryManager.read(this.programCounter++, this.currentProcess);
    return parseInt(prefix + "" + suffix, 16);
};

// Reads the value at the specified memory location
Cpu.prototype.readFromMemory = function(memoryLocation) {
    return parseInt(MemoryManager.read(memoryLocation, this.currentProcess), 16);
};

// Writes a value to the specified memory location
Cpu.prototype.writeToMemory = function(value, memoryLocation) {
    MemoryManager.write(pad(value.toString(16), 2, "0"), memoryLocation, this.currentProcess);
};

// Sends an interrupt to the kernel while reinitilizaing the CPU
Cpu.prototype.throwError = function(message) { 
    Kernel.handleInterupts(PROCESS_FAULT_IRQ, [message, this.currentProcess]);
    this.initialize();  
};

// This map correlates a hexidecimal instruction with an operation acting as a decoder.
// TODO: Use hexidecimal as the keys instead of strings
Cpu.prototype.operationMap = {
    "a9": Cpu.prototype.ldaImmediateOperation,
    "ad": Cpu.prototype.ldaDirectOperation,
    "8d": Cpu.prototype.staOperation,
    "6d": Cpu.prototype.adcOperation,
    "a2": Cpu.prototype.ldxImmediateOperation,
    "ae": Cpu.prototype.ldxDirectOperation,
    "a0": Cpu.prototype.ldyImmediateOperation,
    "ac": Cpu.prototype.ldyDirectOperation,
    "00": Cpu.prototype.brkOperation,
    "ea": Cpu.prototype.nopOperation,
    "ec": Cpu.prototype.cpxOperation,
    "d0": Cpu.prototype.bneOperation,
    "ee": Cpu.prototype.incOperation,
    "ff": Cpu.prototype.sysOperation
};