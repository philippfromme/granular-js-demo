import inject from '../../inject';
import Events from '../../core/Events';

const VOICE_ID = 'mouse';

class PlayMouse {
  constructor(events) {
    this.events = events;

    this.isPlaying = false;

    events.on('canvas.mouse.down', context => {
      const { x, y } = context;

      events.fire('audio.startVoice', {
        x: x,
        y: y,
        voiceId: VOICE_ID
      });

      events.fire('playMouse.startVoice', {
        x: x,
        y: y
      });

      this.isPlaying = true;
    });

    events.on('canvas.mouse.move', context => {
      if (!this.isPlaying) {
        return;
      }

      const { x, y } = context;

      events.fire('audio.updateVoice', {
        x: x,
        y: y,
        voiceId: VOICE_ID
      });

      events.fire('playMouse.updateVoice', {
        x: x,
        y: y
      });
    });

    events.on('canvas.mouse.up', context => {
      events.fire('audio.stopVoice', {
        voiceId: VOICE_ID
      });

      events.fire('playMouse.stopVoice');

      this.isPlaying = false;
    });
  }
}

inject(PlayMouse, Events);

export default PlayMouse;
