function HardDrive(tracks, sectors, blocks, block_length) {
    this.tracks = tracks;
    this.sectors = sectors;
    this.blocks = blocks;
    this.block_length = block_length;
};

HardDrive.prototype.write = function(track, sector, block, data) {
    var key = HardDrive.getKey(track, sector, block);
    localStorage.setItem(key, data);
};

HardDrive.prototype.read = function(track, sector, block) {
    var key = HardDrive.getKey(track, sector, block);
    return localStorage.getItem(key);
};

HardDrive.getKey = function(track, sector, block) {
    return track + ":" + sector + ":" + block;
};