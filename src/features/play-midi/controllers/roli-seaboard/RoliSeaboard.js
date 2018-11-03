import inject from '../../../../inject';
import PlayMIDI from '../../PlayMIDI';
import Events from '../../../../core/Events';
import Settings from '../../../../core/Settings';
import Canvas from '../../../../core/Canvas';

function map(x, inMin, inMax, outMin, outMax) {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function toChannelKey(channel) {
  return `c${channel}`;
}

const VOICE_ID = 'seaboard';

const CONTROLLER_NAME = 'ROLI Seaboard RISE';

const COMMANDS = {
  NOTE_OFF: 128,
  NOTE_ON: 144,
  SETTING: 176,
  PRESSURE: 208,
  PITCH_BEND: 224
};

const SETTINGS = {
  74: 'audioPitch', // key y
  107: 'audioSpread', // first slider
  109: 'audioDensity', // second slider
  111: 'audioReverb', // third slider
  113: 'audioAttack', // horizontal xy pad
  114: 'audioRelease', // vertical xy pad
};

const OCTAVES = 2;
const SEMITONES_PER_OCTAVE = 12;

class RoliSeaboard {
  constructor(playMIDI, events, settings, canvas) {
    this.playMIDI = playMIDI;
    this.events = events;
    this.settings = settings;
    this.canvas = canvas;

    this.channels = {};

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

    // console.log(`ch ${channel} [${type}, ${note}, ${velocity}]`);

    switch (type) {
      case COMMANDS.NOTE_OFF:
        this.onNoteOff(channel);
        break;
      case COMMANDS.NOTE_ON:
        this.onNoteOn(channel, note, velocity);
        break;
      case COMMANDS.PRESSURE:
        this.onPressureChange(channel, note);
        break;
      case COMMANDS.PITCH_BEND:
        // this.onPitchBend(channel, note);
        break;
      case COMMANDS.SETTING:
        this.onSetting(note, velocity);
        break;
      default:
        break;
    }
  }

  onNoteOn(channel, note, velocity) {
    const channelKey = toChannelKey(channel);

    if (this.channels[channelKey]) {
      throw new Error('channel already in use');
    }

    const x = this.noteToX(note);
    const y = this.pressureToY(velocity);

    this.channels[channelKey] = {
      x,
      y
    };

    this.events.fire('audio.startVoice', {
      x,
      y,
      voiceId : `${VOICE_ID}_${channel}`
    });

    // must be fired for voice to render
    this.events.fire('playMIDI.startVoice', {
      x,
      y,
      voiceId : `${VOICE_ID}_${channel}`
    });
  }

  onNoteOff(channel) {
    const channelKey = toChannelKey(channel);

    if (this.channels[channelKey]) {
      delete this.channels[channelKey];

      this.events.fire('audio.stopVoice', {
        voiceId : `${VOICE_ID}_${channel}`
      });

      // must be fired for voice to render
      this.events.fire('playMIDI.stopVoice', {
        voiceId : `${VOICE_ID}_${channel}`
      });
    } else {
      console.log('channel not found');
    }
  }

  onSetting(key, value) {
    if (!SETTINGS[key]) {
      return;
    }

    const controller = this.settings.getController(SETTINGS[key]);

    let mapped = map(value, 0, 127, controller.__min, controller.__max);

    mapped = Math.floor(mapped * 100) / 100;

    this.settings.setControllerValue(SETTINGS[key], mapped);
  }

  onPressureChange(channel, pressure) {
    const channelKey = toChannelKey(channel);

    if (!this.channels[channelKey]) {
      console.log('channel not found');

      return;
    }

    const y = this.pressureToY(pressure);

    this.channels[channelKey].y = y;

    this.events.fire('audio.updateVoice', {
      x: this.channels[channelKey].x,
      y: this.channels[channelKey].y,
      voiceId : `${VOICE_ID}_${channel}`
    });

    // must be fired for voice to render
    this.events.fire('playMIDI.updateVoice', {
      x: this.channels[channelKey].x,
      y: this.channels[channelKey].y,
      voiceId : `${VOICE_ID}_${channel}`
    });
  }

  onPitchBend(channel, pitchBend) {
    // console.log('%cpitch bend ' + pitchBend, 'background: white; color: black');

    const channelKey = toChannelKey(channel);

    if (!this.channels[channelKey]) {
      console.log('channel not found');

      return;
    }

    const x = this.pitchBendToX(pitchBend);

    this.events.fire('audio.updateVoice', {
      x: this.channels[channelKey].x + x,
      y: this.channels[channelKey].y,
      voiceId : `${VOICE_ID}_${channel}`
    });

    // must be fired for voice to render
    this.events.fire('playMIDI.updateVoice', {
      x: this.channels[channelKey].x + x,
      y: this.channels[channelKey].y,
      voiceId : `${VOICE_ID}_${channel}`
    });
  }

  noteToX(note) {
    const semitones = OCTAVES * SEMITONES_PER_OCTAVE;
    const mappedToTwoOctaves = note % semitones;
    const canvasWidth = this.canvas.getWidth();
    const increment = canvasWidth / semitones;

    const x = mappedToTwoOctaves * increment + (increment / 2);

    return Math.round(x);
  }

  pitchBendToX(pitchBend) {
    return pitchBend;
  }

  pressureToY(pressure) {
    const canvasHeight = this.canvas.getHeight();
    const mapped = map(pressure, 0, 127, 0, 1);

    return canvasHeight - (canvasHeight * mapped);
  }
}

inject(RoliSeaboard, [ PlayMIDI, Events, Settings, Canvas ]);

export default RoliSeaboard;
