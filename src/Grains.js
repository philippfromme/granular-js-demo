import p5 from 'p5';

const ID = 'grains';

export default class Grains {
  constructor(granular) {

    let grains = [];

    const s = (sketch) => {    
      sketch.setup = function() {
        sketch.createCanvas(sketch.windowWidth, sketch.windowHeight);

        sketch.rectMode(sketch.CENTER);
        sketch.ellipseMode(sketch.CENTER);
        sketch.fill('#FFF');
        sketch.stroke('#000');
        sketch.strokeWeight(2);
        sketch.noCursor();

        granular.on('grainCreated', ({ position, volume }) => {
          const x = map(position, 0, 1, 0, sketch.width),
                y = map(volume, 0, 1, sketch.height, 0);
    
          const grain = {
            x: sketch.mouseX,
            y: sketch.mouseY
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
        granular.set({
          pitch: adjustPitch(map(sketch.mouseY, sketch.height, 0, 0.5, 1.5))
        });

        granular.startVoice({
          id: ID,
          position: map(sketch.mouseX, 0, sketch.width, 0, 1),
          volume: 0.7
        });
      };

      sketch.mouseDragged = function() {
        granular.set({
          pitch: adjustPitch(map(sketch.mouseY, sketch.height, 0, 0.5, 1.5))
        });

        granular.updateVoice(ID, {
          position: map(sketch.mouseX, 0, sketch.width, 0, 1),
          volume: 0.7
        });
      };

      sketch.mouseReleased = function() {
        granular.stopVoice(ID);
      };

      sketch.windowResized = function() {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
      };
    }
      
    const myp5 = new p5(s);
  }
}

function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

const DELTA = 0.1;

function adjustPitch(pitch) {
  let newPitch = pitch;

  if (pitch > 1 - DELTA || pitch < 1 + DELTA) {
    newPitch = 1;
  }

  if (pitch > 1 + DELTA) {
    newPitch = map(pitch, 1 + DELTA, 2, 1, 2);
  }

  if (pitch < 1 - DELTA) {
    newPitch = map(pitch, 0, 1 - DELTA, 0, 1);
  }

  return newPitch;
}