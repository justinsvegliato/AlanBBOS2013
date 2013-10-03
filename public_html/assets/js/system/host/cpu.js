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
    this.currentProcess = pcb;
    this.programCounter = pcb.base;
    this.isExecuting = true;
};

Cpu.prototype.stop = function() {
    this.programCounter = 0;    
    this.instructionRegister = 0;
    this.accumulator = 0;
    this.xRegister = 0;
    this.yRegister = 0;
    this.zFlag = 0;    
    this.isExecuting = false;   
    this.currentProcess = null;
};

Cpu.prototype.cycle = function() {
    Kernel.trace("CPU cycle");  
    
    this.instructionRegister = MemoryManager.read(this.programCounter).toLowerCase();
    this.programCounter++;
    
    var operation = Cpu.operationMap[this.instructionRegister];
    
    if (operation) {
        operation(this);    
        
        if (this.currentProcess) {
            this.currentProcess.update(this.programCounter, this.instructionRegister, this.accumulator, this.xRegister, this.yRegister, this.zFlag);
        }
    }     
};

Cpu.ldaImmediateOperation = function(cpu) {
    cpu.accumulator = Cpu.readValue(cpu);
};

Cpu.ldaDirectOperation = function(cpu) {
    cpu.accumulator = Cpu.readMemoryLocation(cpu);
};

Cpu.staOperation = function(cpu) {
    Cpu.writeToMemory(cpu.accumulator, cpu);   
};

Cpu.ldxImmediateOperation = function(cpu) {
    cpu.xRegister = Cpu.readValue(cpu);
};

Cpu.ldxDirectOperation = function(cpu) {
    cpu.xRegister = Cpu.readMemoryLocation(cpu);
};

Cpu.ldyImmediateOperation = function(cpu) {
    cpu.yRegister = Cpu.readValue(cpu);
};

Cpu.ldyDirectOperation = function(cpu) {
    cpu.yRegister = Cpu.readMemoryLocation(cpu);
};

Cpu.nopOperation = function(cpu) {};

Cpu.brkOperation = function(cpu) {
    Kernel.handleInterupts(PROCESS_TERMINATION_IRQ, cpu.currentProcess);
};

Cpu.cpxOperation = function(cpu) {
    var byte = Cpu.readMemoryLocation();
    cpu.zFlag = (byte === cpu.accumulator) ? 1 : 0;
};

Cpu.bneOperation = function(cpu) {
    if (!cpu.zFlag) {
        var location = cpu.programCounter + Cpu.readValue(cpu);
        location = location > cpu.currentProcess.limit 
                 ? location - cpu.currentProcess.limit - 1 
                 : location;
        cpu.programCounter = location;
    }
};

Cpu.incOperation = function(cpu) {
    var byte = Cpu.readValue(cpu) + 1;
    Cpu.writeToMemory(byte, cpu);
};

Cpu.sysOperation = function(cpu) {
    if (cpu.xRegister === 1 || cpu.xRegister === 2) {
        Kernel.handleInterupts(SYSTEM_CALL_IRQ, [cpu.xRegister, cpu.yRegister]);
    } else {
        // TODO: Trace an error
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
    "d0": Cpu.bneOperation,
    "ee": Cpu.incOperation,
    "ff": Cpu.sysOperation
};

Cpu.readValue = function(cpu) {
    var value = MemoryManager.read(cpu.programCounter++, cpu.currentProcess);
    return parseInt(value, 16);
};

Cpu.readMemoryLocation = function(cpu) {
    var suffix = MemoryManager.read(cpu.programCounter++, cpu.currentProcess);
    var prefix = MemoryManager.read(cpu.programCounter++, cpu.currentProcess);
    return parseInt(prefix + "" + suffix, 16);
};

Cpu.writeToMemory = function(value, cpu) {
    MemoryManager.write(value, Cpu.readMemoryLocation(cpu), cpu.currentProcess);
};