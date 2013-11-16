function HardDriveDisplay() {};

HardDriveDisplay.hardDrive = $("#hard-drive-display");
HardDriveDisplay.hardDriveTable = $("#hard-drive-display table tbody");

HardDriveDisplay.row = "<tr> \
                            <td class='location-value'>{0}</td> \
                            <td class='header-value'>{1}</td> \
                            <td class='data-value'>{2}</td> \
                        </tr>";

HardDriveDisplay.update = function() {    
    HardDriveDisplay.hardDriveTable.empty();
        
    for (var i = 0; i < HardDriveManager.TRACKS; i++) {
        for (var j = 0; j < HardDriveManager.SECTORS; j++) {
            for (var k = 0; k < HardDriveManager.BLOCKS; k++) {
                var data = HardDriveManager.read(i, j, k);
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
