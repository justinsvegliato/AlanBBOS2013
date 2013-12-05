/**
 * The hard drive of the host (it's HTML5 local storage)
 */

// Initializes the hard drive with a set number of tracks, sectors, and blocks
function HardDrive(tracks, sectors, blocks, block_length) {
    this.tracks = tracks;
    this.sectors = sectors;
    this.blocks = blocks;
    this.block_length = block_length;
};

// Writes data to the specified TSB
HardDrive.prototype.write = function(track, sector, block, data) {
    var key = HardDrive.getKey(track, sector, block);
    localStorage.setItem(key, data);
};

// Reads data to the specified TSB
HardDrive.prototype.read = function(track, sector, block) {
    var key = HardDrive.getKey(track, sector, block);
    return localStorage.getItem(key);
};

// Gets the key for the specified TSB
HardDrive.getKey = function(track, sector, block) {
    return track + ":" + sector + ":" + block;
};