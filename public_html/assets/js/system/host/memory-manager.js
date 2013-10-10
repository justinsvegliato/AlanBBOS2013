/**
 * Singleton class that handles memory management
 */

function MemoryManager() {};

MemoryManager.MEMORY_SIZE = 256;
MemoryManager.NUMBER_OF_BLOCKS = 1;
MemoryManager.BLOCK_SIZE = MemoryManager.MEMORY_SIZE / MemoryManager.NUMBER_OF_BLOCKS;

MemoryManager.memory = new Memory(MemoryManager.MEMORY_SIZE);
MemoryManager.availableBlocks = _.range(MemoryManager.NUMBER_OF_BLOCKS);

// Allocates memory for the specified pcb
MemoryManager.allocate = function(pcb) {
    // Set the base and limit of the PCB from an unallocated block
    pcb.base = MemoryManager.availableBlocks.shift() * MemoryManager.BLOCK_SIZE;
    pcb.limit = MemoryManager.BLOCK_SIZE - 1;
    
    // Sort the memory just so processes are place in intuitive locations within memory
    // just so future user processes will be placed in the earliest spot
    MemoryManager.availableBlocks.sort();
};

// Deallocates memory for the specified pcb
MemoryManager.deallocate = function(pcb) {
    // Push the block number that was previously associated with this process onto the queue
    var blockNumber = pcb.base / MemoryManager.BLOCK_SIZE;
    MemoryManager.availableBlocks.push(blockNumber);
    
    // Sort it just so future user processes will be placed in the earliest spot
    MemoryManager.availableBlocks.sort();
    
    // Clear the memory by setting all affected location to 00
    for (var i = pcb.base; i < pcb.limit; i++) {
        MemoryManager.memory.words[i] = new Word("00");
    }
    
    // Set the base and limit of the process to null
    pcb.base = null;
    pcb.limit = null;
};

// Writes the data to the specified memory location (if a pcb is specified, check to see if
// the location is within the memory bounds of the process)
MemoryManager.write = function(data, location, pcb) {
    // Adjust the base and limit registers if a pcb is or is not specified
    var base = (typeof pcb === 'undefined') ? 0 : pcb.base;
    var limit = (typeof pcb === 'undefined') ? MemoryManager.MEMORY_SIZE - 1 : pcb.limit;
    
    // If the location is out of bounds, throw an error
    if (!(location >= 0 && location <= limit)) {
        Kernel.handleInterupts(MEMORY_ACCESS_FAULT_IRQ, pcb);
    } else {    
        MemoryManager.memory.words[location + base] = new Word(data);
    }
};

// Read the data from the specified memory location (if a pcb is specified, check to see if
// the location is within the memory bounds of the process)
MemoryManager.read = function(location, pcb) {
    // Adjust the base and limit registers if a pcb is or is not specified    
    var base = (typeof pcb === 'undefined') ? 0 : pcb.base;
    var limit = (typeof pcb === 'undefined') ? MemoryManager.MEMORY_SIZE - 1 : pcb.limit;
    
    // If the location is out of bounds, throw an error
    if (!(location >= 0 && location <= limit)) {
        Kernel.handleInterupts(MEMORY_ACCESS_FAULT_IRQ, pcb);
    } else {
        return MemoryManager.memory.words[location + base].data;
    }
};