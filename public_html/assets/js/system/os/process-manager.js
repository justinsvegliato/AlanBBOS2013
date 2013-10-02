function ProcessManager() {};

ProcessManager.processControlBlocks = {};

ProcessManager.load = function(program) {
    if (Object.keys(ProcessManager.processControlBlocks).length < MemoryManager.NUMBER_OF_BLOCKS) {
        var pcb = new ProcessControlBlock();
        ProcessManager.processControlBlocks[pcb.processId] = pcb;

        MemoryManager.allocate(pcb);               

        var components = program.split(" ");
        for (var i = 0; i < components.length; i++) {
            MemoryManager.write(components[i], i + pcb.base);
        }       

        return pcb;
    }
};

ProcessManager.unload = function(pcb) {
    MemoryManager.deallocate(pcb);
    delete ProcessManager.processControlBlocks[pcb.processId];
};

ProcessManager.execute = function(pcb) {
    Kernel.handleInterupts(PROCESS_INITIATION_IRQ, pcb);
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

ProcessControlBlock.update = function(programCounter, accumulator, xRegister, yRegister, zFlag) {
    this.programCounter = programCounter;
    this.accumulator = accumulator;
    this.xRegister = xRegister;
    this.yRegister = yRegister;
    this.zFlag = zFlag;
};

ProcessControlBlock.lastProcessId = 1;