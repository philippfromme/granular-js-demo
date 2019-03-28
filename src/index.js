import Granular from 'granular-js';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

import getData from './getData';

import Waveform from './Waveform';
import Grains from './Grains';
import DragAndDrop from './DragAndDrop';
import AutoPlay from './AutoPlay';

const pillPlay = document.getElementById('pill-play'),
      pillLoading = document.getElementById('pill-loading'),
      canvases = document.getElementById('canvases');

async function init() {
  const data = await getData('./example.wav');

  const audioContext = p5.prototype.getAudioContext();

  const granular = new Granular({
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

  const dragAndDrop = new DragAndDrop(canvases);

  // dragAndDrop.on('dragOver', () => console.log('drag over'));

  dragAndDrop.on('fileRead', async ({ data }) => {
    autoPlay.stop();

    pillPlay.textContent = 'Play';

    pillLoading.classList.remove('hidden');
    pillPlay.classList.add('inactive');

    await granular.setBuffer(data);

    pillLoading.classList.add('hidden');
    pillPlay.classList.remove('inactive');
  });

  granular.on('bufferSet', ({ buffer }) => {
    waveform.draw(buffer);
  });

  const autoPlay = new AutoPlay(granular);

  let playing = false;

  pillPlay.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (playing) {
      autoPlay.stop();

      pillPlay.textContent = 'Play';
    } else {
      autoPlay.start();

      pillPlay.textContent = 'Stop';
    }

    playing = !playing;
  });

  pillPlay.addEventListener('mousedown', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });

  await granular.setBuffer(data);

  pillLoading.classList.add('hidden');
  pillPlay.classList.remove('inactive');
}

init();