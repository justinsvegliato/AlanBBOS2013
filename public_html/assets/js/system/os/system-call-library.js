// Empty constructor - this class is essentially a singleton in a certain sense
function SystemCallLibrary() {};

// Terminates the process
SystemCallLibrary.terminateProcess = function(params) {
    // Clean up the cpu and the process manager (set everything back to default settings)
    var pcb = params[0];
    
    // Remove the process from the CPU scheduler. If is the process currently being executed,
    // we must stop it and set the cycle number. On the other hand, if it's not being executed,
    // just removed it from the ready queue. This is a sequential search provided that the
    // ready queue is a queue. This would be faster with a dictionary or something like that.
    if (CpuScheduler.currentProcess !== null) {
        if (CpuScheduler.currentProcess.processId === pcb.processId) {
            CpuScheduler.currentProcess = null;
            CpuScheduler.cycle = 0; 
            _CPU.stop();
        } else {
            for (var i = 0; i < CpuScheduler.readyQueue.getSize(); i++) {
                var process = CpuScheduler.readyQueue.dequeue();
                if (process.processId !== pcb.processId) {
                   CpuScheduler.readyQueue.enqueue(process);
                }
            }
        }
    }
    
    // Terminate the process and unload it from the process manager (which de-allocates memory)
    pcb.state = ProcessControlBlock.State.TERMINATED;
    ProcessManager.unload(pcb);
};

// Print the contents of the y Register.
SystemCallLibrary.printYRegisterValue = function(params) {
    var pcb = params[0];
    var yRegister = params[1];
    Kernel.console.putText(yRegister.toString());
    pcb.output += yRegister.toString();
};

// Print the 00-terminated string starting at the memory location held by the y register
SystemCallLibrary.printNullTerminatedString = function(params) {
    var pcb = params[0];
    var yRegister = params[1];
    var byte = null;
    var memoryLocation = yRegister;
    
    // Keep looping unless we see a "00" (or a 0 since we call parseInt on the value
    // at the memory location
    while ((byte = parseInt(MemoryManager.read(memoryLocation++, pcb), 16)) !== 0) {
        Kernel.console.putText(String.fromCharCode(byte));
        pcb.output += String.fromCharCode(byte);
    }
};

// Dictionary that maps the system call id to a particular function
SystemCallLibrary.systemCallInterface = {
    0: SystemCallLibrary.terminateProcess,
    1: SystemCallLibrary.printYRegisterValue,
    2: SystemCallLibrary.printNullTerminatedString
};