import inject from '../../inject';
import Canvas from '../../core/Canvas';
import Events from '../../core/Events';

const VOICE_ID = 'touch';

class TouchSupport {
  constructor(canvas, events) {
    this.events = events;

    const canvasEl = canvas.getCanvas();

    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchmove', this.onTouchMove);
    canvasEl.addEventListener('touchend', this.onTouchEnd);

    this.touches = [];
  }

  onTouchStart = (event) => {
    event.preventDefault();

    const changedTouches = Array.from(event.changedTouches);

    changedTouches.forEach(touch => {
      if (!this.touches.includes(touch.identifier)) {
        this.touches.push(touch.identifier);

        this.events.fire('audio.startVoice', {
          x: Math.floor(touch.clientX),
          y: Math.floor(touch.clientY),
          voiceId: `${VOICE_ID}_${touch.identifier}`
        });
      }
    });
  }
  
  onTouchMove = (event) => {
    event.preventDefault();

    const changedTouches = Array.from(event.changedTouches);

    changedTouches.forEach(touch => {
      if (this.touches.includes(touch.identifier)) {
        this.events.fire('audio.updateVoice', {
          x: touch.clientX,
          y: touch.clientY,
          voiceId: `${VOICE_ID}_${touch.identifier}`
        });
      }
    });
  }
  
  onTouchEnd = (event) => {
    event.preventDefault();

    const touches = Array.from(event.touches);

    this.touches.forEach(identifier => {
      if (!touches.find(touch => touch.identifier === identifier)) {
        this.events.fire('audio.stopVoice', {
          voiceId: `${VOICE_ID}_${identifier}`
        });

        this.touches = this.touches.filter(i => i !== identifier);
      }
    });
  }
}

inject(TouchSupport, [ Canvas, Events ]);

export default TouchSupport;