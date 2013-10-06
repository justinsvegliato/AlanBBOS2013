function MemoryDisplay() {};

MemoryDisplay.memoryDisplay = $("#memory-display");
MemoryDisplay.memoryDisplayTable = $("#memory-display table tbody");
MemoryDisplay.row = "<tr>{0}</tr>";
MemoryDisplay.cell = "<td id='{0}'>{1}</td>";

MemoryDisplay.update = function(memoryManager, cpu, isStepModeActivated) {
    MemoryDisplay.memoryDisplayTable.empty();
    for (var blockNumber = 0; blockNumber < memoryManager.NUMBER_OF_BLOCKS; blockNumber++) {
        var blockOffset = blockNumber * 256;
        for (var locationNumber = 0; locationNumber < memoryManager.BLOCK_SIZE / 8; locationNumber++) {
            var offset = locationNumber * 8;
            var location = blockOffset + offset;

            var label = "0x" + pad(location.toString(16), 3).toUpperCase();
            var cells = MemoryDisplay.cell.format("memory-row-" + location, label);

            for (var cellNumber = 0; cellNumber < 8; cellNumber++) {
                var cellId = location + cellNumber;
                var cellData = memoryManager.read(cellId);
                cells += MemoryDisplay.cell.format("memory-cell-" + cellId, cellData);
            }

            var row = MemoryDisplay.row.format(cells);
            MemoryDisplay.memoryDisplayTable.append(row);
        }
    }
    
    if (cpu.instructionRegister) {     
        var memoryLocationOffset = cpu.operationMap[cpu.instructionRegister].argumentLength + 1;
        for (var i = cpu.programCounter - memoryLocationOffset; i < cpu.programCounter; i++) {
            $("#memory-cell-" + i).addClass('highlighted-location');
        }
        
        if (!isStepModeActivated) {
            MemoryDisplay.memoryDisplay.scrollTop(
                $(".highlighted-location").offset().top - MemoryDisplay.memoryDisplay.offset().top + MemoryDisplay.memoryDisplay.scrollTop()
            );
        } else {
            MemoryDisplay.memoryDisplay.animate({
                scrollTop: $(".highlighted-location").offset().top - MemoryDisplay.memoryDisplay.offset().top + MemoryDisplay.memoryDisplay.scrollTop()
            });
        }

    }
};