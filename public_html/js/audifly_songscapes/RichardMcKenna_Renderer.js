/*
 * This NoteToPlay object stores rendering information
 * for a note that is still renderable.
 */
function NoteToPlay(initX, initY, initW, initH, initR, initG, initB, initA) {
    this.timeRemaining;
    this.x = initX;
    this.y = initY;
    this.w = initW;
    this.h = initH;
    this.r = initR;
    this.g = initG;
    this.b = initB;
    this.a = initA;
}

/*
 * This is renderer for both MP3 and MIDI music
 * files for the Audifly application.
 */
function RichardMcKenna_Renderer(initCanvas) {
    this.canvas = initCanvas;
    this.graphicsContext = this.canvas.getContext("2d");

    this.oldFrequencyData = [];
    this.oldTimeDomainData = [];

    /*
     * This initializes rendering for the loaded MIDI
     * songscape.
     */
    this.initMIDI = function () {
        this.notes = new Array();
        this.bgColor0MAX = 160;
        this.bgColor0MIN = 120;
        this.bgColor0 = this.bgColor0MIN;
        this.bgInc = 40;
        this.bgIsIncreasing = true;
        this.ALPHA_INC = 1;
        this.Y_VELOCITY = 5;
        this.time = 1;
    };

    /*
     * This method is called each time a note is played
     * and provides a rendered response.
     */
    this.stepMIDI = function (now,end,channel,message,note,velocity) {
        // UPDATE THE RENDERING INFO
        var xInc = this.canvas.width/16;
        var noteInc = this.canvas.height/128;
        var x = (noteInc * note * 3) + (xInc)-200;
        var y = this.canvas.height - (noteInc * this.time);
        var w = xInc;
        var h = noteInc;
        this.time += 0.1;

        //Modify the colors here
        if(channel == 0){
          var r = 255;
          var g = 0;
          var b = 0;
        }else if(channel == 1){
          var r = 0;
          var g = 0;
          var b = 255;
        }else if(channel == 2){
          var r = 0;
          var g = 255;
          var b = 0;
        }else if(channel == 3){
          var r = 0;
          var g = 255;
          var b = 255;
        }else if(channel == 4){
          var r = 102;
          var g = 0;
          var b = 204;
        }else if(channel == 5){
          var r = 255;
          var g = 255;
          var b = 0;
        }else if(channel == 6){
          var r = 255;
          var g = 51;
          var b = 153;
        }else if(channel == 7){
          var r = 255;
          var g = 153;
          var b = 0;
        }else{
          var r = 0;
          var g = (127 - note) * 2;
          var b = (channel*16)-1;
        }

        var a = 255;
        //console.log(note);
        // MAKE A NOTE
        var newNote = new NoteToPlay(x, y, w, h, r, g, b, a);
        this.notes.push(newNote);

        //add random velocity
        this.direction = Math.floor(Math.random() * 8) + 1


        // AND REDRAW EVERYTHING
        this.midiDraw();
    };

    /*
     * We'll gradually change the background color, so
     * this method will update it's color gradient.
     */
    this.updateMidiBGColors = function() {
        // FIRST THE TOP LEFT COLOR
        if (this.bgIsIncreasing)
        {
            this.bgColor0++;
            if (this.bgColor0 >= this.bgColor0MAX)
                this.bgIsIncreasing = false;
        }
        else
        {
            this.bgColor0--;
            if (this.bgColor0 <= this.bgColor0MIN)
                this.bgIsIncreasing = true;
        }
    };

    /*
     * This function renders a frame for
     * the MIDI file being played.
     */
    this.midiDraw = function() {
        // RENDER THE BACKGROUND GRADIENT
        var grd = this.graphicsContext.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        grd.addColorStop(0, "rgb(" + this.bgColor0 + ",0," + this.bgColor0 + ")");
        grd.addColorStop(1, "rgb( 0 ," + this.bgColor0+this.bgInc + "," + this.bgColor0+this.bgInc + ")");
        this.graphicsContext.fillStyle = grd;
        this.graphicsContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateMidiBGColors();

        // AND NOW THE NOTES
        var tempNotes = new Array();
        for (var i = 0; i < this.notes.length; i++)
        {
            var note = this.notes[i];

            // DRAW A FILLED CIRCLE
            this.graphicsContext.fillStyle = "rgba(" + note.r + "," + note.g + "," + note.b + "," + note.a + ")";
            this.graphicsContext.beginPath();
            this.graphicsContext.arc(note.x, note.y, note.w/2, 0, 2*Math.PI);
            this.graphicsContext.fill();
            note.a -= this.ALPHA_INC;

            if(this.direction == 1){
              note.y -= this.Y_VELOCITY;
            }else if(this.direction == 2){
              note.x += this.Y_VELOCITY;
              note.y -= this.Y_VELOCITY;
            }else if(this.direction == 3){
              note.x += this.Y_VELOCITY;
            }else if(this.direction == 4){
              note.x += this.Y_VELOCITY;
              note.y += this.Y_VELOCITY;
            }else if(this.direction == 5){
              note.y += this.Y_VELOCITY;
            }else if(this.direction == 6){
              note.y += this.Y_VELOCITY;
              note.x -= this.Y_VELOCITY;
            }else if(this.direction == 7){
              note.x -= this.Y_VELOCITY;
            }else{
              note.y -= this.Y_VELOCITY;
              note.x -= this.Y_VELOCITY;
            }
            //Adding the tail
            this.graphicsContext.fillRect(note.x+note.w/2-10,note.y-100,10,100);
            //The Flag
            this.graphicsContext.beginPath();
            this.graphicsContext.moveTo(note.x+note.w/2,note.y-100);
            this.graphicsContext.lineTo(note.x+note.w/2+25,note.y-85);
            this.graphicsContext.lineTo(note.x+note.w/2,note.y-85);
            this.graphicsContext.fill();

            //console.log(note);

            if (note.y < this.canvas.height)
                tempNotes.push(note);
        }
        this.notes = tempNotes;
    };

    /*
     * This is called once when an mp3 soundscape
     * is first loaded.
     */
    this.initMp3 = function () {
        this.changingColorChannelValue = 0;
        this.colorInc = true;
        this.colorToInc = this.RED;
        this.RED = 0;
        this.GREEN = 1;
        this.BLUE = 2;
        this.backgroundRed = 0;
        this.backgroundGreen = 0;
        this.backgroundBlue = 0;
        this.colorToInc = this.RED;
    };

    /*
     * This function is called each frame while
     * a mp3 sondscape is being played.
     */
    this.stepMp3 = function (frequencyData, timeDomainData) {
        // RENDER THE BACKGROUND
        this.graphicsContext.fillStyle = this.generateBackgroundColor();
        this.graphicsContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // GET THE REST OF THE RENDERING DATA
        var binCount = frequencyData.length;
        var wInc = (this.canvas.width * 1) / (binCount * 1);
        var hInc = (this.canvas.height * 1)/ ( 1 * 256);
        var gInc = 256 / binCount;
        var g = 255.0;
        var x = 0;

        //console.log(timeDomainData);
        /*
        // AND NOW RENDER EACH BIN COLUMN
        for (var i = 0; i < binCount; i++) {
            // NOW USE IT TO RENDER SOMETHING
            var h = hInc * frequencyData[i] / timeDomainData[i];
            this.graphicsContext.fillStyle =
                    "rgba(" + Math.round(g) + ","
                    + Math.round(g) + ",0,255)";
            this.graphicsContext.fillRect(x, 0 , Math.ceil(wInc), h);
            this.graphicsContext.fillRect(x, this.canvas.height/2 , Math.ceil(wInc), h);
            x += wInc;
            //g -= gInc;
            if (g < 0)
                g = 0;
        }
        */
        //New Render Style
        wInc *= 8;
        x = wInc;
        xOffSet = x/2;
        w = wInc*0.8;

        for (var i = 0; i < binCount/4; i++) {
          /*
          this.graphicsContext.fillStyle =
          "rgba(" + Math.round(g) + ","
          + Math.round(g) + ",0,255)";
          */
          var h = hInc * frequencyData[i] / timeDomainData[i];
          var h2 = hInc * this.oldFrequencyData[i] / this.oldTimeDomainData[i];
          //console.log(h);

          this.graphicsContext.fillStyle = "rgba(0,255,0,255)";


          //Center circles
          this.graphicsContext.beginPath();
          this.graphicsContext.arc(x, this.canvas.height/2, h2, 0, Math.PI*2, true);
          this.graphicsContext.closePath();
          this.graphicsContext.fill();

          //Background Squares
          //this.graphicsContext.rotate(70, 80);
          this.graphicsContext.fillRect(50, 50, 50, 50);


          //this.graphicsContext.fillRect(x, this.canvas.height/2 , w, h2*w);
          //this.graphicsContext.fillRect(x, this.canvas.height/2 , w, -h2*w);

          //Square Bars
          this.graphicsContext.rotate(Math.PI*frequencyData[i], Math.PI*timeDomainData[i]);
          this.graphicsContext.fillRect(x, this.canvas.height/2 + 25 , w, h*w);
          this.graphicsContext.fillRect(x, this.canvas.height/2 - 25, w, -h*w);

          this.oldFrequencyData[i] = frequencyData[i];
          this.oldTimeDomainData[i] = timeDomainData[i];

          x += wInc;
        }
    };

    /*
     * This updates our mp3 rendering background
     * color.
     */
    this.generateBackgroundColor = function () {
        if (this.colorInc) {
            this.changingColorChannelValue++;
            if (this.changingColorChannelValue >= 255)
                this.colorInc = false;
        }
        else {
            this.changingColorChannelValue--;
            if (this.changingColorChannelValue <= 0)
            {
                // REVERSE IT
                this.colorInc = true;

                // PICK ANOTHER COLOR TO CHANGE
                this.colorToInc = Math.floor(Math.random() * 3);
            }
        }
        // NOW ASSIGN THE PROPER COLORS
        this.backgroundRed = 0;
        this.backgroundGreen = 0;
        this.backgroundBlue = 0;
        if (this.colorToInc === this.RED) this.backgroundRed = this.changingColorChannelValue;
        else if (this.colorToInc === this.GREEN) this.backgroundGreen = this.changingColorChannelValue;
        else this.backgroundBlue = this.changingColorChannelValue;
        return "rgb(" + this.backgroundRed
                + "," + this.backgroundGreen
                + "," + this.backgroundBlue
                + ")";
    };
}
