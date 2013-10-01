function Memory(size) {   
    this.words = new Array(); 
    
    for (var i = 0; i < size; i++) {
        this.words[i] = new Word("00");
    }
};

Word.LENGTH = 8;

function Word(data) {
    this.data = data;
}