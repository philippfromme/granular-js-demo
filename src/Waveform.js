import p5 from 'p5';

export default class DrawWaveform {
  constructor(buffer) {
    buffer = buffer.getChannelData(0);

    let step, amp;

    function s(sketch) {    
      sketch.setup = function() {
        sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);

        step = Math.ceil(buffer.length / sketch.width);
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
            const datum = buffer[ (i * step) + j ];
    
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

          sketch.rect(i, newAmp, 6, Math.max(1, (max - min) * amp), 0);
        }
      };
    
      sketch.draw = function() {
        
      };
    }
      
    const myp5 = new p5(s);
  }
}