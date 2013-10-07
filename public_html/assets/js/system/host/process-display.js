/**
 * Singleton class that handles the process display for the host
 */

function ProcessDisplay() {};

// The elements that correspond to each pcb component
ProcessDisplay.processId = $("#process-id");
ProcessDisplay.programCounterValue = $("#process-pc-value");
ProcessDisplay.instructionRegisterValue = $("#process-ir-value");
ProcessDisplay.accumulatorValue = $("#process-acc-value");
ProcessDisplay.xRegisterValue = $("#process-x-value");
ProcessDisplay.yRegisterValue = $("#process-y-value");
ProcessDisplay.zFlagValue = $("#process-z-value");

// Updates each componenent of the process within the display
ProcessDisplay.update = function(cpu) {
    // Only update the process display if the cpu is currently handling a process
    if (cpu.currentProcess !== null) {
        ProcessDisplay.processId.html(cpu.currentProcess.processId);
        ProcessDisplay.programCounterValue.html(cpu.currentProcess.programCounter);
        ProcessDisplay.instructionRegisterValue.html(cpu.currentProcess.instructionRegister.toString().toUpperCase());
        ProcessDisplay.accumulatorValue.html(cpu.currentProcess.accumulator);
        ProcessDisplay.xRegisterValue.html(cpu.currentProcess.xRegister);
        ProcessDisplay.yRegisterValue.html(cpu.currentProcess.yRegister);
        ProcessDisplay.zFlagValue.html(cpu.currentProcess.zFlag);    
    }
};