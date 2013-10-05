function CpuDisplay() {};

CpuDisplay.programCounterValue = $("#pc-value");
CpuDisplay.instructionRegisterValue = $("#ir-value");
CpuDisplay.accumulatorValue = $("#acc-value");
CpuDisplay.xRegisterValue = $("#x-value");
CpuDisplay.yRegisterValue = $("#y-value");
CpuDisplay.zFlagValue = $("#z-value");

CpuDisplay.update = function(cpu) {
    CpuDisplay.programCounterValue.html(cpu.programCounter);
    CpuDisplay.instructionRegisterValue.html(cpu.instructionRegister.toString().toUpperCase());
    CpuDisplay.accumulatorValue.html(cpu.accumulator);
    CpuDisplay.xRegisterValue.html(cpu.xRegister);
    CpuDisplay.yRegisterValue.html(cpu.yRegister);
    CpuDisplay.zFlagValue.html(cpu.zFlag);    
};