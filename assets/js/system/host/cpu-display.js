/**
 * Singleton class that handles the cpu display for the host
 */

function CpuDisplay() {};

// The elements that correspond to each CPU component
CpuDisplay.programCounterValue = $("#pc-value");
CpuDisplay.instructionRegisterValue = $("#ir-value");
CpuDisplay.accumulatorValue = $("#acc-value");
CpuDisplay.xRegisterValue = $("#x-value");
CpuDisplay.yRegisterValue = $("#y-value");
CpuDisplay.zFlagValue = $("#z-value");

// Updates all values of the cpu
CpuDisplay.update = function(cpu) {
    CpuDisplay.programCounterValue.html(cpu.programCounter);
    // The instruction register to cast to a string in order to invoke toUpperCase()
    CpuDisplay.instructionRegisterValue.html(cpu.instructionRegister.toString().toUpperCase());
    CpuDisplay.accumulatorValue.html(cpu.accumulator);
    CpuDisplay.xRegisterValue.html(cpu.xRegister);
    CpuDisplay.yRegisterValue.html(cpu.yRegister);
    CpuDisplay.zFlagValue.html(cpu.zFlag);    
};