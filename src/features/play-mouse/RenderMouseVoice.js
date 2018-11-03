import inject from '../../inject';
import Events from '../../core/Events';
import RenderVoices from '../RenderVoices';

const ID = 'mouse';
const TEXT = 'Mouse';
const TEXT_WIDTH = 37;

class RenderMouseVoice {
  constructor(events, renderVoices) {
    this.events = events;
    this.renderVoices = renderVoices;

    this.isActive = true;

    this.added = false;

    events.on('canvas.mouse.move', context => {
      const { x, y } = context;

      if (this.added) {
        renderVoices.updateVoice(ID, x, y);
      } else {
        renderVoices.addVoice(ID, x, y, TEXT, TEXT_WIDTH);

        this.added = true;
      }
    });

    events.on('canvas.mouse.enter', context => {
      if (this.isActive) {
        return;
      }

      const { x, y } = context;

      this.isActive = true;

      renderVoices.addVoice(ID, 0, 0, TEXT, TEXT_WIDTH);
    });

    events.on('canvas.mouse.leave', context => {
      this.isActive = false;

      renderVoices.removeVoice(ID);
    });
  };
}

inject(RenderMouseVoice, [ Events, RenderVoices ]);

export default RenderMouseVoice;
