function HardDriveManager() {};

HardDriveManager.TRACKS = 4;
HardDriveManager.SECTORS = 8;
HardDriveManager.BLOCKS = 8;
HardDriveManager.BLOCK_LENGTH = 64;

HardDriveManager.HEADER_LENGTH = 4;
HardDriveManager.DATA_LENGTH = 60;

HardDriveManager.hardDrive = new HardDrive(
    HardDriveManager.TRACKS,
    HardDriveManager.SECTORS,
    HardDriveManager.BLOCKS,
    HardDriveManager.BLOCK_LENGTH
);

HardDriveManager.read = function(track, sector, block) {
    if (HardDriveManager.validateLocation(track, sector, block)) {
        return HardDriveManager.hardDrive.read(track, sector, block);
    }
};

HardDriveManager.write = function(track, sector, block, data) {  
    if (HardDriveManager.validateLocation(track, sector, block)) {
        HardDriveManager.hardDrive.write(track, sector, block, data);  
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