function ProcessManager() {};

ProcessManager.processControlBlocks = {};

ProcessManager.create = function() {
    var pcb = new ProcessControlBlock();
    ProcessManager.processControlBlocks[pcb.processId] = pcb;
    return pcb;
};

ProcessManager.destroy = function(pcb) {
    delete ProcessManager.processControlBlocks[pcb.processId];
};

ProcessManager.load = function(pcb, program) {           
    MemoryManager.allocate(pcb);               
    var components = program.split(" ");
    for (var i = 0; i < components.length; i++) {
        MemoryManager.write(components[i], pcb.base + i);
    }               
};

ProcessManager.unload = function(pcb) {
    for (var i = 0; i < pcb.limit; i++) {
        MemoryManager.write("00", pcb.base + i);
    }        
};

ProcessManager.execute = function(pcb) {
    _CPU.start(ProcessManager.processControlBlocks[pcb.processId]);
};

function ProcessControlBlock() {
    this.processId = ProcessControlBlock.lastProcessId++;
        
    this.programCounter = null;
    this.accumulator = 0;
    this.xRegister = 0;
    this.yRegister = 0;
    this.zFlag = 0;
       
    this.base = null;
    this.limit = null;
}

//ProcessControlBlock.update = function(programCounter, accumulator, xRegister, yRegister, zFlag) {
//    this.programCounter = programCounter;
//    this.accumulator = accumulator;
//    this.xRegister = xRegister;
//    this.yRegister = yRegister;
//    this.zFlag = zFlag;
//};

ProcessControlBlock.lastProcessId = 1;