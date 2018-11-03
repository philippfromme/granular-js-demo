import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

import inject from '../inject';
import Events from '../core/Events';
import Canvas from '../core/Canvas';
import Settings from '../core/Settings';
import RequestAudio from '../core/RequestAudio';

function map(x, inMin, inMax, outMin, outMax) {
  return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

const DEBUG = window.DEBUG;

class Audio {
  constructor(events, canvas, settings, requestAudio) {
    this.events = events;
    this.canvas = canvas;
    this.settings = settings;

    const initialState = {
      envelope: {
        attack: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1,
        release: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1
      },
      density: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1,
      spread: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1,
      reverb: Math.floor((Math.random() * 0.8) * 10) / 10 + 0.1,
      pitch: 1
    };

    this.state = {
      isBufferSet: false,
      isImpulseResponseSet: false,
      envelope: {
        attack: initialState.envelope.attack,
        release: initialState.envelope.release
      },
      density: initialState.density,
      spread: initialState.spread,
      reverb: initialState.reverb,
      pitch: initialState.pitch,
      width: 0,
      height: 0,
      voices: []
    };

    // audio
    this.context = new AudioContext();

    this.buffer;

    this.master = this.context.createGain();
    this.master.gain.value = 0.5;

    this.compressor = this.context.createDynamicsCompressor();
    // this.compressor.threshold.value = -32;
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 6;
    this.compressor.ratio.value = 10;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.05;
    this.compressor.connect(this.context.destination);

    this.convolver = this.context.createConvolver();

    this.dryGain = this.context.createGain();
    this.wetGain = this.context.createGain();

    this.dryGain.gain.value = 1 - this.state.reverb;
    this.wetGain.gain.value = this.state.reverb;

    this.master.connect(this.dryGain);
    this.master.connect(this.convolver);

    this.convolver.connect(this.wetGain);

    requestAudio.requestUrl('audio/impulse-response.mp3', buffer => {
      this.context.decodeAudioData(buffer, b => {
        this.convolver.buffer = b;
      }, e => {
        console.log('Error with decoding audio data' + e.err);
      });

      this.setState({ isImpulseResponseSet: true });
    }, 'Downloading Impulse Response');

    this.dryGain.connect(this.compressor);
    this.wetGain.connect(this.compressor);

    // size
    this.setState({
      width: canvas.getWidth(),
      height: canvas.getHeight()
    });

    // events
    events.on('canvas.resize', context => {
      const { width, height } = context;

      this.setState({
        width: width,
        height: height
      });
    });

    events.on('audio.setBuffer', context => {
      const { data } = context;

      this.setBuffer(data);
    });

    events.on('audio.startVoice', context => {
      const { x, y, voiceId } = context;

      this.startVoice(x, y, voiceId);
    });

    events.on('audio.updateVoice', context => {
      const { x, y, voiceId } = context;

      this.updateVoice(x, y, voiceId);
    });

    events.on('audio.stopVoice', context => {
      const { voiceId } = context;

      this.stopVoice(voiceId);
    });

    events.on('audio.setSettings', context => {
      const { settings } = context;

      this.setState(settings);
    });

    // add settings
    events.fire('settings.add', {
      settings: [
        {
          id: 'audioSettingsFolder',
          type: 'folder',
          open: true,
          name: '<i class="fa fa-cog" aria-hidden="true"></i> Settings',
          variables: [
            {
              id: 'audioAttack',
              type: 'number',
              variable: 'attack',
              min: 0.1,
              max: 0.9,
              step: 0.05,
              name: 'Attack',
              initial: initialState.envelope.attack,
              onChange: attack => {
                this.setState({
                  envelope: {
                    attack
                  }
                });
              }
            },
            {
              id: 'audioRelease',
              type: 'number',
              variable: 'release',
              min: 0.1,
              max: 0.9,
              step: 0.05,
              name: 'Release',
              initial: initialState.envelope.release,
              onChange: release => {
                this.setState({
                  envelope: {
                    release
                  }
                });
              }
            },
            {
              id: 'audioDensity',
              type: 'number',
              variable: 'density',
              min: 0.1,
              max: 0.9,
              step: 0.05,
              name: 'Density',
              initial: initialState.density,
              onChange: density => {
                this.setState({
                  density
                });
              }
            },
            {
              id: 'audioSpread',
              type: 'number',
              variable: 'spread',
              min: 0.1,
              max: 0.9,
              step: 0.05,
              name: 'Spread',
              initial: initialState.spread,
              onChange: spread => {
                this.setState({
                  spread
                });
              }
            },
            {
              id: 'audioReverb',
              type: 'number',
              variable: 'reverb',
              min: 0.1,
              max: 0.9,
              step: 0.05,
              name: 'Reverb',
              initial: initialState.reverb,
              onChange: reverb => {
                this.setState({
                  reverb
                });
              }
            },
            {
              id: 'audioPitch',
              type: 'number',
              variable: 'pitch',
              min: 0.1,
              max: 2,
              step: 0.05,
              name: 'Pitch',
              initial: initialState.pitch,
              onChange: pitch => {
                this.setState({
                  pitch
                });
              }
            },
          ]
        }
      ],
      order: 0
    });

    if (DEBUG) {
      settings.addSettings(
        [
          {
            debug: true,
            type: 'folder',
            open: true,
            name: 'Compressor Settings',
            variables: [
              {
                debug: true,
                type: 'number',
                variable: 'threshold',
                min: -48,
                max: 0,
                step: 1,
                name: 'Threshold',
                initial: this.compressor.threshold.value,
                onChange: value => {
                  this.compressor.threshold.value = value;
                }
              },
              {
                debug: true,
                type: 'number',
                variable: 'knee',
                min: 0,
                max: 40,
                step: 1,
                name: 'Knee',
                initial: this.compressor.knee.value,
                onChange: value => {
                  this.compressor.knee.value = value;
                }
              },
              {
                debug: true,
                type: 'number',
                variable: 'ratio',
                min: 1,
                max: 20,
                step: 1,
                name: 'Ratio',
                initial: this.compressor.ratio.value,
                onChange: value => {
                  this.compressor.ratio.value = value;
                }
              },
            ]
          }
        ],
        10
      );
    }
  }

  setState(state) {
    const _setState = (oldState, newState) => {

      Object.keys(newState).forEach(key => {

        if (!isObject(newState[key]) || isArray(newState[key])) {
          oldState[key] = newState[key];
        } else {

          // recursion
          _setState(oldState[key], newState[key]);
        }
      });
    }

    _setState(this.state, state);

    this.setReverb();
  }

  setReverb() {
    const { reverb } = this.state;

    this.dryGain.gain.value = 1 - reverb;
    this.wetGain.gain.value = reverb;
  }

  setBuffer(data) {
    const loaderId = randomId();

    this.setState({ isBufferSet: false });

    this.events.fire('audio.buffer.set.init', {
      buffer: data
    });

    this.events.fire('overlayLoader.show', {
      // html: '<i class="fa fa-calculator" aria-hidden="true"></i> Decoding Data',
      html: 'Decoding Data',
      loaderId
    });

    this.context.decodeAudioData(data, buffer => {
      this.buffer = buffer;

      this.setState({ isBufferSet: true });

      this.events.fire('audio.buffer.set', {
        buffer
      });

      this.events.fire('overlayLoader.hide', {
        loaderId
      });
    });
  }

  startVoice(x, y, voiceId) {
    if (!this.state.isBufferSet || !this.state.isImpulseResponseSet) {
      return;
    }

    if (!voiceId) {
      throw new Error('voiceId not found');
    }

    // keep reference
    const that = this;

    class Voice {
      constructor(x, y) {
        this.x = x;
        this.y = y;

        this.grains = [];
        this.grainsCount = 0;

        this.timeout = null;
      }

      update(x, y) {
        this.x = x;
        this.y = y;
      }

      play() {
        const _innerPlay = () => {
          const grain = that.createGrain(this.x, this.y);

          this.grains[ this.grainsCount ] = grain;
          this.grainsCount++;

          if (this.grainsCount > 20) {
            this.grainsCount = 0;
          }

          // next interval
          const density = map(that.state.density, 1, 0, 0, 1);
          const interval = (density * 500) + 70;
          this.timeout = setTimeout(_innerPlay, interval);
        }

        _innerPlay();
      }

      stop() {
        clearTimeout(this.timeout);
      }
    }

    const voice = new Voice(x, y);
    voice.play();

    this.state.voices = [
      ...this.state.voices,
      {
        voice: voice,
        x: x,
        y: y,
        voiceId: voiceId
      }
    ];
  }

  updateVoice(x, y, voiceId) {
    this.state.voices.forEach(voice => {
      if (voice.voiceId === voiceId) {
        voice.voice.update(x, y);
      }
    });
  }

  stopVoice(voiceId) {
    this.state.voices.forEach(voice => {
      if (voice.voiceId === voiceId) {
        voice.voice.stop();
      }
    });

    const voices = this.state.voices.filter(v => v.voiceId !== voiceId);

    this.setState({
      voices
    });
  }

  createGrain(x, y) {
    const now = this.context.currentTime;

    // source
    const source = this.context.createBufferSource();
    source.playbackRate.value = source.playbackRate.value * this.state.pitch;
    source.buffer = this.buffer;

    // gain
    const gain = this.context.createGain();
    source.connect(gain);
    gain.connect(this.master);

    // update position and calcuate offset
    x = Math.max(1, x);
    const offset = x * (this.buffer.duration / this.state.width);

    // update and calculate amplitude
    let amp = y / this.state.height;
    amp = map(amp, 0.0, 1.0, 1.0, 0.0) * 0.7;

    // parameters
    const attack = this.state.envelope.attack * 0.4;
    let release = this.state.envelope.release * 1.5;

    if (release < 0) {
      release = 0.1;
    }

    const randomoffset = (Math.random() * this.state.spread) - (this.state.spread / 2);

    // envelope
    source.start(now, offset + randomoffset, attack + release);
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(amp, now + attack);
    gain.gain.linearRampToValueAtTime(0, now + (attack + release));

    // garbage collection
    source.stop(now + attack + release + 0.1);

    const disconnectTime = (attack + release) * 1000;

    setTimeout(() => {
      gain.disconnect();
    }, disconnectTime + 200);

    const randomoffsetinpixels = randomoffset / (this.buffer.duration / this.state.width);

    this.events.fire('audio.grain.create', {
      x: x + randomoffsetinpixels,
      y
    });
  }
}

inject(Audio, [ Events, Canvas, Settings, RequestAudio ]);

export default Audio;
