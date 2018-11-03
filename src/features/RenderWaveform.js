import inject from '../inject';
import Events from '../core/Events';
import Canvas from '../core/Canvas';

const CANVAS = 'canvas_waveform';
const WIDTH = 4;

class RenderWaveform {
  constructor(events, canvas) {
    this.events = events;
    this.canvas = canvas;

    this.buffer = null;

    this.canvasWaveform = document.getElementsByClassName(CANVAS)[0];
    this.context = this.canvasWaveform.getContext('2d');

    this.canvasWaveform.width = canvas.getWidth();
    this.canvasWaveform.height = canvas.getHeight();

    events.on('canvas.resize', context => {
      const { width, height } = context;

      this.resizeCanvas(width, height);
    });

    events.on('audio.buffer.set', context => {
      const { buffer } = context;

      this.buffer = buffer.getChannelData(0);

      this.draw();
    });
  }

  resizeCanvas(width, height) {
    this.canvasWaveform.width = width;
    this.canvasWaveform.height = height;

    if (this.buffer) {
      this.draw();
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
  }

  draw() {
    this.clear();

    this.context.fillStyle = 'white';

    const canvasWidth = this.canvas.getWidth();
    const canvasHeight = this.canvas.getHeight();

    const step = Math.ceil(this.buffer.length / this.canvas.getWidth());
    const amp = canvasHeight / 2 - (canvasHeight / 20);

    for(let i = 0; i < canvasWidth; i++) {

      let min = 1;
      let max = -1;

      // average amp
      for(let j = 0; j < step; j++) {
        const datum = this.buffer[ (i * step) + j ];

        if (datum < min) {
        	min = datum;
        } else if (datum > max) {
        	max = datum;
        }
      }

      this.context.fillRect(i, (1 + min) * amp + (canvasHeight / 20), WIDTH, Math.max(1, (max - min) * amp));
    }
  }
}

inject(RenderWaveform, [ Events, Canvas ]);

export default RenderWaveform;
