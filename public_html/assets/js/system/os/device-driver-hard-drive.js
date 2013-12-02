/** 
 * Requires deviceDriver.js
 * 
 * The driver that handles all hard drive actions.

 */

// Inherit from prototype DeviceDriver in deviceDriver.js
DeviceDriverHardDrive.prototype = new DeviceDriver;

function DeviceDriverHardDrive() {
    HardDriveManager.initialize();
};

//
// Methods (these override the methods in the parent class)
//

// Initialization routine for the kernel-mode hard drive device driver
DeviceDriverHardDrive.prototype.driverEntry = function() {
    this.status = "loaded";
};

// The interupt service routine that handles hard drive actions
DeviceDriverHardDrive.prototype.isr = function(params) {
    var requestedDiskOperation = params[0];
    var params = params.slice(1);
    
    // Execute the disk operation if the operation is valid
    var diskOperation = DeviceDriverHardDrive.diskOperations[requestedDiskOperation];
    if (diskOperation) {
        diskOperation(params);
    } else {
        var message = "Invalid disk operation specified: " + requestedDiskOperation;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message, params[0]]);
    }
};

// Creates a file on the hard drive
DeviceDriverHardDrive.createFile = function(params) {
    var directory = params[0];
    
    // First check if the file has a .swp extension
    if (DeviceDriverHardDrive.checkIfSwapFile(directory, "File cannot be created")) {
        if (HardDriveManager.createFile(directory)) {
            Kernel.stdIn.handleResponse("File created: " + directory);
        } else {
            Kernel.stdIn.handleResponse("File already exists: " + directory);
        }
    }
};

// Lists all the files on the hard drive
DeviceDriverHardDrive.listFiles = function() {
    // Iterate through all files if they exist
    var files = HardDriveManager.getFiles();
    if (files.length) {
        // Print out each file on the drive
        for (var i = 0; i < files.length; i++) {
            Kernel.stdIn.handleResponse(files[i]);
            Kernel.stdIn.advanceLine();
        }
    } else {
        Kernel.stdIn.handleResponse("No files exist");
    }
};

// Writes data to the specified file
DeviceDriverHardDrive.writeFile = function(params) {
    var directory = params[0];
    var data = params[1];
    
    // First check if the file has a .swp extension
    if (DeviceDriverHardDrive.checkIfSwapFile(directory, "File cannot be modified")) {
        if (HardDriveManager.writeFile(directory, data)) {
            Kernel.stdIn.handleResponse("File updated: " + directory);
        } else {        
            Kernel.stdIn.handleResponse("File does not exist: " + directory);
        }
    }
};

// Reads the specified file from the disk
DeviceDriverHardDrive.readFile = function(params) {
    var directory = params[0];
    var content = HardDriveManager.readFile(directory);
    if (content) {
        Kernel.stdIn.handleResponse(content);     
    } else {        
        Kernel.stdIn.handleResponse("File does not exist: " + directory);
    }
};

// Deletes the specified file from the disk
DeviceDriverHardDrive.deleteFile = function(params) {
    var directory = params[0];
    if (DeviceDriverHardDrive.checkIfSwapFile(directory, "File cannot be deleted")) {
        if (HardDriveManager.deleteFile(directory)) {
            Kernel.stdIn.handleResponse("File deleted: " + directory);
        } else {        
            Kernel.stdIn.handleResponse("File does not exist: " + directory);
        }
    }
};

// Stores the in memory process to the hard drive and places the process on the hard drive
// in memory
DeviceDriverHardDrive.swap = function(params) {
    var inMemoryProcess = params[0];
    var harddriveProcess = params[1];
    
    // Read program from the hard drive
    var filename = "process-" + harddriveProcess.processId + ".swp";
    var program = HardDriveManager.readFile(filename);
    
    // Unload the program from the hard drive after storing it to a temporary variable
    DeviceDriverHardDrive.unloadProcess([harddriveProcess]);
    
    // Deallocate and load the process onto the disk if there is a process in memory
    if (inMemoryProcess) {
        DeviceDriverHardDrive.loadProcess([inMemoryProcess, inMemoryProcess.getProgram()]);  
        MemoryManager.deallocate(inMemoryProcess);
        inMemoryProcess.inMemory = false;
    }
        
    // Place the process that was previously on the hard drive to memory
    var memoryLocations = program.match(/.{1,2}/g);
    MemoryManager.allocate(harddriveProcess, memoryLocations);    
    harddriveProcess.inMemory = true;
};

// Loads the process into memory
DeviceDriverHardDrive.loadProcess = function(params) {
    var pcb = params[0];
    var program = params[1];    
    var filename = "process-" + pcb.processId + ".swp";
    HardDriveManager.createFile(filename);
    HardDriveManager.writeFile(filename, program);
};

// Removes the process from memory
DeviceDriverHardDrive.unloadProcess = function(params) {
    var pcb = params[0];
    var filename = "process-" + pcb.processId + ".swp";
    HardDriveManager.deleteFile(filename);    
};

// Erases the disk
DeviceDriverHardDrive.formatDisk = function() {
    HardDriveManager.initialize();
};

// Checks if the file has a .swp extension (users cannot modify or create .swp files)
DeviceDriverHardDrive.checkIfSwapFile = function(directory, message) {
    if (!directory.match(/.swp$/)) {
        return true;
    }
    Kernel.stdIn.handleResponse(message + ": " + directory);
    return false;
};

// Map that associates ISR operations to the corresponding functions
DeviceDriverHardDrive.diskOperations = {
    "create": DeviceDriverHardDrive.createFile,
    "read": DeviceDriverHardDrive.readFile,
    "write": DeviceDriverHardDrive.writeFile,
    "delete": DeviceDriverHardDrive.deleteFile,
    "ls": DeviceDriverHardDrive.listFiles,
    "format": DeviceDriverHardDrive.formatDisk,
    "loadProcess": DeviceDriverHardDrive.loadProcess,
    "unloadProcess": DeviceDriverHardDrive.unloadProcess,
    "swap": DeviceDriverHardDrive.swap
};