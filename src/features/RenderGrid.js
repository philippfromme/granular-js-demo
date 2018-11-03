import inject from '../inject';
import Events from '../core/Events';
import Canvas from '../core/Canvas';

function getOffset(voices, x, y) {
  let offsets = [];

  voices.forEach(voice => {
    const distance = getDistance(x, y, voice.x, voice.y) / 1000;

    const eased = easeOutCubic(distance);

    const offsetX = eased * (x - voice.x);
    const offsetY = eased * (y - voice.y);

    offsets = [
      ...offsets,
      {
        x: offsetX,
        y: offsetY
      }
    ];
  });

  return getAverageOffset(offsets);
}

function getAverageOffset(offsets) {
  let x = 0;
  let y = 0;

  offsets.forEach(offset => {
    x += offset.x;
    y += offset.y;
  });

  return {
    x: Math.round(x / offsets.length),
    y: Math.round(y / offsets.length)
  };
}

function getDistance(x1, y1, x2, y2){
  const yDiff = y2 - y1;
  const xDiff = x2 - x1;
  const radicant = yDiff * yDiff + xDiff * xDiff;
  const result = Math.pow(radicant, 0.5);

  return result;
}

function easeOutCubic(t) {
  return (--t) * t * t + 1;
}

const GRID_SIZE = 10;
const FILL_COLOR = 'white';

class RenderGrid {
  constructor(events, canvas) {
    this.events = events;
    this.canvas = canvas;

    this.voices = [];

    canvas.addRenderer({
      order: -1,
      render: this.getRenderer()
    });

    events.on('audio.startVoice', context => {
      const { x, y, voiceId } = context;

      if (!this.voices.every(v => v.id !== voiceId)) {
        throw new Error('ID already exists');
      }

      this.voices = [
        ...this.voices,
        {
          x,
          y,
          id: voiceId
        }
      ];
    });

    events.on('audio.stopVoice', context => {
      const { voiceId } = context;

      this.voices = this.voices.filter(v => v.id !== voiceId);
    });

    events.on('audio.updateVoice', context => {
      const { x, y, voiceId } = context;

      const voice = this.voices.filter(v => v.id === voiceId)[0];

      if (!voice) {
        return;
      }

      voice.x = x;
      voice.y = y;
    });
  }

  getRenderer() {
    const render = (context, time) => {
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();

      context.fillStyle = FILL_COLOR;

      for(let x = 0; x < canvasWidth; x += GRID_SIZE) {
        for(let y = 0; y < canvasHeight; y += GRID_SIZE) {

          let offset = { x: 0, y: 0 };

          if (this.voices.length) {
            offset = getOffset(this.voices, x, y);
          }

          context.fillRect(x + offset.x, y + offset.y, 2, 2);
        }
      }
    }

    // need to bind
    return render.bind(this);
  }
}

inject(RenderGrid, [ Events, Canvas ]);

export default RenderGrid;
