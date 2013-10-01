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
    this.programCounter = 0;    
    this.instructionRegister = 0;
    this.accumulator = 0;
    this.xRegister = 0;
    this.yRegister = 0;
    this.zFlag = 0;    
    this.isExecuting = false;    
    this.currentProcess = null;
}

Cpu.prototype.start = function(pcb) {
    this.programCounter = pcb.base;
    this.currentProcess = pcb;
    this.isExecuting = true;
};

Cpu.prototype.stop = function() {
    this.isExecuting = false;
    this.programCounter = 0;
    this.currentProcess = null;
};

Cpu.prototype.cycle = function() {
    Kernel.trace("CPU cycle");  
    
    this.instructionRegister = MemoryManager.read(this.programCounter);
    this.programCounter++;
    
    var operation = Cpu.operationMap[this.instructionRegister];
    
    if (operation) {
        operation(this);
    }
};

Cpu.ldaImmediateOperation = function(cpu) {
    cpu.accumulator = MemoryManager.read(cpu.programCounter++);
};

Cpu.ldaDirectOperation = function(cpu) {
    cpu.accumulator = MemoryManager.read(Cpu.retrieveMemoryLocation(cpu));
};

Cpu.staOperation = function(cpu) {
    MemoryManager.write(cpu.accumulator, Cpu.retrieveMemoryLocation(cpu));
};

Cpu.ldxImmediateOperation = function(cpu) {
    cpu.xRegister = MemoryManager.read(cpu.programCounter++);
};

Cpu.ldxDirectOperation = function(cpu) {
    cpu.xRegister = MemoryManager.read(Cpu.retrieveMemoryLocation(cpu));
};

Cpu.ldyImmediateOperation = function(cpu) {
    cpu.yRegister = MemoryManager.read(cpu.programCounter++);
};

Cpu.ldyDirectOperation = function(cpu) {
    cpu.yRegister = MemoryManager.read(Cpu.retrieveMemoryLocation(cpu));
};

Cpu.nopOperation = function(cpu) {};

Cpu.brkOperation = function(cpu) {
    cpu.isExecuting = false;
};

Cpu.cpxOperation = function(cpu) {
    var byte = MemoryManager.read(Cpu.retrieveMemoryLocation(cpu));
    cpu.zFlag = (byte === cpu.accumulator) ? 1 : 0;
};

//Cpu.bneOperation = function(cpu) {
//    if (cpu.zFlag) {
//        cpu.programCounter += 
//    }
//};

Cpu.incOperation = function(cpu) {
    var memoryLocation = Cpu.retrieveMemoryLocation(cpu);
    var byte = parseInt(MemoryManager.read(memoryLocation)) + 1;
    MemoryManager.write(byte, memoryLocation);    
};

Cpu.sysOperation = function(cpu) {
    if (cpu.xRegister === 1 || cpu.xRegister === 2) {
        Kernel.handleInterupts(SYSTEM_CALL_IRQ, cpu.xRegister);
    } else {
        // Trace an error
    }
};

Cpu.operationMap = {
    "a9": Cpu.ldaImmediateOperation,
    "ad": Cpu.ldaDirectOperation,
    "8d": Cpu.staOperation,
    "a2": Cpu.ldxImmediateOperation,
    "ae": Cpu.ldxDirectOperation,
    "a0": Cpu.ldyImmediateOperation,
    "ac": Cpu.ldyDirectOperation,
    "00": Cpu.brkOperation,
    "ea": Cpu.nopOperation,
    "ec": Cpu.cpxOperation,
    //"d0": Cpu.bneOperation,
    "ee": Cpu.incOperation,
    "ff": Cpu.sysOperation
};

Cpu.retrieveMemoryLocation = function(cpu) {
    var suffix = MemoryManager.read(cpu.programCounter++);
    var prefix = MemoryManager.read(cpu.programCounter++);
    return parseInt(prefix + "" + suffix, 16);
};