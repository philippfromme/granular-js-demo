import Granular from 'granular-js';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';

import getData from './getData';

import Waveform from './Waveform';
import Grains from './Grains';

async function init() {
  const data = await getData('./example.wav');

  const audioContext = p5.prototype.getAudioContext();

  const granular = new Granular({
    audioContext,
    envelope: {
      attack: 0,
      decay: 0.5
    },
    density: 0.9,
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

  // const distortion = new p5.Distortion(0.1, 'none'); // amount

  // distortion.process(reverb);

  // const filter = new p5.LowPass();
  
  // filter.freq(1000);
  // filter.res(10);
  // filter.process(reverb);

  const compressor = new p5.Compressor();

  compressor.process(reverb, 0.005, 6, 10, -24, 0.05); // [attack], [knee], [ratio], [threshold], [release]

  let waveform, grains;

  granular.on('bufferSet', ({ buffer }) => {

    if (!waveform) {
      waveform = new Waveform(buffer);
    } else {
      waveform.draw(buffer);
    }

    if (!grains) {
      grains = new Grains(buffer, granular);
    }
  });

  await granular.setBuffer(data);
}

init();