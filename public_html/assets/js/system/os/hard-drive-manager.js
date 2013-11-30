function HardDriveManager() {};

HardDriveManager.TRACKS = 4;
HardDriveManager.SECTORS = 8;
HardDriveManager.BLOCKS = 8;
HardDriveManager.BLOCK_LENGTH = 64;

HardDriveManager.HEADER_LENGTH = 4;
HardDriveManager.DATA_LENGTH = 60;

HardDriveManager.NEXT_FILE_LOCATION_LENGTH = 3;
HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH = 3;

HardDriveManager.DIRECTORY_TRACKS = 1;
HardDriveManager.FILE_TRACKS = HardDriveManager.TRACKS - HardDriveManager.DIRECTORY_TRACKS;

HardDriveManager.END_OF_FILE_SYMBOL = "00";

HardDriveManager.hardDrive = new HardDrive(
    HardDriveManager.TRACKS,
    HardDriveManager.SECTORS,
    HardDriveManager.BLOCKS,
    HardDriveManager.BLOCK_LENGTH
);

HardDriveManager.directoryTsbMap = {};

HardDriveManager.initialize = function() {
    HardDriveManager.hardDrive.initialize();
    HardDriveManager.write(0, 0, 0, "1000001100", 4);
    HardDriveManager.directoryTsbMap = {};
};

HardDriveManager.read = function(track, sector, block) {
    if (HardDriveManager.validateLocation(track, sector, block)) {
        var hex = HardDriveManager.hardDrive.read(track, sector, block);
        var ascii = toASCII(hex);
        HardDriveDisplay.update(Kernel.hardDriveManager);
        return ascii;
    }
};

HardDriveManager.write = function(track, sector, block, data) {  
    if (HardDriveManager.validateLocation(track, sector, block)) {        
        var data = toHexidecimal(data);     
        for (var i = data.length; i < HardDriveManager.BLOCK_LENGTH; i++) {
            data += "0";
        }
        HardDriveManager.hardDrive.write(track, sector, block, data);  
        HardDriveDisplay.update(Kernel.hardDriveManager);
    }
};

HardDriveManager.setHeader = function(track, sector, block, header) {
    var data = HardDriveManager.read(track, sector, block);
    var content = data.slice(HardDriveManager.HEADER_LENGTH);
    var newData = header + content;
    HardDriveManager.write(track, sector, block, newData);
};

HardDriveManager.getHeader = function(track, sector, block) {
    var data = HardDriveManager.read(track, sector, block);
    return data.slice(0, HardDriveManager.HEADER_LENGTH);
};

HardDriveManager.setContent = function(track, sector, block, content) {
    var data = HardDriveManager.read(track, sector, block);
    var header = data.slice(0, HardDriveManager.HEADER_LENGTH);
    var newData = header + content;
    HardDriveManager.write(track, sector, block, newData);
};

HardDriveManager.getContent = function(track, sector, block) {
    var data = HardDriveManager.read(track, sector, block);
    return data.slice(HardDriveManager.HEADER_LENGTH);
};

HardDriveManager.setNextFileLocation = function(fileLocation) {
    var data = HardDriveManager.getContent(0, 0, 0);
    var prefix = data.slice(0, HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH);
    var suffix = data.slice(HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH + HardDriveManager.NEXT_FILE_LOCATION_LENGTH);
    var newData = prefix + fileLocation + suffix;
    HardDriveManager.setContent(0, 0, 0, newData);
};

HardDriveManager.getNextFileLocation = function() {
    var data = HardDriveManager.getContent(0, 0, 0);
    var directoryLocation = data.slice(HardDriveManager.NEXT_FILE_LOCATION_LENGTH, HardDriveManager.NEXT_FILE_LOCATION_LENGTH + HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH);
    return directoryLocation;
};

HardDriveManager.setNextDirectoryLocation = function(fileLocation) {
    var data = HardDriveManager.getContent(0, 0, 0);
    var suffix = data.slice(HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH);
    var newData = fileLocation + suffix;
    HardDriveManager.setContent(0, 0, 0, newData);
};

HardDriveManager.getNextDirectoryLocation = function() {
    var data = HardDriveManager.getContent(0, 0, 0);
    var fileLocation = data.slice(0, HardDriveManager.NEXT_FILE_LOCATION_LENGTH);
    return fileLocation;
};

HardDriveManager.validateLocation = function(track, sector, block) {
    var isValid = true;
    if ((track > HardDriveManager.TRACKS - 1) || (track < 0)) {
        var message = "Invalid track specified: " + track;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message, params[0]]);
        isValid = false;
    } else if ((sector > HardDriveManager.SECTORS - 1) || (sector < 0)) {
        var message = "Invalid sector specified: " + sector;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message, params[0]]);
        isValid = false;
    } else if ((block > HardDriveManager.BLOCKS - 1) || (block < 0)) {
        var message = "Invalid block specified: " + block;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message, params[0]]);
        isValid = false;
    }
    return isValid;
};

HardDriveManager.createFile = function(directory) {
    var directoryTsb = HardDriveManager.directoryTsbMap[directory]; 
    
    if (directoryTsb) {
        return false;
    }
    
    var nextDirectoryLocation = HardDriveManager.getNextDirectoryLocation();
    var nextFileLocation = HardDriveManager.getNextFileLocation();

    var directoryTsb = nextDirectoryLocation.split("");
    HardDriveManager.setHeader(directoryTsb[0], directoryTsb[1], directoryTsb[2], "1" + nextFileLocation);
    HardDriveManager.setContent(directoryTsb[0], directoryTsb[1], directoryTsb[2], directory);

    HardDriveManager.directoryTsbMap[directory] = directoryTsb;

    var fileTsb = nextFileLocation.split("");
    HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "1000");

    var directoryLocation = HardDriveManager.getNextAvailableDirectoryTsb().join("");
    HardDriveManager.setNextDirectoryLocation(directoryLocation);

    var fileLocation = HardDriveManager.getNextAvailableFileTsb().join("");
    HardDriveManager.setNextFileLocation(fileLocation);   

    return true;
};

HardDriveManager.writeFile = function(directory, data) {  
    var directoryTsb = HardDriveManager.directoryTsbMap[directory];
    
    if (!directoryTsb) {
        return false;
    }
    
    var fileTsb = HardDriveManager.getHeader(directoryTsb[0], directoryTsb[1], directoryTsb[2]).slice(1).split("");
    var dataPartitions = data.match(/.{1,28}/g);
    for (var i = 0; i < dataPartitions.length; i++) {
        var nextFileLocation = (i < dataPartitions.length - 1) ? HardDriveManager.getNextFileLocation() : "000";  
        HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "1" + nextFileLocation);                                                         
        HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], dataPartitions[i]);
        
        var nextFileLocationTsb = nextFileLocation.split("");
        HardDriveManager.setHeader(nextFileLocationTsb[0], nextFileLocation[1], nextFileLocation[2], "1000");
        
        var fileLocation = HardDriveManager.getNextAvailableFileTsb().join("");
        HardDriveManager.setNextFileLocation(fileLocation);
        
        fileTsb = nextFileLocation.split("");
    }
    
    return true;
};

HardDriveManager.getFiles = function() {
    return Object.keys(HardDriveManager.directoryTsbMap);
};

HardDriveManager.readFile = function(directory) {    
    var directoryTsb = HardDriveManager.directoryTsbMap[directory];
    
    if (!directoryTsb) {
        return false;
    }

    var fileTsb = HardDriveManager.getHeader(directoryTsb[0], directoryTsb[1], directoryTsb[2]).slice(1).split("");        
    var content = HardDriveManager.getContent(fileTsb[0], fileTsb[1], fileTsb[2]);

    var nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);    
    while (nextFileLocation !== "000") {
        fileTsb = nextFileLocation.split("");
        nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);

        content += HardDriveManager.getContent(fileTsb[0], fileTsb[1], fileTsb[2]);
    }
           
    return content.replace(/0+$/, "");
};

HardDriveManager.deleteFile = function(directory) {
    var directoryTsb = HardDriveManager.directoryTsbMap[directory];
    
    if (!directoryTsb) {
        return false;
    }
    
    var fileTsb = HardDriveManager.getHeader(directoryTsb[0], directoryTsb[1], directoryTsb[2]).slice(1).split("");
    
    delete HardDriveManager.directoryTsbMap[directory];
    HardDriveManager.setHeader(directoryTsb[0], directoryTsb[1], directoryTsb[2], "0000");
    
    var nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);    
    HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "0000");
    
    while (nextFileLocation !== "000") {
        fileTsb = nextFileLocation.split("");        
        nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);        
        HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "0000");
    }
           
    return true;
};

HardDriveManager.getNextAvailableDirectoryTsb = function() {
    for (var track = 0; track < HardDriveManager.DIRECTORY_TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                var header = HardDriveManager.getHeader(track, sector, block);
                // TODO: Make availability bit method
                if (header.charAt(0) === "0") {
                    return [track, sector, block];
                }
            }
        }
     } 
};

HardDriveManager.getNextAvailableFileTsb = function() {
    for (var track = HardDriveManager.DIRECTORY_TRACKS; track < HardDriveManager.FILE_TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                var header = HardDriveManager.getHeader(track, sector, block);
                // TODO: Make availability bit method
                if (header.charAt(0) === "0") {
                    return [track, sector, block];
                }
            }
        }
     } 
};