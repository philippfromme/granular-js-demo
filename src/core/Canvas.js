import inject from '../inject';
import Events from './Events';

function bubbleSort(array, value) {
  const clone = [ ...array ];

  let swapped;

  do {
    swapped = false;

    for (let i = 0; i < array.length - 1; i++) {

      if (clone[ i ][ value ] > clone[ i + 1 ][ value ]) {
        let temp = clone[ i ];
        clone[ i ] = clone[ i + 1 ];
        clone[ i + 1 ] = temp;
        swapped = true;
      }
    }
  } while (swapped);

  return clone;
}

const CANVAS = 'canvas_main';
const STATS = window.DEBUG;

class Canvas {
  constructor(events) {
    this.events = events;

    const canvas = this.canvas = document.getElementsByClassName(CANVAS)[0];
    this.context = this.canvas.getContext('2d');

    this.resizeCanvas();

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    this.time = 0;
    this.tempo = 1;
    this.isRunning = false;

    this.renderers = [];

    canvas.addEventListener('mousedown', e => {
      events.fire('canvas.mouse.down', {
        event: e,
        x: e.clientX,
        y: e.clientY
      });
    });

    canvas.addEventListener('mouseup', e => {
      events.fire('canvas.mouse.up', {
        event: e,
        x: e.clientX,
        y: e.clientY
      });
    });

    canvas.addEventListener('mousemove', e => {
      events.fire('canvas.mouse.move', {
        event: e,
        x: e.clientX,
        y: e.clientY
      });
    });

    canvas.addEventListener('mouseenter', e => {
      events.fire('canvas.mouse.enter', {
        event: e,
        x: e.clientX,
        y: e.clientY
      });
    });

    canvas.addEventListener('mouseleave', e => {
      events.fire('canvas.mouse.leave', {
        event: e,
        x: e.clientX,
        y: e.clientY
      });
    });

    // stats
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    this.stats.domElement.classList.add('stats');

    if (!STATS) {
      this.stats.hide();
    }

    document.body.appendChild(this.stats.dom);

    events.on('canvas.start', this.run.bind(this));

    events.on('canvas.stop', this.stop.bind(this));

    events.on('canvas.addRenderer', context => {
      const { renderer } = context;

      this.addRenderer(renderer);
    });

    events.on('canvas.removeRenderer', context => {
      const { renderer } = context;

      this.removeRenderer(renderer);
    });
  }

  resizeCanvas() {
    this.canvas.width = document.documentElement.clientWidth;
    this.canvas.height = document.documentElement.clientHeight;

    this.height = this.canvas.height;
    this.width = this.canvas.width;

    this.events.fire('canvas.resize', {
      width: this.width,
      height: this.height
    });
  }

  run() {
    this.isRunning = true;

    if (!this.innerRun) {
      const innerRun = () => {

        if (this.isRunning) {
          this.stats && this.stats.begin();

          this.clear();
          this.render();

          this.time += this.tempo;

          this.stats && this.stats.end();
        }

        requestAnimationFrame(innerRun);
      }

      innerRun();

      this.innerRun = true;
    }
  }

  stop() {
    this.isRunning = false;
  }

  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  render() {
    if (this.rendererAdded) {
      this.sortRenderers();

      this.rendererAdded = false;
    }

    this.renderers.forEach(renderer => {
      renderer.render(this.context, this.time);
    });
  }

  addRenderer(renderer) {
    this.rendererAdded = true;

    if(!renderer.order) {
      renderer.order = 0;
    }

    this.renderers = [ ...this.renderers, renderer ];
  }

  removeRenderer(renderer) {
    this.renderers = this.renderers.filter(r => r !== renderer);
  }

  sortRenderers() {
    this.renderers = bubbleSort(this.renderers, 'order')
  }

  getSize() {
    return {
      width: this.width,
      height: this.height
    };
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getCanvas() {
    return this.canvas;
  }
}

inject(Canvas, Events);

export default Canvas;
