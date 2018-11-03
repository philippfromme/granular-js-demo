import inject from '../inject';
import Events from '../core/Events';
import Canvas from '../core/Canvas';

const FONT_SIZE = 12;
const FONT_FAMILY = 'Roboto';
// const RECT_COLOR = 'red';
const RECT_COLOR = 'white';
const TEXT_COLOR = 'white';
const PADDING_WIDTH = 4;
const PADDING_HEIGHT = 2;
const WIDTH = 4;

class RenderVoices {
  constructor(events, canvas) {
    this.events = events;
    this.canvas = canvas;

    this.voices = [];

    canvas.addRenderer({
      order: 10,
      render: this.getRenderer()
    });
  }

  addVoice(id, x, y, text, textWidth) {
    if (!id) {
      throw new Error('ID not found');
    }

    if (!this.voices.every(v => v.id !== id)) {
      throw new Error('ID already exists');
    }

    this.voices = [
      ...this.voices,
      {
        x,
        y,
        id,
        text,
        textWidth
      }
    ];
  }

  updateVoice(id, x, y) {
    const voice = this.voices.filter(v => v.id === id)[0];

    if (!voice) {
      return;
    }

    voice.x = x;
    voice.y = y;
  }

  removeVoice(id) {
    this.voices = this.voices.filter(v => v.id !== id);
  }

  getRenderer() {
    const render = (context, time) => {
      if (!this.voices.length) {
        return;
      }

      this.voices.forEach(voice => {
        const text = voice.text || '';

        context.font= `${FONT_SIZE}px ${FONT_FAMILY}`;

        if (!voice.textWidth) {
          voice.textWidth = context.measureText(text).width;
        }

        context.fillStyle = RECT_COLOR;

        context.fillRect(
          voice.x - 1,
          // voice.y,
          0,
          WIDTH,
          this.canvas.getHeight() //- voice.y
        );

        // context.fillRect(
        //   voice.x,
        //   voice.y,
        //   Math.floor(voice.textWidth + (2 * PADDING_WIDTH)),
        //   FONT_SIZE + (2 * PADDING_HEIGHT)
        // );

        // context.fillStyle = TEXT_COLOR;

        // context.fillText(
        //   text,
        //   Math.floor(voice.x + PADDING_WIDTH),
        //   Math.floor(voice.y + FONT_SIZE)
        // );
      });
    }

    // need to bind
    return render.bind(this);
  }
}

inject(RenderVoices, [ Events, Canvas ]);

export default RenderVoices;
