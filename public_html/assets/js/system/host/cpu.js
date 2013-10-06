/* 
 * Requires global.js.
 * 
 * Routines for the host CPU simulation, NOT for the OS itself.  
 * In this manner, it's similiar to a hypervisor,
 * in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
 * that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
 * JavaScript in both the host and client environments.
 */

function Cpu() {
    this.reset();
}

Cpu.prototype.start = function(pcb) {
    this.currentProcess = pcb;
    this.programCounter = pcb.base;
    this.isExecuting = true;
};

Cpu.prototype.stop = function() {
   this.reset();
};

Cpu.prototype.reset = function() {
    this.programCounter = 0;
    this.instructionRegister = 0;
    this.accumulator = 0;
    this.xRegister = 0;
    this.yRegister = 0;
    this.zFlag = 0;
    this.isExecuting = false;
    
    this.currentProcess = null;
    this.operation = null;
};

Cpu.prototype.cycle = function() {
    Kernel.trace("CPU cycle");

    this.instructionRegister = MemoryManager.read(this.programCounter++, this.currentProcess).toLowerCase();

    this.operation = Cpu.prototype.operationMap[this.instructionRegister];

    if (this.operation) {
        this.operation();
        if (this.currentProcess) {
            this.currentProcess.update(this.programCounter, this.instructionRegister, this.accumulator, this.xRegister, this.yRegister, this.zFlag);
        }
    } else {
        this.throwError("Unrecognized instruction: " + this.instructionRegister);
    }
};

Cpu.prototype.ldaImmediateOperation = function() {
    this.accumulator = this.readValueParameter();
};
Cpu.prototype.ldaImmediateOperation.argumentLength = 1;

Cpu.prototype.ldaDirectOperation = function() {
    this.accumulator = this.readFromMemory(this.readMemoryParameter());
};
Cpu.prototype.ldaDirectOperation.argumentLength = 2;

Cpu.prototype.staOperation = function() {
    this.writeToMemory(this.accumulator, this.readMemoryParameter());
};
Cpu.prototype.staOperation.argumentLength = 2;

Cpu.prototype.adcOperation = function() {
    var memoryLocation = this.readMemoryParameter();
    this.accumulator += this.readFromMemory(memoryLocation);
};
Cpu.prototype.adcOperation.argumentLength = 2;

Cpu.prototype.ldxImmediateOperation = function() {
    this.xRegister = this.readValueParameter();
};
Cpu.prototype.ldxImmediateOperation.argumentLength = 1;

Cpu.prototype.ldxDirectOperation = function() {
    this.xRegister = this.readFromMemory(this.readMemoryParameter());
};
Cpu.prototype.ldxDirectOperation.argumentLength = 2;

Cpu.prototype.ldyImmediateOperation = function() {
    this.yRegister = this.readValueParameter();
};
Cpu.prototype.ldyImmediateOperation.argumentLength = 1;

Cpu.prototype.ldyDirectOperation = function() {
    this.yRegister = this.readFromMemory(this.readMemoryParameter());
};
Cpu.prototype.ldyDirectOperation.argumentLength = 2;

Cpu.prototype.nopOperation = function() {};
Cpu.prototype.nopOperation.argumentLength = 0;

Cpu.prototype.brkOperation = function() {
    Kernel.handleInterupts(PROCESS_TERMINATION_IRQ, this.currentProcess);
};
Cpu.prototype.brkOperation.argumentLength = 0;

Cpu.prototype.cpxOperation = function() {
    var byte = this.readFromMemory(this.readMemoryParameter());
    this.zFlag = (byte === this.xRegister) ? 1 : 0;
};
Cpu.prototype.cpxOperation.argumentLength = 2;

Cpu.prototype.bneOperation = function() {
    var jump = this.readValueParameter();
    if (!this.zFlag) {
        var location = this.programCounter + jump;
        location = location > this.currentProcess.limit 
                 ? location - this.currentProcess.limit - 1 
                 : location;
        this.programCounter = location;
        this.instructionRegister = MemoryManager.read(this.programCounter).toLowerCase();
    }
};
Cpu.prototype.bneOperation.argumentLength = 1;

Cpu.prototype.incOperation = function() {
    var memoryLocation = this.readMemoryParameter(this);
    var byte = this.readFromMemory(memoryLocation) + 1;
    this.writeToMemory(byte, memoryLocation);
};
Cpu.prototype.incOperation.argumentLength = 2;

Cpu.prototype.sysOperation = function() {
    if (this.xRegister === 1 || this.xRegister === 2) {
        Kernel.handleInterupts(SYSTEM_CALL_IRQ, [this.xRegister, this.yRegister, this.currentProcess]);
    } else {
        this.throwError("Invalid parameter for system call");
    }
};
Cpu.prototype.sysOperation.argumentLength = 0;

Cpu.prototype.readValueParameter = function() {
    var value = MemoryManager.read(this.programCounter++, this.currentProcess);
    return parseInt(value, 16);
};

Cpu.prototype.readMemoryParameter = function() {
    var suffix = MemoryManager.read(this.programCounter++, this.currentProcess);
    var prefix = MemoryManager.read(this.programCounter++, this.currentProcess);
    return parseInt(prefix + "" + suffix, 16);
};

Cpu.prototype.readFromMemory = function(memoryLocation) {
    return parseInt(MemoryManager.read(memoryLocation + this.currentProcess.base, this.currentProcess), 16);
};

Cpu.prototype.writeToMemory = function(value, memoryLocation) {
    MemoryManager.write(value.toString(16), memoryLocation + this.currentProcess.base, this.currentProcess);
};

Cpu.prototype.throwError = function(message) { 
    Kernel.handleInterupts(PROCESS_FAULT_IRQ, [message, this.currentProcess]);
    this.reset();  
};

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