function MemoryDisplay() {};

MemoryDisplay.memoryDisplay = $("#memory-display table tbody");

MemoryDisplay.element = "<tr> \
                            <td>{0}</td> \
                            <td>{1}</td> \
                            <td>{2}</td> \
                            <td>{3}</td> \
                            <td>{4}</td> \
                            <td>{5}</td> \
                            <td>{6}</td> \
                            <td>{7}</td> \
                            <td>{8}</td> \
                        </tr>";


MemoryDisplay.update = function(memoryManager) {
    MemoryDisplay.memoryDisplay.empty();
    for (var blockNumber = 0; blockNumber < memoryManager.NUMBER_OF_BLOCKS; blockNumber++) {
        var blockOffset = blockNumber * 256;
        for (var locationNumber = 0; locationNumber < memoryManager.BLOCK_SIZE / 8; locationNumber++) {
            var offset = locationNumber * 8;
            var location = blockOffset + offset;
            var label = "0x" + pad(location.toString(16), 3).toUpperCase();
            var row = MemoryDisplay.element.format(
                label,
                memoryManager.read(location),
                memoryManager.read(location + 1),
                memoryManager.read(location + 2),
                memoryManager.read(location + 3),
                memoryManager.read(location + 4),
                memoryManager.read(location + 5),
                memoryManager.read(location + 6),
                memoryManager.read(location + 7)
            );
            MemoryDisplay.memoryDisplay.append(row);
        }        
    }
};