/**
 * The memory of the host (it's just an array)
 */

function Memory(size) {   
    this.words = new Array(); 
    
    // Initialize all elements of the memory array to 00
    for (var i = 0; i < size; i++) {
        this.words[i] = new Word("00");
    }
};

// The length of the word (this will be utilized later)
Word.LENGTH = 8;

// The object that represents a word in memory (this will be fleshed out later as well)
function Word(data) {
    this.data = data;
}