/**
 * A simple Queue implemented by an array (really just a dressed-up JavaScript array).
 * 
 * See the Javascript Array documentation at http://www.w3schools.com/jsref/jsref_obj_array.asp.
 * Look at the push and shift methods, as they are the least obvious here  .
 */

// Creates a queue implemented by an array
function Queue() {
    // Properties
    this.queue = new Array();
}

//
// Methods
// 

// Retrieves the size of the queue
Queue.prototype.getSize = function() {
    return this.queue.length;
};

// Checks whether the queue is empty
Queue.prototype.isEmpty = function() {
    return this.queue.length === 0;
};

// Puts an element onto the queue
Queue.prototype.enqueue = function(element) {
    this.queue.push(element);
};

// Removes an element from the queue
Queue.prototype.dequeue = function() {
    var element = null;
    if (this.queue.length > 0) {
        element = this.queue.shift();
    }
    return element;
};

// Gets a string representation of the queue
Queue.prototype.toString = function() {
    var element = "";
    for (var i in this.queue) {
        element += "[" + this.queue[i] + "] ";
    }
    return element;
};