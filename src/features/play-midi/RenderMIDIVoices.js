import inject from '../../inject';
import Events from '../../core/Events';
import RenderVoices from '../RenderVoices';

const TEXT = 'MIDI';
const TEXT_WIDTH = 25;

class RenderMIDIVoices {
  constructor(events, renderVoices) {
    events.on('playMIDI.startVoice', context => {
      const { x, y, voiceId } = context;

      renderVoices.addVoice(voiceId, x, y, TEXT, TEXT_WIDTH);
    });

    events.on('playMIDI.updateVoice', context => {
      const { x, y, voiceId } = context;

      renderVoices.updateVoice(voiceId, x, y);
    });

    events.on('playMIDI.stopVoice', function(context) {
      const { voiceId } = context;

      renderVoices.removeVoice(voiceId);
    });
  }
}

inject(RenderMIDIVoices, [ Events, RenderVoices ]);

export default RenderMIDIVoices;
