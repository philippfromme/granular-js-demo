import inject from '../inject';
import Events from '../core/Events';
import Canvas from '../core/Canvas';

const GRAIN_LIFETIME_MS = 200;
// const FILL_COLOR = 'red';
const FILL_COLOR = 'white';
const WIDTH = 4;

class RenderGrains {
  constructor(events, canvas) {
    this.events = events;
    this.canvas = canvas;

    this.grains = [];

    this.renderer = {
      render: this.getRenderer(),
      order: 1
    };

    events.fire('canvas.addRenderer', {
      renderer: this.renderer
    });

    events.on('audio.grain.create', context => {
      const { x, y } = context;

      const grain = {
        x: x,
        y: y
      };

      this.grains = [ ...this.grains, grain ];

      setTimeout(() => {
        this.grains = this.grains.filter(g => g !== grain);
      }, GRAIN_LIFETIME_MS);
    });
  }

  getRenderer() {
    const render = context => {
      if (this.grains.length) {
        const canvasHeight = this.canvas.getHeight();

        context.fillStyle = FILL_COLOR;

        this.grains.forEach(grain => {
          context.fillRect(
            grain.x - 1,
            grain.y,
            WIDTH,
            canvasHeight - grain.y
          );
        });
      }
    }

    // need to bind
    return render.bind(this);
  }
}

inject(RenderGrains, [ Events, Canvas ]);

export default RenderGrains;
