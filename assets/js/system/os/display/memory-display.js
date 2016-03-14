/**
 * Singleton class that handles the memory display for the host
 */

function MemoryDisplay() {};

// The elements associated with the memory display. We need memoryDisplay for scrolling purposes
// and memoryDisplayTable to update and highlight certain locations
MemoryDisplay.memoryDisplay = $("#memory-display");
MemoryDisplay.memoryDisplayTable = $("#memory-display table tbody");

// The elements that will be prepended to memoryDisplayTable
MemoryDisplay.row = "<tr id='{0}'>{1}</tr>";
MemoryDisplay.cell = "<td id='{0}' class='memory-row'>{1}</td>";

// Updates every memory location while also highlighting and scrolling to certain location
MemoryDisplay.update = function() {
    // Empty the table so we don't get an infinitely large element that slows does Chrome
    MemoryDisplay.memoryDisplayTable.empty();
    
    // Iterate through each memory block
    for (var blockNumber = 0; blockNumber < Kernel.memoryManager.NUMBER_OF_BLOCKS; blockNumber++) {
        // By adding BLOCK_SIZE, we are essentially shifting to the next block
        var blockOffset = blockNumber * Kernel.memoryManager.BLOCK_SIZE;
        
        // Iterate through each row of the block
        for (var locationNumber = 0; locationNumber < Kernel.memoryManager.BLOCK_SIZE / 8; locationNumber++) {
            // This offset handles incrementing to the next row of the block
            var offset = locationNumber * 8;
            var location = blockOffset + offset;
            
            // The first cell will be the row marker, namely 0x0F8.
            var label = "0x" + pad(location.toString(16), 3, "0").toUpperCase();
            var cells = MemoryDisplay.cell.format("memory-row-label-" + location, label);

            // Iterate through each cell of the row
            for (var cellNumber = 0; cellNumber < 8; cellNumber++) {
                var cellId = location + cellNumber;
                var cellData = Kernel.memoryManager.read(cellId);
                // Add this cell to the cell list
                cells += MemoryDisplay.cell.format("memory-cell-" + cellId, cellData);
            }           
            
            // Print out all the cells for this particular row
            var row = MemoryDisplay.row.format("memory-row-" + location, cells);          
            MemoryDisplay.memoryDisplayTable.append(row);
            
            if (locationNumber === 0) {
                $("#memory-row-" + location).addClass("warning");
            }
        }
    }
    
    // Highlight and scroll to the instruction if it is not null
    if (_CPU.instructionRegister) {     
        // Highlights the instruction in question. Since the program counter is always
        // incremented past the instruction to account for parameters, we must subtract 
        // the number of arguments it has in order to be positioned correctly
        var memoryLocationOffset = _CPU.operationMap[_CPU.instructionRegister].argumentLength + 1;
        
        // Highlight all cells that are from the instruction to the current value of the program counter
        for (var i = _CPU.programCounter - memoryLocationOffset; i < _CPU.programCounter; i++) {
            var elementClass = (i === _CPU.programCounter - memoryLocationOffset) 
                      ? "highlighted-memory-instruction" 
                      : "highlighted-memory-parameter";
            $("#memory-cell-" + (i + CpuScheduler.currentProcess.base)).addClass(elementClass);
        }
        
        // If step mode is activated, we should scroll to the location. Otherise, we should
        // jump to the location immediately.
        if (CpuScheduler.currentProcess) {
            if (!Kernel.isStepModeActivated) { 
                // Jumps to the highlighted memory location
                MemoryDisplay.memoryDisplay.scrollTop(
                    $(".highlighted-memory-instruction").offset().top - MemoryDisplay.memoryDisplay.offset().top + MemoryDisplay.memoryDisplay.scrollTop()
                );
            } else {
                // Scrolls to the highlighted memory location
                MemoryDisplay.memoryDisplay.animate({
                    scrollTop: $(".highlighted-memory-instruction").offset().top - MemoryDisplay.memoryDisplay.offset().top + MemoryDisplay.memoryDisplay.scrollTop()
                }, 100);
            }
        }
    }
};

