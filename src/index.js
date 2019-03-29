import Granular from 'granular-js';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

import getData from './getData';

import Waveform from './Waveform';
import Grains from './Grains';
import DragAndDrop from './DragAndDrop';
import AutoPlay from './AutoPlay';

const PRESETS = [
  {
    name: 1,
    url: './example1.mp3'
  },
  {
    name: 2,
    url: './example2.mp3'
  },
  {
    name: 3,
    url: './example3.mp3'
  },
  {
    name: 4,
    url: './example4.mp3'
  }
];

const pillPlay = document.getElementById('pill-play'),
      pillLoading = document.getElementById('pill-loading'),
      canvases = document.getElementById('canvases'),
      presets = document.getElementById('presets');

let autoPlay,
    dragAndDrop,
    granular;

const AUDIO_BUFFER_CACHE = {};

function cancel(event) {
  event.preventDefault();
  event.stopPropagation();
}

async function loadUserData(data) {
  autoPlay.stop();

  pillPlay.textContent = 'Play';

  pillLoading.classList.remove('hidden');
  pillPlay.classList.add('inactive');
  presets.classList.add('inactive');

  const buttons = Array.from(document.querySelectorAll('#presets .preset'));

  buttons.forEach(b => b.classList.add('pill-inverted'));

  await granular.setBuffer(data);

  pillLoading.classList.add('hidden');
  pillPlay.classList.remove('inactive');
  presets.classList.remove('inactive');
}

async function loadPreset({ name, url }) {
  if (process.ENV === 'development') {
    console.log(`load preset ${ name }`);
  }

  autoPlay.stop();

  pillPlay.textContent = 'Play';

  pillLoading.classList.remove('hidden');
  pillPlay.classList.add('inactive');
  presets.classList.add('inactive');

  let data;

  if (AUDIO_BUFFER_CACHE[ name ]) {

    // AudioBuffer
    data = AUDIO_BUFFER_CACHE[ name ];
  } else {

    // ArrayBuffer
    data = await getData(url);
  }

  const audioBuffer = await granular.setBuffer(data);

  AUDIO_BUFFER_CACHE[ name ] = audioBuffer;

  pillLoading.classList.add('hidden');
  pillPlay.classList.remove('inactive');
  presets.classList.remove('inactive');
}

function createPresets(data, text) {
  PRESETS.forEach((preset) => {
    const { name } = preset;

    const button = document.createElement('div');

    button.classList.add('preset', 'pill', 'pill-inverted', 'pill-button');

    button.textContent = name;

    button.addEventListener('click', () => {
      const buttons = Array.from(document.querySelectorAll('#presets .preset'));

      buttons.forEach((b) => {
        if (button === b) {
          b.classList.remove('pill-inverted');
        } else {
          b.classList.add('pill-inverted');
        }
      });


      loadPreset(preset);
    });

    presets.appendChild(button);
  });
}

async function init() {
  const audioContext = p5.prototype.getAudioContext();

  granular = new Granular({
    audioContext,
    envelope: {
      attack: 0,
      decay: 0.5
    },
    density: 0.8,
    spread: 0.1,
    pitch: 1
  });

  const delay = new p5.Delay();

  delay.process(granular, 0.5, 0.5, 3000); // source, delayTime, feedback, filter frequency

  const reverb = new p5.Reverb();

  // due to a bug setting parameters will throw error
  // https://github.com/processing/p5.js/issues/3090
  reverb.process(delay); // source, reverbTime, decayRate in %, reverse

  reverb.amp(3);

  const compressor = new p5.Compressor();

  compressor.process(reverb, 0.005, 6, 10, -24, 0.05); // [attack], [knee], [ratio], [threshold], [release]

  const waveform = new Waveform();

  new Grains(granular);

  dragAndDrop = new DragAndDrop(canvases);

  dragAndDrop.on('fileRead', async ({ data }) => {
    loadUserData(data);
  });

  granular.on('bufferSet', ({ buffer }) => {
    waveform.draw(buffer);
  });

  autoPlay = new AutoPlay(granular);

  pillPlay.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (autoPlay.isRunning()) {
      autoPlay.stop();

      pillPlay.textContent = 'Play';
    } else {
      autoPlay.start();

      pillPlay.textContent = 'Stop';
    }
  });

  window.addEventListener('keydown', (key) => {

    // space
    if (event.keyCode === 32) {
      if (autoPlay.isRunning()) {
        autoPlay.stop();

        pillPlay.textContent = 'Play';
      } else {
        autoPlay.start();

        pillPlay.textContent = 'Stop';
      }
    }
  });

  createPresets();

  const buttons = Array.from(document.querySelectorAll('#presets .preset'));

  buttons.concat(pillPlay).forEach(element => {
    [
      'click',
      'mousedown'
    ].forEach(event => {
      element.addEventListener(event, cancel);
    });
  });

  buttons[0].classList.remove('pill-inverted');

  await loadPreset(PRESETS[0]);
}

init();