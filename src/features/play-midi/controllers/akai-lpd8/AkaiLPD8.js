import inject from '../../../../inject';
import PlayMIDI from '../../PlayMIDI';
import Settings from '../../../../core/Settings';

function map(x, inMin, inMax, outMin, outMax) {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function log(text) {
  console.log(`%c${text}`, 'background: orange; color: white');
}

const CONTROLLER_NAME = 'Akai LPD8';

const KNOB_COMMMAND = 176;

const KNOBS_VALUES = {
  k1: 'audioAttack',
  k2: 'audioRelease',
  k3: 'audioDensity',
  k4: 'audioSpread',
  k5: 'audioReverb',
  k6: 'audioPitch',
  k7: 'playAutoSpeed'
};

class AkaiLPD8 {
  constructor(playMIDI, settings) {
    this.playMIDI = playMIDI;
    this.settings = settings;

    playMIDI.addMIDIController({
      name: CONTROLLER_NAME,
      onMIDIMessage: this.onMIDIMessage.bind(this)
    });
  }

  onMIDIMessage(message) {
    const data = message.data;

    const cmd = data[0] >> 4;
    const channel = data[0] & 0xf;
    const type = data[0] & 0xf0;
    const note = data[1];
    const velocity = data[2];

    let mapped;

    switch(type) {
      case 144:
        log('noteOn message');

        mapped = Math.round(map(note, 0, 8, 0, 12));

        this.playMIDI.noteOn(mapped, velocity);
        break;
      case 128:
        log('noteOff message');

        mapped = Math.round(map(note, 0, 8, 0, 12));

        this.playMIDI.noteOff(mapped);
        break;
      case KNOB_COMMMAND:
        log('handle knob');
        log(data);
        this.onKnob(`k${data[1]}`, data[2]);
        break;
    }
  }

  onKnob(knob, value) {
    if (KNOBS_VALUES[knob]) {
      const controller = this.settings.getController(KNOBS_VALUES[knob]);

      let mapped = map(value, 0, 127, controller.__min, controller.__max);

      mapped = Math.floor(mapped * 100) / 100;

      this.settings.setControllerValue(KNOBS_VALUES[knob], mapped);
    } else {
      log(`knob ${knob} not found`);
    }
  }
}

inject(AkaiLPD8, [ PlayMIDI, Settings ]);

export default AkaiLPD8;
