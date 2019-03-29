import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise(Math.random);

const ID = 'autoPlay';

export default class AutoPlay {
  constructor(granular) {
    this.granular = granular;

    this.running = false;
  }

  start() {
    if (this.running) {
      return;
    }

    const { granular } = this;

    this.running = true;

    let x = simplex.noise2D(performance.now() / 10000, 0),
        y = simplex.noise2D(performance.now() / 10000 + 1000, 0);

    granular.set({
      pitch: 1
    });

    granular.startVoice({
      id: ID,
      position: map(x, -1, 1, 0, 1),
      volume: 0.5
    });

    const run = () => {
      x = simplex.noise2D(performance.now() / 10000, 0);
      y = simplex.noise2D(performance.now() / 10000 + 1000, 0);

      granular.set({
        pitch: 1
      });

      granular.updateVoice(ID, {
        position: map(x, -1, 1, 0, 1),
        volume: 0.5
      });

      if (this.running) {
        setTimeout(run);
      }
    }

    run();
  }

  stop() {
    this.granular.stopVoice(ID);

    this.running = false;
  }
}

function map(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}