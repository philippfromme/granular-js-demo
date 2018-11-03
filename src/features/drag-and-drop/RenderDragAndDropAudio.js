import inject from '../../inject';
import Events from '../../core/Events';
import Canvas from '../../core/Canvas';

const FONT_SIZE = 12;
const FONT_FAMILY = 'Roboto';
const TEXT_WIDTH = 60;
const RECT_COLOR = 'red';
const TEXT_COLOR = 'white';
const PADDING_WIDTH = 4;
const PADDING_HEIGHT = 2;
const TEXT = 'Drop Audio';
const FREQUENCY_OFFSET = 12;
const AMPLITUDE_OFFSET = 12;

class RenderDragAndDropAudio {
  constructor(events, canvas) {
    const that = this;

    this.events = events;
    this.canvas = canvas;

    this.isActive = false;

    this.el = null;

    events.on('dragAndDropAudio.dragover', () => {
      if (!that.isActive) {
        that.isActive = true;
        
        this.show();
      }
    });

    events.on([ 'dragAndDropAudio.drop', 'canvas.mouse.leave' ], () => {
      if (that.isActive) {
        that.isActive = false;

        this.hide();
      }
    });

    // canvas.addRenderer({
    //   order: 9999,
    //   render: this.getRenderer()
    // });
  }

  show() {
    const el = this.el = document.createElement('div');

    el.classList.add('drag-and-drop');

    el.innerHTML = 'Drop';

    document.body.appendChild(el);
  }

  hide() {
    this.el && this.el.remove();
  }

  getRenderer() {

    // @philippfromme: measureText is unreliable
    // let textWidth;
    let textWidth = TEXT_WIDTH;

    const render = (context, time) => {
      const canvasWidth = this.canvas.getWidth();
      const canvasHeight = this.canvas.getHeight();

      if (this.isActive) {
        // if (!textWidth) {
        //   textWidth = context.measureText(TEXT).width;
        // }
        
        const offsetY = Math.floor(Math.sin(time / FREQUENCY_OFFSET) * AMPLITUDE_OFFSET);

        context.fillStyle = RECT_COLOR;
        context.font = `${FONT_SIZE}px ${FONT_FAMILY}`;

        const rectWidth = textWidth + (2 * PADDING_WIDTH);
        const rectHeight = FONT_SIZE  + (2 * PADDING_HEIGHT);

        context.fillRect(
          Math.round((canvasWidth / 2) - (rectWidth / 2)),
          Math.round((canvasHeight / 2) - (rectHeight / 2)) + offsetY,
          rectWidth,
          rectHeight
        );

        context.fillStyle = TEXT_COLOR;
        context.fillText(
          TEXT,
          Math.round((canvasWidth / 2) - (textWidth / 2)),
          Math.round((canvasHeight / 2) - (rectHeight / 2) + FONT_SIZE + offsetY)
        );
      }
    }

    // need to bind
    return render.bind(this);
  }
}

inject(RenderDragAndDropAudio, [ Events, Canvas ]);

export default RenderDragAndDropAudio;
