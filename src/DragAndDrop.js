import Events from 'granular-js/src/Events';

export default class DragAndDrop {
  constructor(element) {
    const events = this.events = new Events();

    const hint = document.getElementById('pill-drop');

    element.addEventListener('drop', e => {
      e.preventDefault();

      hint.classList.add('hidden');

      const dataTransfer = e.dataTransfer;

      if (dataTransfer.items) {

        events.fire('drop');

        for (let i = 0; i < dataTransfer.items.length; i++) {

          if (dataTransfer.items[i].kind == 'file') {
            events.fire('readFile');

            const file = dataTransfer.items[i].getAsFile();

            const reader = new FileReader();

            reader.onload = e => {
              const buffer = reader.result;

              events.fire('fileRead', {
                data: buffer
              });
            };

            reader.addEventListener('progress', event => {

              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);

                events.fire('readFileProgress', {
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

    element.addEventListener('dragover', e => {
      e.preventDefault();

      e.dataTransfer.dropEffect = 'copy';

      hint.classList.remove('hidden');

      events.fire('dragOver');
    });

    element.addEventListener('dragend', e => {
      const dataTransfer = e.dataTransfer;

      hint.classList.add('hidden');

      if (dataTransfer.items) {
        for (let i = 0; i < dataTransfer.items.length; i++) {
          dataTransfer.items.remove(i);
        }
      } else {
        e.dataTransfer.clearData();
      }
    });
  }

  on(event, callback) {
    this.events.on(event, callback);
  }
}