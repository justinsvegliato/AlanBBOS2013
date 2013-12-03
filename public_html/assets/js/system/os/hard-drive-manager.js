/**
 * Singleton class that handles hard drive management
 */

function HardDriveManager() {};

// The specifications of the hard drive
HardDriveManager.TRACKS = 4;
HardDriveManager.SECTORS = 8;
HardDriveManager.BLOCKS = 8;
HardDriveManager.BLOCK_LENGTH = 64;

// The header and content details
HardDriveManager.HEADER_LENGTH = 4;
HardDriveManager.DATA_LENGTH = HardDriveManager.BLOCK_LENGTH - HardDriveManager.HEADER_LENGTH;

// The MSB details
HardDriveManager.NEXT_FILE_LOCATION_LENGTH = 3;
HardDriveManager.NEXT_FILENAME_LOCATION_LENGTH = 3;

// The distribution of filename and file tracks
HardDriveManager.FILENAME_TRACKS = 1;
HardDriveManager.FILE_TRACKS = HardDriveManager.TRACKS - HardDriveManager.FILENAME_TRACKS;

// The terminal location denoter
HardDriveManager.TERMINAL_LOCATION = "999";

// The actual hard drive (HTML5 local storage)
HardDriveManager.hardDrive = new HardDrive(
        HardDriveManager.TRACKS,
        HardDriveManager.SECTORS,
        HardDriveManager.BLOCKS,
        HardDriveManager.BLOCK_LENGTH);

// Map that contains filename to file assocations
HardDriveManager.filenameTsbMap = {};

HardDriveManager.RESPONSE = {
    DOES_NOT_EXIST: 0,
    INSUFFICIENT_SPACE: 1,
    ALREADY_EXISTS: 2,
    SUCCESS: 3,
    INVALID_DATA: 4
};

HardDriveManager.initialize = function() {
    // Resets mapping between filenames and files
    HardDriveManager.filenameTsbMap = {};

    // Initializes all memory locations 
    for (var i = 0; i < HardDriveManager.TRACKS; i++) {
        for (var j = 0; j < HardDriveManager.SECTORS; j++) {
            for (var k = 0; k < HardDriveManager.BLOCKS; k++) {
                HardDriveManager.write(i, j, k, "");
            }
        }
    }

    // Sets the MSB to the default values
    HardDriveManager.setHeader(0, 0, 0, "1000");
    HardDriveManager.setContent(0, 0, 0, "001100");

    // Updates hard drive display with changes
    HardDriveDisplay.update();
};

HardDriveManager.createFile = function(filename) {
    // Returns false if the filename already exists
    if (HardDriveManager.filenameTsbMap[filename]) {
        return HardDriveManager.RESPONSE.ALREADY_EXISTS;
    }
    
    // Checks if there is space available
    if (HardDriveManager.getAvailableFilenameCount() <= 0 || HardDriveManager.getAvailableFileCount() <= 0) { 
        return HardDriveManager.RESPONSE.INSUFFICIENT_SPACE;
    }
    
    // Checks if the filename is too long
    if (filename.length > HardDriveManager.DATA_LENGTH) {
        return HardDriveManager.RESPONSE.INVALID_DATA;
    }

    // Gets next filename and file location from MBR
    var nextFilenameLocation = HardDriveManager.getNextFilenameLocation();
    var nextFileLocation = HardDriveManager.getNextFileLocation();

    // Sets header and content of filename 
    var filenameTsb = nextFilenameLocation.split("");
    HardDriveManager.setHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2], "1" + nextFileLocation);
    HardDriveManager.setContent(filenameTsb[0], filenameTsb[1], filenameTsb[2], filename);

    // Associates this filename with the corresponding file location
    HardDriveManager.filenameTsbMap[filename] = filenameTsb;

    // Marks file as not available
    var fileTsb = nextFileLocation.split("");
    HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "1000");

    // Sets next filename and file location
    HardDriveManager.setNextFilenameLocation(HardDriveManager.getNextAvailableFilenameTsb());
    HardDriveManager.setNextFileLocation(HardDriveManager.getNextAvailableFileTsb());

    // Updates hard drive display with changes
    HardDriveDisplay.update();

    return HardDriveManager.RESPONSE.SUCCESS;
};

HardDriveManager.writeFile = function(filename, data) {
    // Gets start of the file associated with this filename
    var filenameTsb = HardDriveManager.filenameTsbMap[filename];


    // Breaks if the file doesn't exist
    if (!filenameTsb) {
        return HardDriveManager.RESPONSE.DOES_NOT_EXIST;
    }
    
    // Checks if there is enough space for the write
    var fileLength = HardDriveManager.getFileLength(filename);
    var availableFileCount = HardDriveManager.getAvailableFileCount();
    var requiredFileCount = HardDriveManager.getRequiredFileCount(data);    
    if (availableFileCount + fileLength < requiredFileCount) {
        return HardDriveManager.RESPONSE.INSUFFICIENT_SPACE;
    }

    // Retrieves the part of the file associated with this filename
    var fileTsb = HardDriveManager.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1).split("");

    // Gets the next part of the file and clears it
    var nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
    HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "1000");
    HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], "");

    // Deletes all remaining parts of the file
    while (nextFileLocation !== "000") {
        fileTsb = nextFileLocation.split("");
        nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
        HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "0000");
        HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], "");
    }

    // Sets next filename and file location
    HardDriveManager.setNextFilenameLocation(HardDriveManager.getNextAvailableFilenameTsb());
    HardDriveManager.setNextFileLocation(HardDriveManager.getNextAvailableFileTsb());
    
    // Retrieves the file associated with this filename
    var fileTsb = HardDriveManager.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1).split("");

    // Iterates through partitioned data
    var dataPartitions = data.match(new RegExp(".{1," + (HardDriveManager.BLOCK_LENGTH - HardDriveManager.HEADER_LENGTH) + "}", "g"));
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

    return HardDriveManager.RESPONSE.SUCCESS;
};

HardDriveManager.getFiles = function() {
    // Retrieves all directories
    return Object.keys(HardDriveManager.filenameTsbMap);
};

HardDriveManager.readFile = function(filename) {
    // Gets the start of the tile associated with this filename
    var filenameTsb = HardDriveManager.filenameTsbMap[filename];

    // Breaks if the file doesn't exist
    if (!filenameTsb) {
        return HardDriveManager.RESPONSE.DOES_NOT_EXIST;
    }

    // Reads the header and content of the first part of the file
    var fileTsb = HardDriveManager.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1).split("");
    var content = HardDriveManager.getContent(fileTsb[0], fileTsb[1], fileTsb[2]);

    // Iterates through and retrieves the content from all the remaining parts of the file 
    var nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
    while (nextFileLocation !== "000") {
        fileTsb = nextFileLocation.split("");
        content += HardDriveManager.getContent(fileTsb[0], fileTsb[1], fileTsb[2]);
        nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);       
    }
    return content;
};

HardDriveManager.deleteFile = function(filename) {
    // Gets the start of the file associated with this filename
    var filenameTsb = HardDriveManager.filenameTsbMap[filename];

    // Breaks if the file doesn't exist
    if (!filenameTsb) {
        return HardDriveManager.RESPONSE.DOES_NOT_EXIST;
    }

    // Gets the first part of the file associated with the filename
    var fileTsb = HardDriveManager.getHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2]).slice(1).split("");

    // Deletes this filename from the map
    delete HardDriveManager.filenameTsbMap[filename];

    // Clears the header and content of the filename
    HardDriveManager.setHeader(filenameTsb[0], filenameTsb[1], filenameTsb[2], "0000");
    HardDriveManager.setContent(filenameTsb[0], filenameTsb[1], filenameTsb[2], "");

    // Gets the next part of the file and clears it
    var nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
    HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "0000");
    HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], "");

    // Deletes all remaining parts of the file
    while (nextFileLocation !== "000") {
        fileTsb = nextFileLocation.split("");
        nextFileLocation = HardDriveManager.getHeader(fileTsb[0], fileTsb[1], fileTsb[2]).slice(1);
        HardDriveManager.setHeader(fileTsb[0], fileTsb[1], fileTsb[2], "0000");
        HardDriveManager.setContent(fileTsb[0], fileTsb[1], fileTsb[2], "");
    }

    // Sets next filename and file location
    HardDriveManager.setNextFilenameLocation(HardDriveManager.getNextAvailableFilenameTsb());
    HardDriveManager.setNextFileLocation(HardDriveManager.getNextAvailableFileTsb());

    // Updates hard drive display with changes
    HardDriveDisplay.update();

    return HardDriveManager.RESPONSE.SUCCESS;
};

// Reads data from the specified TSB location
HardDriveManager.read = function(track, sector, block) {
    // Read only if the location is valid
    if (HardDriveManager.validateLocation(track, sector, block)) {
        // Converts the data from hex to ASCII to ease data processing
        var hex = HardDriveManager.hardDrive.read(track, sector, block).replace(/(00)+$/, "");
        var ascii = toASCII(hex);
        return ascii;
    }
};

// Writes data to the specified TSB location
HardDriveManager.write = function(track, sector, block, data) {
    // Write only if the location is valid
    if (HardDriveManager.validateLocation(track, sector, block)) {
        // Adds padding to fill up the entire block and then converts the data to hexidecimal
        // to simulate a real hard drive
        for (var i = data.length; i < HardDriveManager.BLOCK_LENGTH; i++) {
            data += "\0\0";
        }
        var data = toHexidecimal(data);
        HardDriveManager.hardDrive.write(track, sector, block, data);
    }
};

// Sets the header of the specified TSB
HardDriveManager.setHeader = function(track, sector, block, header) {
    // The header of the TSB ranges from bit 1 to 3
    var data = HardDriveManager.read(track, sector, block);
    var content = data.slice(HardDriveManager.HEADER_LENGTH);
    var newData = header + content;
    HardDriveManager.write(track, sector, block, newData);
};

// Gets the header of the specified TSB
HardDriveManager.getHeader = function(track, sector, block) {
    // The header of the TSB ranges from bit 1 to 3
    var data = HardDriveManager.read(track, sector, block);
    return data.slice(0, HardDriveManager.HEADER_LENGTH);
};

// Sets the content of the specified TSB
HardDriveManager.setContent = function(track, sector, block, content) {
    // The content of the TSB ranges from bit 4 to the end
    var data = HardDriveManager.read(track, sector, block);
    var header = data.slice(0, HardDriveManager.HEADER_LENGTH);
    var newData = header + content;
    HardDriveManager.write(track, sector, block, newData);
};

// Gets the content of the specified TSB
HardDriveManager.getContent = function(track, sector, block) {
    // The content of the TSB ranges from bit 4 to the end
    var data = HardDriveManager.read(track, sector, block);
    return data.slice(HardDriveManager.HEADER_LENGTH);
};

// Sets the next file location in the MSB
HardDriveManager.setNextFileLocation = function(fileLocation) {
    if (fileLocation !== HardDriveManager.TERMINAL_LOCATION) {
        // The next file to be used ranges from bit 4 to 6 in the MSB
        var data = HardDriveManager.getContent(0, 0, 0);
        var prefix = data.slice(0, HardDriveManager.NEXT_FILENAME_LOCATION_LENGTH);
        var suffix = data.slice(HardDriveManager.NEXT_FILENAME_LOCATION_LENGTH + HardDriveManager.NEXT_FILE_LOCATION_LENGTH);
        var newData = prefix + fileLocation + suffix;
        HardDriveManager.setContent(0, 0, 0, newData);
    }
};

// Gets the next file location in the MSB
HardDriveManager.getNextFileLocation = function() {
    // The next file to be used ranges from bit 4 to 6 in the MSB
    var data = HardDriveManager.getContent(0, 0, 0);
    var filenameLocation = data.slice(HardDriveManager.NEXT_FILE_LOCATION_LENGTH, HardDriveManager.NEXT_FILE_LOCATION_LENGTH + HardDriveManager.NEXT_FILENAME_LOCATION_LENGTH);
    return filenameLocation;
};

// Sets the next filename location in the MSB
HardDriveManager.setNextFilenameLocation = function(fileLocation) {
    if (fileLocation !== HardDriveManager.TERMINAL_LOCATION) {
        // The next filename to be used ranges from bit 1 to 3 in the MSB
        var data = HardDriveManager.getContent(0, 0, 0);
        var suffix = data.slice(HardDriveManager.NEXT_FILENAME_LOCATION_LENGTH);
        var newData = fileLocation + suffix;
        HardDriveManager.setContent(0, 0, 0, newData);
    }
};

// Gets the next filename location in the MSB
HardDriveManager.getNextFilenameLocation = function() {
    // The next filename to be used ranges from bit 1 to 3 in the MSB
    var data = HardDriveManager.getContent(0, 0, 0);
    var fileLocation = data.slice(0, HardDriveManager.NEXT_FILE_LOCATION_LENGTH);
    return fileLocation;
};

// Gets the next available filename TSB
HardDriveManager.getNextAvailableFilenameTsb = function() {
    // Iterates through all filenames locations to find an unused filename location
    for (var track = 0; track < HardDriveManager.FILENAME_TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                // The filename TSB is available if the header has a "0" as its first bit or is empty
                var header = HardDriveManager.getHeader(track, sector, block);
                if (header === "" || header.charAt(0) === "0") {
                    return [track, sector, block].join("");
                }
            }
        }
    }
    return HardDriveManager.TERMINAL_LOCATION;
};

// Gets the next available file TSB
HardDriveManager.getNextAvailableFileTsb = function() {
    // Iterates through all file TSBs to find an unused file
    for (var track = HardDriveManager.FILENAME_TRACKS; track < HardDriveManager.TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                // The file TSB is available if the header has a "0" as its first bit or is empty
                var header = HardDriveManager.getHeader(track, sector, block);
                if (header === "" || header.charAt(0) === "0") {
                    return [track, sector, block].join("");
                }
            }
        }
    }
    return HardDriveManager.TERMINAL_LOCATION;
};

// Checks if the TSB location is valid
HardDriveManager.validateLocation = function(track, sector, block) {
    var isValid = true;
    if ((track > HardDriveManager.TRACKS - 1) || (track < 0)) {
        var message = "Invalid track specified: " + track;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message]);
        isValid = false;
    } else if ((sector > HardDriveManager.SECTORS - 1) || (sector < 0)) {
        var message = "Invalid sector specified: " + sector;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message]);
        isValid = false;
    } else if ((block > HardDriveManager.BLOCKS - 1) || (block < 0)) {
        var message = "Invalid block specified: " + block;
        Kernel.handleInterupts(DISK_OPERATION_FAULT_IRQ, [message]);
        isValid = false;
    }
    return isValid;
};

// Returns true if more files can be created
HardDriveManager.getAvailableFilenameCount = function() {
    // Counts all unused directories
    var count = 0;
    for (var track = 0; track < HardDriveManager.FILENAME_TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                // The filename TSB is available if the header has a "0" as its first bit or is empty
                var header = HardDriveManager.getHeader(track, sector, block);
                if (header === "" || header.charAt(0) === "0") {
                    count++;
                }
            }
        }
    }
    return count;
};

// Returns true if there is enough room for this data
HardDriveManager.getAvailableFileCount = function() {
    // Counts all unused files
    var count = 0;
    for (var track = HardDriveManager.FILENAME_TRACKS; track < HardDriveManager.TRACKS; track++) {
        for (var sector = 0; sector < HardDriveManager.SECTORS; sector++) {
            for (var block = 0; block < HardDriveManager.BLOCKS; block++) {
                // The file TSB is available if the header has a "0" as its first bit or is empty
                var header = HardDriveManager.getHeader(track, sector, block);
                if (header === "" || header.charAt(0) === "0") {
                    count++;
                }
            }
        }
    }
    return count;
};

// Retrieves the length of the specified file
HardDriveManager.getFileLength = function(filename) {
    var currentFileLength = Math.ceil(HardDriveManager.readFile(filename).length / HardDriveManager.DATA_LENGTH);    
    return (currentFileLength === 0) ? 1 : currentFileLength;
};

// Retrieves the amount of space needed to store this data
HardDriveManager.getRequiredFileCount = function(data) { 
    return Math.ceil(data.length / HardDriveManager.DATA_LENGTH);
};