function CpuDisplay() {};

var programCounterValue = $("#pc-value");
var accumulatorValue = $("#acc-value");
var xRegisterValue = $("#x-value");
var yRegisterValue = $("#y-value");
var zFlagValue = $("#z-value");

CpuDisplay.update = function(cpu) {
    programCounterValue.html(cpu.programCounter);
    accumulatorValue.html(cpu.accumulator);
    xRegisterValue.html(cpu.xRegister);
    yRegisterValue.html(cpu.yRegister);
    zFlagValue.html(cpu.zFlag);    
};