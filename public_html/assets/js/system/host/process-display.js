function ProcessDisplay() {};

ProcessDisplay.processId = $("#process-id");
ProcessDisplay.programCounterValue = $("#process-pc-value");
ProcessDisplay.instructionRegisterValue = $("#process-ir-value");
ProcessDisplay.accumulatorValue = $("#process-acc-value");
ProcessDisplay.xRegisterValue = $("#process-x-value");
ProcessDisplay.yRegisterValue = $("#process-y-value");
ProcessDisplay.zFlagValue = $("#process-z-value");

ProcessDisplay.update = function(cpu) {
    if (cpu.currentProcess !== null) {
        ProcessDisplay.processId.html(cpu.currentProcess.processId);
        ProcessDisplay.programCounterValue.html(cpu.currentProcess.programCounter);
        ProcessDisplay.instructionRegisterValue.html(cpu.currentProcess.instructionRegister.toUpperCase());
        ProcessDisplay.accumulatorValue.html(cpu.currentProcess.accumulator);
        ProcessDisplay.xRegisterValue.html(cpu.currentProcess.xRegister);
        ProcessDisplay.yRegisterValue.html(cpu.currentProcess.yRegister);
        ProcessDisplay.zFlagValue.html(cpu.currentProcess.zFlag);    
    }
};