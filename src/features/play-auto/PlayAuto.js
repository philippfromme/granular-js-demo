import SimplexNoise from 'simplex-noise';

import inject from '../../inject';
import Events from '../../core/Events';
import Canvas from '../../core/Canvas';
import Settings from '../../core/Settings';

const VOICE_ID = 'auto';

class PlayAuto {
  constructor(events, canvas, settings) {
    this.events = events;
    this.canvas = canvas;
    this.settings = settings;

    this.noise = new SimplexNoise();

    this.isActive = false;
    this.time = 0;
    this.speed = 1;

    // events
    events.on('audio.startVoice', context => {
      const { voiceId } = context;

      if (voiceId !== VOICE_ID) {
        this.stop();
      }
    });

    events.on('audio.buffer.set.init', () => {
      this.stop();
    });

    const that = this;

    // add settings
    settings.addSettings(
      [
        {
          id: 'playAutoFolder',
          type: 'folder',
          open: true,
          // name: '<i class="fa fa-magic" aria-hidden="true"></i> Auto Play',
          name: '<i class="fa fa-play" aria-hidden="true"></i> Auto Play',
          variables: [
            {
              id: 'playAutoToggle',
              type: 'function',
              function() {
                that.toggle();
              },
              name: '<i class="fa fa-play" aria-hidden="true"></i> Start'
            },
            {
              id: 'playAutoSpeed',
              type: 'number',
              variable: 'speed',
              min: 0.1,
              max: 2,
              step: 0.05,
              name: 'Speed',
              initial: this.speed,
              onChange(value) {
                that.speed = value;
              }
            }
          ]
        }
      ],
      1
    );
  }

  toggle() {
    if (this.isActive) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;

    this.time = 0;

    const randomOffsetX = Math.floor(Math.random() * 10000);
    const randomOffsetY = Math.floor(Math.random() * 10000);

    function getX(noise, time, width) {
      const durch = 1000 * 1920 / width;
      const noiseAt = noise.noise2D(randomOffsetX + time / durch, 0) / 2 + 0.5;
      const value = noiseAt * width;

      return Math.floor(value);
    }

    function getY(noise, time, width, height) {
      const durch = 1000000 / width;
      const noiseAt = noise.noise2D(randomOffsetY + time / durch, 0) / 2 + 0.5;
      const value = noiseAt * height;

      return Math.floor(value);
    }

    let x = getX(this.noise, this.time, this.canvas.getWidth());
    let y = getY(this.noise, this.time, this.canvas.getWidth(), this.canvas.getHeight());

    const innerRun = () => {
      this.time += this.speed;

      x = getX(this.noise, this.time, this.canvas.getWidth());
      y = getY(this.noise, this.time, this.canvas.getWidth(), this.canvas.getHeight());

      this.events.fire('audio.updateVoice', {
        x,
        y,
        voiceId: VOICE_ID
      });

      this.events.fire('playAuto.updateVoice', {
        x,
        y,
        voiceId: VOICE_ID
      });
    }

    this.interval = setInterval(innerRun, 20);

    const controller = this.settings.getController('playAutoToggle');
    const propertyName = controller.domElement.parentNode.getElementsByClassName('property-name')[0];
    propertyName.innerHTML = '<i class="fa fa-stop red" aria-hidden="true"></i> Stop';

    this.events.fire('audio.startVoice', {
      x,
      y,
      voiceId: VOICE_ID
    });

    this.events.fire('playAuto.startVoice', {
      x,
      y,
      voiceId: VOICE_ID
    });

    this.events.fire('playAuto.started');
  }

  stop() {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;

    clearInterval(this.interval);

    this.events.fire('audio.stopVoice', {
      voiceId: VOICE_ID
    });

    this.events.fire('playAuto.stopVoice', {
      voiceId: VOICE_ID
    });

    const controller = this.settings.getController('playAutoToggle');
    const propertyName = controller.domElement.parentNode.getElementsByClassName('property-name')[0];
    propertyName.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i> Start';

    this.events.fire('playAuto.stopped');
  }
}

inject(PlayAuto, [ Events, Canvas, Settings ]);

export default PlayAuto;
