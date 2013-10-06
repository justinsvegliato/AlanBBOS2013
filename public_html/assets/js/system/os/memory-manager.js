function MemoryManager() {};

MemoryManager.MEMORY_SIZE = 768;
MemoryManager.NUMBER_OF_BLOCKS = 3;
MemoryManager.BLOCK_SIZE = MemoryManager.MEMORY_SIZE / MemoryManager.NUMBER_OF_BLOCKS;

MemoryManager.memory = new Memory(MemoryManager.MEMORY_SIZE);
MemoryManager.availableBlocks = _.range(MemoryManager.NUMBER_OF_BLOCKS);

MemoryManager.allocate = function(pcb) {
    pcb.base = MemoryManager.availableBlocks.shift() * MemoryManager.BLOCK_SIZE;
    pcb.limit = pcb.base + MemoryManager.BLOCK_SIZE - 1;
    MemoryManager.availableBlocks.sort();
};

MemoryManager.deallocate = function(pcb) {
    var blockNumber = pcb.base / MemoryManager.BLOCK_SIZE;
    MemoryManager.availableBlocks.push(blockNumber);
    MemoryManager.availableBlocks.sort();
    
    for (var i = pcb.base; i < pcb.limit; i++) {
        MemoryManager.memory.words[i] = new Word("00");
    }
    
    pcb.base = null;
    pcb.limit = null;
};

MemoryManager.write = function(data, location, pcb) {
    var base = (typeof pcb === 'undefined') ? 0 : pcb.base;
    var limit = (typeof pcb === 'undefined') ? MemoryManager.MEMORY_SIZE - 1 : pcb.limit;
    
    if (!(location >= base && location <= limit)) {
        Kernel.handleInterupts(MEMORY_FAULT_IRQ, pcb);
    } else {    
        MemoryManager.memory.words[location] = new Word(data);
    }
};

MemoryManager.read = function(location, pcb) {
    var base = (typeof pcb === 'undefined') ? 0 : pcb.base;
    var limit = (typeof pcb === 'undefined') ? MemoryManager.MEMORY_SIZE - 1 : pcb.limit;
    
    if (!(location >= base && location <= limit)) {
        Kernel.handleInterupts(MEMORY_FAULT_IRQ, pcb);
    } else {
        return MemoryManager.memory.words[location].data;
    }
};