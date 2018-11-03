import inject from '../../inject';
import Events from '../../core/Events';
import Canvas from '../../core/Canvas';
import Settings from '../../core/Settings';

function map(x, inMin, inMax, outMin, outMax) {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function log(text) {
  console.log(`%c${text}`, 'background: blue; color: white');
}

const VOICE_ID = 'midi';
const NO_CONTROLLER_NAME = 'None';

class PlayMIDI {
  constructor(events, canvas, settings) {
    this.events = events;
    this.canvas = canvas;
    this.settings = settings;

    this.keysDown = [];

    // MIDI controllers
    this.controllers = [];
    this.selectedController = null;

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({
          sysex: false
      }).then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
    } else {
        log('no MIDI support in browser');
    }

    this.addSettings();
  }

  addSettings() {
    if (this.controllerSettings) {
      this.settings.removeSettings(this.controllerSettings);
    }

    if (!this.controllers.length) {
      return;
    }

    const dropDownOptions = [
      NO_CONTROLLER_NAME,
      ...this.controllers.map(c => c.name)
    ];

    // add settings
    this.controllerSettings = [
      {
        id: 'midiControllerFolder',
        type: 'folder',
        open: true,
        name: '<i class="fa fa-plug" aria-hidden="true"></i> MIDI Controllers',
        variables: [
          {
            type: 'dropdown',
            variable: 'selectedController',
            options: dropDownOptions,
            name: 'MIDI Controller',
            initial: NO_CONTROLLER_NAME,
            onChange: (value) => {
              if (value === NO_CONTROLLER_NAME) {
                this.selectedController = null;

                return;
              }

              this.selectedController = this.controllers.filter(c => c.name === value)[0];
            }
          }
        ]
      }
    ];

    this.settings.addSettings(this.controllerSettings, 100);
  }

  onMIDISuccess(midi) {
    console.log('%cmidi success', 'background: blue; color: white');
    // console.log(midi);

    const inputs = midi.inputs.values();

    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = this.onMIDIMessage.bind(this);
    }
  }

  onMIDIFailure(e) {
    console.log('%cNo access to MIDI devices or your browser doesn\'t support WebMIDI API. Please use WebMIDIAPIShim', 'background: blue; color: white');
    console.log(e);
  }

  onMIDIMessage(message) {
    // log(`MIDI message from ${message.srcElement.name}`);

    if (this.selectedController) {
      // log('using selected controller');

      this.selectedController.onMIDIMessage(message);

      return;
    }

    // log('no controller selected, default behavior');

    const data = message.data;

    const cmd = data[0] >> 4;
    const channel = data[0] & 0xf;
    const type = data[0] & 0xf0;
    const note = data[1];
    const velocity = data[2];

    switch(type) {
      case 144:
        // log('noteOn message');

        this.noteOn(note, velocity);
        break;
      case 128:
        // log('noteOff message');

        this.noteOff(note);
        break;
      default:
        // log('unhandled message');
        // log(data);
        break;
    }
  }

  noteOn(note, velocity) {

    // ignore octave
    note = note % 12;

    console.log('%cnote: ' + note + ', velocity: ' + velocity, 'background: blue; color: white');

    if (this.keysDown.includes(note)) {
      return;
    }

    this.keysDown = [ ...this.keysDown, note ];

    const increment = this.canvas.getWidth() / 12;

    const x = increment * note + increment / 2;
    const y = map(velocity, 0, 128, this.canvas.getHeight(), 0);

    this.events.fire('audio.startVoice', {
      x: Math.floor(x),
      y: Math.floor(y),
      voiceId : `${VOICE_ID}_${note}`
    });

    this.events.fire('playMIDI.startVoice', {
      x: Math.floor(x),
      y: Math.floor(y),
      voiceId : `${VOICE_ID}_${note}`
    });
  }

  noteOff(note) {

    // ignore octave
    note = note % 12;

    console.log('%cnote: ' + note, 'background: blue; color: white');

    if (!this.keysDown.includes(note)) {
      return;
    }

    this.keysDown = this.keysDown.filter(k => k !== note);

    this.events.fire('audio.stopVoice', {
      voiceId: `${VOICE_ID}_${note}`
    });

    this.events.fire('playMIDI.stopVoice', {
      voiceId: `${VOICE_ID}_${note}`
    });
  }

  addMIDIController(config) {
    const { name, onMIDIMessage } = config;

    if (!onMIDIMessage) {
      throw new Error('onMIDIMessage not found');
    }

    const controller = {
      name: name || 'Unknown Controller',
      onMIDIMessage
    };

    this.controllers = [ ...this.controllers, controller ];

    this.addSettings();

    return controller;
  }

  removeMIDIController(controller) {
    this.controllers = this.controllers.filter(c => c !== controller);
  }
}

inject(PlayMIDI, [ Events, Canvas, Settings ]);

export default PlayMIDI;
