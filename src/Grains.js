import p5 from 'p5';

const ID = 'grains';

export default class Grains {
  constructor(granular) {

    let grains = [];

    const s = (sketch) => {
      sketch.setup = function() {
        const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);

        canvas.parent('canvases');

        sketch.rectMode(sketch.CENTER);
        sketch.ellipseMode(sketch.CENTER);
        sketch.fill('#FFF');
        sketch.stroke('blue');
        sketch.strokeWeight(2);
        sketch.noCursor();

        granular.on('grainCreated', (grain) => {
          const { position } = grain;

          const x = map(position, 0, 1, 0, sketch.width);

          grain = {
            x,
            y: sketch.height / 2
          };

          grains.push(grain);

          setTimeout(() => {
            grains = grains.filter(g => g !== grain);
          }, 200);
        });
      };

      sketch.draw = function() {
        sketch.clear();

        grains.forEach(grain => {
          const { x, y } = grain;

          grain.x += 2;

          sketch.rect(x, y, 48, 16, 8);
        });

        sketch.ellipse(sketch.mouseX, sketch.mouseY, 16, 16);
      };

      sketch.mousePressed = function() {
        granular.startVoice({
          id: ID,
          position: map(sketch.mouseX, 0, sketch.width, 0, 1),
          volume: 0.5
        });
      };

      sketch.mouseDragged = function() {
        granular.updateVoice(ID, {
          position: map(sketch.mouseX, 0, sketch.width, 0, 1),
          volume: 0.5
        });
      };

      sketch.mouseReleased = function() {
        granular.stopVoice(ID);
      };

      sketch.windowResized = function() {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
      };
    }

    new p5(s);
  }
}

function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}