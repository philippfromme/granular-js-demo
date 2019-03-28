import p5 from 'p5';

const BAR_WIDTH = 4,
      GAP = 2;

export default class DrawWaveform {
  constructor() {
    const self = this;

    let step, amp;

    this.drawn = false;

    function s(sketch) {
      sketch.setup = function() {
        const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);

        canvas.parent('canvases');
      };

      sketch.draw = function() {
        if (self.drawn || !self.buffer) {
          return;
        }

        sketch.clear();

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

          let newAmp = (1 + min) * amp + (sketch.height / 20);

          lastAmp = (1 + min) * amp + (sketch.height / 20);

          if (Math.max(1, (max - min) * amp) > 2) {
            if (i % (BAR_WIDTH + GAP) === 0) {
              sketch.rect(i, newAmp, BAR_WIDTH, Math.max(1, (max - min) * amp), 8);
            }
          }
        }

        self.drawn = true;
      };

      sketch.windowResized = function() {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);

        self.drawn = false;
      };
    }

    new p5(s);
  }

  draw(buffer) {
    this.buffer = buffer.getChannelData(0);

    this.drawn = false;
  }
}