import inject from '../../inject';
import Events from '../../core/Events';
import RenderVoices from '../RenderVoices';

const ID = 'auto';
const TEXT = 'Auto';
const TEXT_WIDTH = 25;

class RenderAutoVoice {
  constructor(events, renderVoices) {
    this.events = events;
    this.renderVoices = renderVoices;

    this.isActive = false;

    events.on('playAuto.startVoice', context => {
      if (this.isActive) {
        return;
      }

      const { x, y } = context;

      this.isActive = true;

      renderVoices.addVoice(ID, x, y, TEXT, TEXT_WIDTH);
    });

    events.on('playAuto.updateVoice', context => {
      const { x, y } = context;

      renderVoices.updateVoice(ID, x, y);
    });

    events.on('playAuto.stopVoice', context => {
      this.isActive = false;

      renderVoices.removeVoice(ID);
    });
  }
}

inject(RenderAutoVoice, [ Events, RenderVoices ]);

export default RenderAutoVoice;
