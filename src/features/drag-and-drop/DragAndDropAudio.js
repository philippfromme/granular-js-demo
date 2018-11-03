import inject from '../../inject';
import Events from '../../core/Events';
import Canvas from '../../core/Canvas';
import OverlayLoader from '../../core/OverlayLoader';

function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

const DROP_ZONE = 'canvas_main';

class DragAndDropAudio {
  constructor(events, canvas, overlayLoader) {
    this.events = events;
    this.canvas = canvas;

    this.dropZone = document.getElementsByClassName(DROP_ZONE)[0];

    this.dropZone.addEventListener('drop', e => {
      e.preventDefault();

      const loaderId = randomId();

      overlayLoader.addLoader(
        loaderId,
        // '<i class="fa fa-file-audio-o" aria-hidden="true"></i> Reading File'
        'Reading File'
      );

      const dataTransfer = e.dataTransfer;

      if (dataTransfer.items) {

        events.fire('dragAndDropAudio.drop');

        for (let i = 0; i < dataTransfer.items.length; i++) {

          if (dataTransfer.items[i].kind == 'file') {
            events.fire('dragAndDropAudio.readFile.init');

            const file = dataTransfer.items[i].getAsFile();

            const reader = new FileReader();

            reader.onload = e => {
              const buffer = reader.result;

              overlayLoader.removeLoader(loaderId);

              events.fire('dragAndDropAudio.readFile.onload', {
                data: buffer
              });

              events.fire('audio.setBuffer', {
                data: buffer
              });
            };

            reader.addEventListener('progress', event => {

              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);

                events.fire('dragAndDropAudio.readFile.progress', {
                  progress: percentComplete
                });

              } else {
                console.log('length not computable');
              }
            });

            reader.readAsArrayBuffer(file);
          }
        }
      } else {
        console.log('no items found');
      }
    });

    this.dropZone.addEventListener('dragover', e => {
      e.preventDefault();

      e.dataTransfer.dropEffect = 'copy';

      events.fire('dragAndDropAudio.dragover');
    });

    this.dropZone.addEventListener('dragend', e => {
      const dataTransfer = e.dataTransfer;

      if (dataTransfer.items) {
        for (let i = 0; i < dataTransfer.items.length; i++) {
          dataTransfer.items.remove(i);
        }
      } else {
        e.dataTransfer.clearData();
      }
    });
  }
}

inject(DragAndDropAudio, [ Events, Canvas, OverlayLoader ]);

export default DragAndDropAudio;
