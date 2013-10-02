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

MemoryManager.write = function(data, location) {
    MemoryManager.memory.words[location] = new Word(data);
};

MemoryManager.read = function(location) {
    return MemoryManager.memory.words[location].data;
};