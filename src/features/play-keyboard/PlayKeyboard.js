import inject from '../../inject';
import Events from '../../core/Events';
import Canvas from '../../core/Canvas';

const KEY_CODES = [
  65, // a
  87, // w
  83, // s
  69, // e
  68, // d
  70, // f
  84, // t
  71, // g
  90, // z
  72, // h
  85, // u
  74 // j
];

const VOICE_ID = 'keyboard';
const CANVAS_HEIGHT_PERCENTAGE = 20;

class PlayKeyboard {
  constructor(events, canvas) {
    this.events = events;
    this.canvas = canvas;

    this.keysDown = [];

    events.on('keyboard.key.down', context => {
      const { keyCode } = context;

      if (this.keysDown.includes(keyCode) ||
          !KEY_CODES.includes(keyCode)) {
        return;
      }

      this.keysDown = [ ...this.keysDown, keyCode ];

      const increment = this.canvas.getWidth() / KEY_CODES.length;

      const index = KEY_CODES.indexOf(keyCode);

      const x = increment * index + increment / 2;
      const offsetY = (Math.random() - 0.5) * (this.canvas.getHeight() / 100 * CANVAS_HEIGHT_PERCENTAGE);
      const y = this.canvas.getHeight() / 2 + offsetY;

      events.fire('audio.startVoice', {
        x: Math.floor(x),
        y: Math.floor(y),
        voiceId: `${VOICE_ID}_${keyCode}`
      });

      events.fire('playKeyboard.startVoice', {
        x: Math.floor(x),
        y: Math.floor(y),
        voiceId: `${VOICE_ID}_${keyCode}`
      });
    });

    events.on('keyboard.key.up', context => {
      const { keyCode } = context;

      if (!KEY_CODES.includes(keyCode) ||
          !this.keysDown.includes(keyCode)) {
        return;
      }

      this.keysDown = this.keysDown.filter(k => k !== keyCode);

      events.fire('audio.stopVoice', {
        voiceId: `${VOICE_ID}_${keyCode}`
      });

      events.fire('playKeyboard.stopVoice', {
        voiceId: `${VOICE_ID}_${keyCode}`
      });
    });
  }
}

inject(PlayKeyboard, [ Events, Canvas ]);

export default PlayKeyboard;
