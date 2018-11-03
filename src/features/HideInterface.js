import inject from '../inject';
import Events from '../core/Events';
import Canvas from '../core/Canvas';

const ESCAPE_KEY = 27;
const HIDDEN_CLASS = 'hidden';

function getNode(className) {
  return document.getElementsByClassName(className)[0];
}

class HideInterface {
  constructor(events, canvas) {
    this.events = events;

    this.isActive = false;

    this.domNodes = [
      // getNode('stats'),
      // getNode('logo'),
      // getNode('github-link'),
      getNode('dg')
    ];

    events.on('keyboard.key.down', context => {
      const { keyCode } = context;

      if (keyCode === ESCAPE_KEY) {
        this.toggle();
      }
    });

    // this.activate();
  }

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    this.events.fire('hideInterface.activate');

    this.isActive = true;

    this.domNodes.forEach(n => n.classList.add(HIDDEN_CLASS));
  }

  deactivate() {
    this.events.fire('hideInterface.deactivate');

    this.isActive = false;

    this.domNodes.forEach(n => n.classList.remove(HIDDEN_CLASS));
  }
}

inject(HideInterface, [ Events, Canvas ]);

export default HideInterface;
