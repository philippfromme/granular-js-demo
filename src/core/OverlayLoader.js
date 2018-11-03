import inject from '../inject';
import Events from './Events';

const HIDDEN_CLASS = 'overlay_hidden';

class OverlayLoader {
  constructor(events) {
    this.events = events;

    this.loaders = {};

    this.overlay = document.getElementsByClassName('overlay_loader')[0];
    this.list = document.getElementsByClassName('overlay_loader__list')[0];

    events.on('overlayLoader.show', context => {
      const { loaderId, html } = context;

      this.addLoader(loaderId, html);
    });

    events.on('overlayLoader.update', context => {
      const { loaderId, html } = context;

      this.updateLoader(loaderId, html);
    });

    events.on('overlayLoader.hide', context => {
      const { loaderId } = context;

      this.removeLoader(loaderId);
    });
  }

  addLoader(id, html) {
    this.overlay.classList.remove(HIDDEN_CLASS);

    if (this.loaders[id]) {
      throw new Error('ID already exists');
    }

    const node = document.createElement('li');
    node.innerHTML = html;

    this.list.appendChild(node);

    this.loaders[id] = node;
  }

  updateLoader(id, html) {
    if (!this.loaders[id]) {
      // throw new Error(`ID ${id} not found`);
      console.warn(`ID ${id} not found`);
      return;
    }

    this.loaders[id].innerHTML = html;
  }

  removeLoader(id) {
    if (!this.loaders[id]) {
      // throw new Error(`ID ${id} not found`);
      console.warn(`ID ${id} not found`);
      return;
    }

    this.loaders[id].remove();

    delete this.loaders[id];

    if (!Object.keys(this.loaders).length) {
      this.overlay.classList.add(HIDDEN_CLASS);
    }
  }
}

inject(OverlayLoader, Events);

export default OverlayLoader;
