DeviceDriverHardDrive.prototype = new DeviceDriver;

function DeviceDriverHardDrive() {
    HardDriveManager.initialize();
};

DeviceDriverHardDrive.prototype.driverEntry = function() {
    this.status = "loaded";
};

DeviceDriverHardDrive.prototype.isr = function(params) {
    var requestedDiskOperation = params[0];
    var params = params.slice(1);
    var diskOperation = DeviceDriverHardDrive.diskOperations[requestedDiskOperation];
    if (diskOperation) {
        diskOperation(params);
    } else {
        var message = "Invalid disk operation specified: " + requestedDiskOperation;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message, params[0]]);
    }
};

DeviceDriverHardDrive.createFile = function(params) {
    var directory = params[0];
    if (DeviceDriverHardDrive.checkIfSwapFile(directory, "File cannot be created")) {
        if (HardDriveManager.createFile(directory)) {
            Kernel.stdIn.handleResponse("File created: " + directory);
        } else {
            Kernel.stdIn.handleResponse("File already exists: " + directory);
        }
    }
};

DeviceDriverHardDrive.listFiles = function() {
    var files = HardDriveManager.getFiles();
    if (files.length) {
        for (var i = 0; i < files.length; i++) {
            Kernel.stdIn.handleResponse(files[i]);
            Kernel.stdIn.advanceLine();
        }
    } else {
        Kernel.stdIn.handleResponse("No files exist");
    }
};

DeviceDriverHardDrive.writeFile = function(params) {
    var directory = params[0];
    var data = params[1];
    if (DeviceDriverHardDrive.checkIfSwapFile(directory, "File cannot be modified")) {
        if (HardDriveManager.writeFile(directory, data)) {
            Kernel.stdIn.handleResponse("File updated: " + directory);
        } else {        
            Kernel.stdIn.handleResponse("File does not exist: " + directory);
        }
    }
};

DeviceDriverHardDrive.readFile = function(params) {
    var directory = params[0];
    var content = HardDriveManager.readFile(directory);
    if (content) {
        Kernel.stdIn.handleResponse(content);     
    } else {        
        Kernel.stdIn.handleResponse("File does not exist: " + directory);
    }
};

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

DeviceDriverHardDrive.swap = function(params) {
    var inMemoryProcess = params[0];
    var harddriveProcess = params[1];
    
    // Read program from the hard drive
    var filename = "process-" + harddriveProcess.processId + ".swp";
    var program = HardDriveManager.readFile(filename);
    
    // Unload the program from the hard drive after storing it to a temporary variable
    DeviceDriverHardDrive.unloadProcess([harddriveProcess]);
    
    if (inMemoryProcess) {
        DeviceDriverHardDrive.loadProcess([inMemoryProcess, inMemoryProcess.getProgram()]);  
        MemoryManager.deallocate(inMemoryProcess);
        inMemoryProcess.inMemory = false;
    }
        
    var memoryLocations = program.match(/.{1,2}/g);
    MemoryManager.allocate(harddriveProcess, memoryLocations);
    
    harddriveProcess.inMemory = true;
};


DeviceDriverHardDrive.loadProcess = function(params) {
    var pcb = params[0];
    var program = params[1];    
    var filename = "process-" + pcb.processId + ".swp";
    HardDriveManager.createFile(filename);
    HardDriveManager.writeFile(filename, program);
};

DeviceDriverHardDrive.unloadProcess = function(params) {
    var pcb = params[0];
    var filename = "process-" + pcb.processId + ".swp";
    HardDriveManager.deleteFile(filename);    
};

DeviceDriverHardDrive.formatDisk = function() {
    HardDriveManager.initialize();
};

DeviceDriverHardDrive.checkIfSwapFile = function(directory, message) {
    if (!directory.match(/.swp$/)) {
        return true;
    }
    Kernel.stdIn.handleResponse(message + ": " + directory);
    return false;
};

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