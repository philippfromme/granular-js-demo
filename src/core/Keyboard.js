import inject from '../inject';
import Events from './Events';

class Keyboard {
  constructor(events) {
    this.events = events;

    this.keysDown = [];

    window.addEventListener('keydown', e => {
      if (this.keysDown.includes(e.keyCode)) {
        return;
      }

      this.keysDown = [ ...this.keysDown, e.keyCode ];

      events.fire('keyboard.key.down', {
        event: e,
        keyCode: e.keyCode
      });
    });

    window.addEventListener('keyup', e => {
      if (!this.keysDown.includes(e.keyCode)) {
        return;
      }

      this.keysDown = this.keysDown.filter(k => k !== e.keyCode);

      events.fire('keyboard.key.up', {
        event: e,
        keyCode: e.keyCode
      });
    });
  }
}

inject(Keyboard, Events);

export default Keyboard;
