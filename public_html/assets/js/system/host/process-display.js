/**
 * Singleton class that handles the process display for the host
 */

function ProcessDisplay() {};

// The elements that correspond to the ProcessDisplay
ProcessDisplay.processDisplay = $("#process-display");
ProcessDisplay.processDisplayTable = $("#process-display table tbody"); 

ProcessDisplay.row = "<tr>\
                          <td id='process-id'>{0}</td>\
                          <td id='process-pc-value'>{1}</td>\
                          <td id='process-ir-value'>{2}</td>\
                          <td id='process-acc-value'>{3}</td>\
                          <td id='process-x-value'>{3}</td>\
                          <td id='process-y-value'>{4}</td>\
                          <td id='process-z-value'>{5}</td>\
                      </tr>"

// Updates each componenent of the process within the display
ProcessDisplay.update = function(cpuScheduler) {    
    var displayProcess = function(process) {
        var row = ProcessDisplay.row.format(
            process.processId,
            process.programCounter,
            process.instructionRegister,
            process.accumulator,
            process.xRegister,
            process.yRegister,
            process.zFlag
        );
        ProcessDisplay.processDisplayTable.append(row);
    };
        
    ProcessDisplay.processDisplayTable.empty();
    
    if (cpuScheduler.currentProcess !== null) {
        displayProcess(cpuScheduler.currentProcess);
    }
    
    for (var i = 0; i < cpuScheduler.readyQueue.getSize(); i++) {
        var process = CpuScheduler.readyQueue.dequeue();
        displayProcess(process);
        CpuScheduler.readyQueue.enqueue(process);
    }
    
    if (!ProcessDisplay.processDisplayTable.html()) {
        ProcessDisplay.processDisplayTable.html("<tr><td class='lead text-center' colspan='7'>No programs are in execution</td></tr>");
    }
};