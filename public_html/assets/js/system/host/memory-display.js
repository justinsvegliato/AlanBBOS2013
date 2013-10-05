function MemoryDisplay() {};

MemoryDisplay.memoryDisplay = $("#memory-display");
MemoryDisplay.memoryDisplayTable = $("#memory-display table tbody");
MemoryDisplay.row = "<tr>{0}</tr>";
MemoryDisplay.cell = "<td id='{0}'>{1}</td>";

MemoryDisplay.highlightedLocation = null;

MemoryDisplay.instructionParameterMap = {
    "a9": 1,
    "ad": 2,
    "8d": 2,
    "a2": 1,
    "ae": 2,
    "a0": 1,
    "ac": 2,
    "00": 0,
    "ea": 0,
    "ec": 2,
    "d0": 1,
    "ee": 2,
    "ff": 0
};

MemoryDisplay.update = function(memoryManager, cpu) {
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
    
    if (cpu.isExecuting) {     
        var memoryLocationOffset = MemoryDisplay.instructionParameterMap[cpu.instructionRegister] + 1;
        for (var i = cpu.programCounter - memoryLocationOffset; i < cpu.programCounter; i++) {
            $("#memory-cell-" + i).addClass('highlighted-location');
        }
    }
};