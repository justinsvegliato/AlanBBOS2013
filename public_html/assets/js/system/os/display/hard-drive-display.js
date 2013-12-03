function HardDriveDisplay() {};

HardDriveDisplay.hardDrive = $("#hard-drive-display");
HardDriveDisplay.hardDriveTable = $("#hard-drive-display tbody");
HardDriveDisplay.jumpButton = $("#jump-button");

HardDriveDisplay.row = "<tr id='{0}'> \
                            <td class='text-muted location-value'><small><b>{1}</b></small></td> \\n\
                            <td class='text-danger available-value'><small><strong>{2}</strong></small></td> \
                            <td class='text-warning header-value'><small><strong>{3}</strong></small></td> \
                            <td class='text-primary data-value'><small>{4}</small></td> \
                        </tr>";

HardDriveDisplay.update = function() {    
    HardDriveDisplay.hardDriveTable.empty();
        
    for (var i = 0; i < HardDriveManager.TRACKS; i++) {
        for (var j = 0; j < HardDriveManager.SECTORS; j++) {
            for (var k = 0; k < HardDriveManager.BLOCKS; k++) {
                var data = HardDriveManager.hardDrive.read(i, j, k);
                var row = HardDriveDisplay.row.format(
                        "tsb-" + i + "-" + j + "-" +  k,
                        HardDrive.getKey(i, j, k),
                        toASCII(data.slice(0, 2)),
                        toASCII(data.slice(2, HardDriveManager.HEADER_LENGTH * 2)),
                        data.slice(HardDriveManager.HEADER_LENGTH * 2)
                );
                HardDriveDisplay.hardDriveTable.append(row);
            }
        }
     }
};

HardDriveDisplay.enterActiveState = function() {
    HardDriveDisplay.jumpButton.fadeIn();
};

HardDriveDisplay.enterInactiveState = function() {
    HardDriveDisplay.jumpButton.fadeOut();
};