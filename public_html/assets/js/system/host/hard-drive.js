function HardDrive(tracks, sectors, blocks, block_size) {
    this.tracks = tracks;
    this.sectors = sectors;
    this.blocks = blocks; 
    this.block_size = block_size;         
};

HardDrive.prototype.initialize = function() {
    for (var i = 0; i < this.tracks; i++) {
        for (var j = 0; j < this.sectors; j++) {
            for (var k = 0; k < this.blocks; k++) {
                var data = Array(this.block_size + 1).join("0");
                this.write(i, j, k, data);
            }
        }
    } 
};

HardDrive.prototype.write = function(track, sector, block, data) {
    localStorage.setItem(HardDrive.getKey(track, sector, block), data);
};

HardDrive.prototype.read = function(track, sector, block) {
    return localStorage.getItem(HardDrive.getKey(track, sector, block));
};

HardDrive.getKey = function(track, sector, block) {
    return track + ":" + sector + ":" + block;
};