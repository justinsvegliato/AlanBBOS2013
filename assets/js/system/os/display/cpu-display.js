/**
 * Singleton class that handles the _CPU display for the host
 */

function CpuDisplay() {};

// The elements that correspond to each CPU component
CpuDisplay.instructionDetailsValue = $("#instruction-details");
CpuDisplay.programCounterValue = $("#pc-value");
CpuDisplay.instructionRegisterValue = $("#ir-value");
CpuDisplay.accumulatorValue = $("#acc-value");
CpuDisplay.xRegisterValue = $("#x-value");
CpuDisplay.yRegisterValue = $("#y-value");
CpuDisplay.zFlagValue = $("#z-value");

// Updates all values of the _CPU
CpuDisplay.update = function() {
    CpuDisplay.instructionDetailsValue.html(CpuDisplay.getInstructionDetails());
    CpuDisplay.programCounterValue.html(_CPU.programCounter);
    // The instruction register to cast to a string in order to invoke toUpperCase()
    CpuDisplay.instructionRegisterValue.html(_CPU.instructionRegister.toString().toUpperCase());
    CpuDisplay.accumulatorValue.html(_CPU.accumulator);
    CpuDisplay.xRegisterValue.html(_CPU.xRegister);
    CpuDisplay.yRegisterValue.html(_CPU.yRegister);
    CpuDisplay.zFlagValue.html(_CPU.zFlag);    
};

CpuDisplay.getInstructionDetails = function() {
    var instruction = _CPU.instructionRegister;
    if (instruction) {
        var instructionEntry = _CPU.operationMap[instruction];
        var argumentLength = instructionEntry.argumentLength;
        if (argumentLength === 0) {
            return _CPU.operationMap[instruction].mnemonic;
        } else if (argumentLength === 1) {
            var argument = "";
            $(".highlighted-memory-parameter").each(function() {
               argument += $(this).text(); 
            });
            return _CPU.operationMap[instruction].mnemonic + " #$" + argument;
        } else {
            var argument = "";
            $(".highlighted-memory-parameter").each(function() {
               argument += $(this).text(); 
            });
            argument = argument.slice(2) + argument.slice(0, 2);
            return _CPU.operationMap[instruction].mnemonic + " $" + argument;
        }      
    } else {
        return "No Instruction";
    }
};