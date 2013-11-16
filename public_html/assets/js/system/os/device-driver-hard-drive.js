DeviceDriverHardDrive.prototype = new DeviceDriver;

function DeviceDriverHardDrive() {};

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

DeviceDriverHardDrive.createFile = function(filename) {
    
};

DeviceDriverHardDrive.diskOperations = {
    "create": DeviceDriverHardDrive.createFile,
    "read": DeviceDriverHardDrive.readFile,
    "write": DeviceDriverHardDrive.writeFile,
    "delete": DeviceDriverHardDrive.deleteFile,
    "list": DeviceDriverHardDrive.listFiles,
    "format": DeviceDriverHardDrive.formatDisk
};