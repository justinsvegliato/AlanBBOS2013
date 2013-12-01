function HardDriveManager() {};

HardDriveManager.TRACKS = 4;
HardDriveManager.SECTORS = 8;
HardDriveManager.BLOCKS = 8;
HardDriveManager.BLOCK_LENGTH = 64;

HardDriveManager.HEADER_LENGTH = 4;
HardDriveManager.DATA_LENGTH = HardDriveManager.BLOCK_LENGTH - HardDriveManager.HEADER_LENGTH;

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
    // Resets mapping between directory names and TSB locations
    HardDriveManager.directoryTsbMap = {};

    // Initializes all memory locations 
    for (var i = 0; i < HardDriveManager.TRACKS; i++) {
        for (var j = 0; j < HardDriveManager.SECTORS; j++) {
            for (var k = 0; k < HardDriveManager.BLOCKS; k++) {
                var data = Array(HardDriveManager.BLOCK_LENGTH / 2).join("0");
                HardDriveManager.write(i, j, k, data);
            }
        }
    }

    // Sets TSB 000 to default values
    HardDriveManager.setHeader(0, 0, 0, "1000");
    HardDriveManager.setContent(0, 0, 0, "001100");

    // Updates hard drive display with changes
    HardDriveDisplay.update();
};

HardDriveManager.createFile = function(directory) {
    // Returns false if the directory already exists
    if (HardDriveManager.directoryTsbMap[directory]) {
        return false;
    }

    // Gets next directory and file location from MBR
    var nextDirectoryLocation = HardDriveManager.getNextDirectoryLocation();
    var nextFileLocation = HardDriveManager.getNextFileLocation();

    // Sets header and content of directory 
    var directoryTsb = nextDirectoryLocation.split("");
    HardDriveManager.setHeader(directoryTsb[0], directoryTsb[1], directoryTsb[2], "1" + nextFileLocation);
    HardDriveManager.setContent(directoryTsb[0], directoryTsb[1], directoryTsb[2], directory);

    // Associates this directory name with corresponding TSB location
    HardDriveManager.directoryTsbMap[directory] = directoryTsb;

    // Marks file as not available (with "1")
    var fileTsb = nextFileLocation.split("");
    HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "1000");

    // Sets next directory and file location
    HardDriveManager.setNextDirectoryLocation(HardDriveManager.getNextAvailableDirectoryTsb());
    HardDriveManager.setNextFileLocation(HardDriveManager.getNextAvailableFileTsb());

    // Updates hard drive display with changes
    HardDriveDisplay.update();

    return true;
};

HardDriveManager.writeFile = function(directory, data) {
    // Get TSBs associated with this directory
    var directoryTsb = HardDriveManager.directoryTsbMap[directory];

    // Breaks if the file doesn't exist
    if (!directoryTsb) {
        return false;
    }

    // Retrieves the file associated with this directory
    var fileTsb = HardDriveManager.getHeader(directoryTsb[0], directoryTsb[1], directoryTsb[2]).slice(1).split("");

    // Iterates through partitioned data of length just big enough to fit into a TSB location
    var dataPartitions = data.match(new RegExp(".{1," + ((HardDriveManager.BLOCK_LENGTH / 2) - HardDriveManager.HEADER_LENGTH) + "}", "g"));
    for (var i = 0; i < dataPartitions.length; i++) {
        // Sets the next location of the next part of the file
        var nextFileLocation = (i < dataPartitions.length - 1) ? HardDriveManager.getNextFileLocation() : "000";
        HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "1" + nextFileLocation);

        // Fills the current location of the file
        HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], dataPartitions[i]);

        // Marks next part of the file as unavailable
        var nextFileLocationTsb = nextFileLocation.split("");
        HardDriveManager.setHeader(nextFileLocationTsb[0], nextFileLocation[1], nextFileLocation[2], "1000");
        
        // Sets the MSB to the next available file location
        HardDriveManager.setNextFileLocation(HardDriveManager.getNextAvailableFileTsb());

        // Moves onto the next part of the file
        fileTsb = nextFileLocationTsb;
    }

    // Updates hard drive display with changes
    HardDriveDisplay.update();

    return true;
};

HardDriveManager.getFiles = function() {
    // Retrieves all directories
    return Object.keys(HardDriveManager.directoryTsbMap);
};

HardDriveManager.readFile = function(directory) {
    // Gets TSB associated with this directory
    var directoryTsb = HardDriveManager.directoryTsbMap[directory];

    // Breaks if the file doesn't exist
    if (!directoryTsb) {
        return false;
    }

    // Reads the header and content of the first part of the file
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
    HardDriveManager.setContent(directoryTsb[0], directoryTsb[1], directoryTsb[2], HardDriveManager.END_OF_FILE_SYMBOL);

    var nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
    HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "0000");
    HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], HardDriveManager.END_OF_FILE_SYMBOL);

    while (nextFileLocation !== "000") {
        fileTsb = nextFileLocation.split("");
        nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
        HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "0000");
        HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], HardDriveManager.END_OF_FILE_SYMBOL);
    }

    // Updates hard drive display with changes
    HardDriveDisplay.update();

    return true;
};

HardDriveManager.read = function(track, sector, block) {
    if (HardDriveManager.validateLocation(track, sector, block)) {
        var hex = HardDriveManager.hardDrive.read(track, sector, block);
        var ascii = toASCII(hex);
        return ascii;
    }
};

HardDriveManager.write = function(track, sector, block, data) {
    if (HardDriveManager.validateLocation(track, sector, block)) {
        for (var i = data.length; i < (HardDriveManager.BLOCK_LENGTH / 2); i++) {
            data += "0";
        }
        var data = toHexidecimal(data);
        HardDriveManager.hardDrive.write(track, sector, block, data);
    }
};

HardDriveManager.setHeader = function(track, sector, block, header) {
    // Gets the content of the TSB (bits 1 to the end)
    var data = HardDriveManager.read(track, sector, block);
    var content = data.slice(HardDriveManager.HEADER_LENGTH);
    var newData = header + content;
    HardDriveManager.write(track, sector, block, newData);
};

HardDriveManager.getHeader = function(track, sector, block) {
    // Gets the header of the TSB (bits 1 to the end)
    var data = HardDriveManager.read(track, sector, block);
    return data.slice(0, HardDriveManager.HEADER_LENGTH);
};

HardDriveManager.setContent = function(track, sector, block, content) {
    // Sets the content of the TSB (bits 4 to the end)
    var data = HardDriveManager.read(track, sector, block);
    var header = data.slice(0, HardDriveManager.HEADER_LENGTH);
    var newData = header + content;
    HardDriveManager.write(track, sector, block, newData);
};

HardDriveManager.getContent = function(track, sector, block) {
    // Gets the content of the TSB (bits 4 to the end)
    var data = HardDriveManager.read(track, sector, block);
    return data.slice(HardDriveManager.HEADER_LENGTH);
};

HardDriveManager.setNextFileLocation = function(fileLocation) {
    // Sets the next file to be used (bits 4-6 in the MSB)
    var data = HardDriveManager.getContent(0, 0, 0);
    var prefix = data.slice(0, HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH);
    var suffix = data.slice(HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH + HardDriveManager.NEXT_FILE_LOCATION_LENGTH);
    var newData = prefix + fileLocation + suffix;
    HardDriveManager.setContent(0, 0, 0, newData);
};

HardDriveManager.getNextFileLocation = function() {
    // Gets the next file to be used (bits 4-6 in the MSB)
    var data = HardDriveManager.getContent(0, 0, 0);
    var directoryLocation = data.slice(HardDriveManager.NEXT_FILE_LOCATION_LENGTH, HardDriveManager.NEXT_FILE_LOCATION_LENGTH + HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH);
    return directoryLocation;
};

HardDriveManager.setNextDirectoryLocation = function(fileLocation) {
    // Sets the next directory to be used (bits 1-3 in the MSB)
    var data = HardDriveManager.getContent(0, 0, 0);
    var suffix = data.slice(HardDriveManager.NEXT_DIRECTORY_LOCATION_LENGTH);
    var newData = fileLocation + suffix;
    HardDriveManager.setContent(0, 0, 0, newData);
};

HardDriveManager.getNextDirectoryLocation = function() {
    // Gets the next directory to be used (bits 1-3 in the MSB)
    var data = HardDriveManager.getContent(0, 0, 0);
    var fileLocation = data.slice(0, HardDriveManager.NEXT_FILE_LOCATION_LENGTH);
    return fileLocation;
};

HardDriveManager.getNextAvailableDirectoryTsb = function() {
    // Iterates through all directory TSBs to find an unused directory TSB
    for (var track = 0; track < HardDriveManager.DIRECTORY_TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                // The directory TSB is available if the header has a "0" as its first bit
                var header = HardDriveManager.getHeader(track, sector, block);
                if (header.charAt(0) === "0") {
                    return [track, sector, block].join("");
                }
            }
        }
    }
};

HardDriveManager.getNextAvailableFileTsb = function() {
    // Iterates through all file TSBs to find an unused file TSB
    for (var track = HardDriveManager.DIRECTORY_TRACKS; track < HardDriveManager.FILE_TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                // The file TSB is available if the header has a "0" as its first bit
                var header = HardDriveManager.getHeader(track, sector, block);
                if (header.charAt(0) === "0") {
                    return [track, sector, block].join("");
                }
            }
        }
    }
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