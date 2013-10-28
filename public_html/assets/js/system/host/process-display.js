/**
 * Singleton class that handles the process display for the host
 */

function ProcessDisplay() {};

// The elements that correspond to the ProcessDisplay
ProcessDisplay.processDisplay = $("#process-display");
ProcessDisplay.processDisplayTable = $("#process-display table tbody"); 

ProcessDisplay.row = "<tr{0}>\
                          <td class='process-id'>{1}</td>\
                          <td class='process-pc-value'>{2}</td>\
                          <td class='process-ir-value'>{3}</td>\
                          <td class='process-acc-value'>{4}</td>\
                          <td class='process-x-value'>{5}</td>\
                          <td class='process-y-value'>{6}</td>\
                          <td class='process-z-value'>{7}</td>\
                      </tr>";

// Updates each componenent of the process within the display
ProcessDisplay.update = function() {    
    var displayProcess = function(process, isHighlighted) {
        var row = ProcessDisplay.row.format(
            isHighlighted ? " class='warning' " : "",
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
    
    var processes = []
    if (CpuScheduler.currentProcess !== null) {
        processes.push(CpuScheduler.currentProcess);
    }
    
    for (var i = 0; i < CpuScheduler.readyQueue.getSize(); i++) {
        var process = CpuScheduler.readyQueue.dequeue();
        processes.push(process);
        CpuScheduler.readyQueue.enqueue(process);
    }
    
    processes.sort(function(a, b) {
       return a.processId - b.processId; 
    });
    
    for (var i = 0; i < processes.length; i++) {
        if ((CpuScheduler.currentProcess !== null) && (processes[i].processId === CpuScheduler.currentProcess.processId)) {
            displayProcess(processes[i], true);
            ProcessDisplay.processDisplay.scrollTop(
                $(".warning").offset().top - ProcessDisplay.processDisplay.offset().top + ProcessDisplay.processDisplay.scrollTop()
            );
        } else {
            displayProcess(processes[i], false);
        }
    }   
    
    if (!ProcessDisplay.processDisplayTable.html()) {
        ProcessDisplay.processDisplayTable.html("<tr><td class='lead text-center' colspan='7'>No programs are in execution</td></tr>");
    }
};