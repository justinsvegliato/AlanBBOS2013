function HardDriveDisplay() {};

HardDriveDisplay.hardDrive = $("#hard-drive-display");
HardDriveDisplay.hardDriveTable = $("#hard-drive-display tbody");

HardDriveDisplay.row = "<tr> \
                            <td class='text-muted location-value'><small><b>{0}</b></small></td> \
                            <td class='text-warning header-value'><small>{1}</small></td> \
                            <td class='text-primary data-value'><small>{2}</small></td> \
                        </tr>";

HardDriveDisplay.update = function() {    
    HardDriveDisplay.hardDriveTable.empty();
        
    for (var i = 0; i < HardDriveManager.TRACKS; i++) {
        for (var j = 0; j < HardDriveManager.SECTORS; j++) {
            for (var k = 0; k < HardDriveManager.BLOCKS; k++) {
                var data = HardDriveManager.hardDrive.read(i, j, k);
                var key = HardDrive.getKey(i, j, k);
                var row = HardDriveDisplay.row.format(
                        HardDrive.getKey(i, j, k),
                        data.slice(0, HardDriveManager.HEADER_LENGTH),
                        data.slice(HardDriveManager.HEADER_LENGTH)
                );
                HardDriveDisplay.hardDriveTable.append(row);
            }
        }
     }
};
