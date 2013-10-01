/**
 * Singleton class that handles the log for the host
 */

function LogDisplay() {};

// The element that comprises the task bar - again, we have a variable to promote maintainability
LogDisplay.element = "#log";

// The template of each entry in the log. Note that the "{#}" will be replaced using a
// formatting function.
LogDisplay.template = "<div class='entry'> \
                    <div class='row'> \
                        <small class='text-muted pull-left'><strong class='date'>{0}</strong></small> \
                        <small class='text-muted pull-right'><strong class='clockPulse'>{1}</strong></small> \
                    </div> \
                    <div class='row'> \
                        <span class='host label label-info col-lg-2'>{2}</span> \
                        <span class='message col-lg-10'>{3}</span> \
                    </div> \
                </div>";

// Clears the log...
LogDisplay.clear = function() {
    $(LogDisplay.element).empty();
};

// Records the entry to the log
LogDisplay.record = function(clockPulse, source, message) {
    // Grabs the current time and formats it
    var now = moment().format("ddd, MMM Do YYYY, h:mm:ss a");
    
    // Gets the content of the previous .message element
    var previousElement = $(".message").first().html();
    
    // If the message is idle and the previous element was idle
    if (message === "Idle" && previousElement === "Idle") {
        // Merely update the old entry to ensure that idle isn't repeatedly printed
        $(".date").first().html(now);
        $(".clockPulse").first().html(clockPulse);  
    } else {
        // Add a new entry to the log
        $(LogDisplay.element).prepend(LogDisplay.template.format(
            now, 
            clockPulse, 
            !source ? "?" : source.toUpperCase(), 
            capitalizeFirstLetter(message)
        ));
    }
};