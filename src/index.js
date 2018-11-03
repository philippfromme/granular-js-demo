import * as di from 'di';

// core
import Audio from './core/Audio';
import Canvas from './core/Canvas';
import Events from './core/Events';
import Keyboard from './core/Keyboard';
import Mouse from './core/Mouse';
import OverlayLoader from './core/OverlayLoader';
import RequestAudio from './core/RequestAudio';
import Settings from './core/Settings';

// features
import DragAndDropAudio from './features/drag-and-drop/DragAndDropAudio';
import HideInterface from './features/HideInterface';
import OverlayAbout from './features/OverlayAbout';
import PlayAuto from './features/play-auto/PlayAuto';
import PlayKeyboard from './features/play-keyboard/PlayKeyboard';
import PlayMIDI from './features/play-midi/PlayMIDI';
import PlayMouse from './features/play-mouse/PlayMouse';
import RenderAutoVoice from './features/play-auto/RenderAutoVoice';
import RenderDragAndDropAudio from './features/drag-and-drop/RenderDragAndDropAudio';
import RenderGrains from './features/RenderGrains';
import RenderGrid from './features/RenderGrid';
import RenderKeyboardVoices from './features/play-keyboard/RenderKeyboardVoices';
import RenderMIDIVoices from './features/play-midi/RenderMIDIVoices';
import RenderMouseVoice from './features/play-mouse/RenderMouseVoice';
import RenderVoices from './features/RenderVoices';
import RenderWaveform from './features/RenderWaveform';
import TouchSupport from './features/touch-support/TouchSupport';

// MIDI controllers
import AkaiLPD8 from './features/play-midi/controllers/akai-lpd8/AkaiLPD8';
import RoliSeaboard from './features/play-midi/controllers/roli-seaboard/RoliSeaboard';

const coreModules = [
  Audio,
  Canvas,
  Events,
  Keyboard,
  Mouse,
  OverlayLoader,
  RequestAudio,
  Settings
];

const featureModules = [
  DragAndDropAudio,
  HideInterface,
  // OverlayAbout,
  PlayAuto,
  PlayKeyboard,
  // PlayMIDI,
  PlayMouse,
  RenderAutoVoice,
  RenderDragAndDropAudio,
  RenderGrains,
  // RenderGrid,
  RenderKeyboardVoices,
  // RenderMIDIVoices,
  RenderMouseVoice,
  RenderVoices,
  RenderWaveform,
  TouchSupport
];

const controllerModules = [
  // AkaiLPD8,
  // RoliSeaboard
];

const modules = [ ...coreModules, ...featureModules, ...controllerModules ];

const injector = new di.Injector(modules);

modules.forEach(module => injector.get(module));

// kick off app
injector.get(Canvas).run();
injector.get(RequestAudio).requestUrl('audio/sample-audio.wav', buffer => {
  injector.get(Audio).setBuffer(buffer);
}, 'Downloading Sample Audio');

window.injector = injector;
