/**
 * Singleton class that handles the process display for the host
 */

function ProcessDisplay() {};

// The elements that correspond to the ProcessDisplay
ProcessDisplay.processDisplay = $("#process-display");
ProcessDisplay.processDisplayTable = $("#process-display table tbody"); 
ProcessDisplay.schedulingAlgorithm = $("#scheduling-algorithm"); 

// Element to be populated by the process display code
ProcessDisplay.row = "<tr{0}>\
                          <td class='process-id'>{1}</td>\
                          <td class='process-pc-value'>{2}</td>\
                          <td class='process-ir-value highlighted-instruction'>{3}</td>\
                          <td class='process-acc-value'>{4}</td>\
                          <td class='process-x-value'>{5}</td>\
                          <td class='process-y-value'>{6}</td>\
                          <td class='process-z-value'>{7}</td>\
                          <td class='process-priority'>{8}</td>\
                          <td class='process-z-value'>{9}</td>\
                          <td class='process-location-value'>{10}</td>\
                      </tr>";

// Updates each componenent of the process within the display
ProcessDisplay.update = function() { 
    // Handles displaying the process to the screen
    var displayProcess = function(process, isHighlighted) {
        var row = ProcessDisplay.row.format(
            isHighlighted ? " class='warning' " : "",
            process.processId,
            process.programCounter,
            process.instructionRegister.toString().toUpperCase(),
            process.accumulator,
            process.xRegister,
            process.yRegister,
            process.zFlag,
            process.priority,
            process.state,
            process.inMemory ? "Memory" : "Hard Drive"
        );
        ProcessDisplay.processDisplayTable.append(row);
    };
        
    // Clears the display box so we don't get an infinitely long div
    ProcessDisplay.processDisplayTable.empty();
    
    // The following code handles adding the current process (if it exists) and 
    // all processeson the queue to a list that it can be sorted
    var processes = []
    if (CpuScheduler.currentProcess !== null) {
        processes.push(CpuScheduler.currentProcess);
    }    
    for (var i = 0; i < CpuScheduler.readyQueue.getSize(); i++) {
        var process = CpuScheduler.readyQueue.dequeue();
        processes.push(process);
        CpuScheduler.readyQueue.enqueue(process);
    }
    
    // Sort the process list based on process id
    processes.sort(function(a, b) {
       return a.processId - b.processId; 
    });
    
    // Add all processes in the process list to the div and scroll to the currently running process
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
    
    // If there are no processes, display some message.
    if (!ProcessDisplay.processDisplayTable.html()) {
        ProcessDisplay.processDisplayTable.html("<tr><td class='lead text-center' colspan='10'>No programs are in execution</td></tr>");
    }
    
    // Update the cpu scheduling label
    ProcessDisplay.schedulingAlgorithm.html(CpuScheduler.getAlgorithm());
};