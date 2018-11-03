import inject from '../../inject';
import Events from '../../core/Events';
import RenderVoices from '../RenderVoices';

const TEXT = 'Keyboard';
const TEXT_WIDTH = 51;

function RenderKeyboardVoices(events, renderVoices) {
  events.on('playKeyboard.startVoice', context => {
    const { x, y, voiceId } = context;

    renderVoices.addVoice(voiceId, x, y, TEXT, TEXT_WIDTH);
  });

  events.on('playKeyboard.stopVoice', context => {
    const { voiceId } = context;

    renderVoices.removeVoice(voiceId);
  });
};

inject(RenderKeyboardVoices, [ Events, RenderVoices ]);

export default RenderKeyboardVoices;
