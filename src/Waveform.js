import p5 from 'p5';

const BAR_WIDTH = 4,
      GAP = 2;

export default class DrawWaveform {
  constructor(buffer) {
    this.buffer = buffer.getChannelData(0);

    const self = this;

    let step, amp;

    let drawn = false;

    function s(sketch) {
      sketch.setup = function() {
        sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);
      };
    
      sketch.draw = function() {
        if (drawn) {
          return;
        }

        step = Math.ceil(self.buffer.length / sketch.width);
        amp = sketch.height / 2 - (sketch.height / 20);
        
        sketch.strokeWeight(2);
        sketch.strokeCap(sketch.ROUND);
        sketch.fill('#FFF');
        sketch.noStroke();

        let lastAmp = null;

        for(let i = 0; i < sketch.width; i++) {

          let min = 1;
          let max = -1;
    
          // average amp
          for (let j = 0; j < step; j++) {
            const datum = self.buffer[ (i * step) + j ];
    
            if (datum < min) {
              min = datum;
            } else if (datum > max) {
              max = datum;
            }
          }

          const newAmp = (1 + min) * amp + (sketch.height / 20);

          // if (i > 0) {

          //   // upper
          //   sketch.line(i - 1, lastAmp, i, newAmp);

          //   // lower
          //   sketch.line(i - 1, sketch.height - lastAmp, i, sketch.height - newAmp);
          // }

          lastAmp = (1 + min) * amp + (sketch.height / 20);

          if (i % (BAR_WIDTH + GAP) === 0) {
            sketch.rect(i, newAmp, BAR_WIDTH, Math.max(1, (max - min) * amp), 8);
          }
        }

        drawn = true;
      };

      sketch.windowResized = function() {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);

        drawn = false;
      };
    }
      
    const myp5 = new p5(s);
  }

  draw(buffer) {
    this.buffer = buffer;

    this.drawn = false;
  }
}