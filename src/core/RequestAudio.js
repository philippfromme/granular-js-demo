import inject from '../inject';
import Events from './Events';
import OverlayLoader from './OverlayLoader';

function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

class RequestAudio {
  constructor(events, overlayLoader) {
    this.events = events;
    this.overlayLoader = overlayLoader;

    events.on('requestAudio.requestUrl', context => {
      const url = context.url;

      this.requestUrl(url);
    });
  }

  requestUrl(url, callback, text = 'Downloading Audio') {
    const loaderId = url + randomId();

    this.overlayLoader.addLoader(
      loaderId,
      // `<i class="fa fa-download" aria-hidden="true"></i> ${text}`
      `${text}`
    );

    this.events.fire('requestAudio.requestUrl.open');

    const request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.responseType = 'arraybuffer';

    request.addEventListener('progress', event => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);

        this.events.fire('requestAudio.requestUrl.progress', {
          url: url,
          progress: percentComplete
        });

        this.overlayLoader.updateLoader(
          loaderId,
          // `<i class="fa fa-download" aria-hidden="true"></i> ${text} ${percentComplete}%`
          `${text} ${percentComplete}%`
        );

      } else {
        console.log('unable to compute progress information since the total size is unknown');
      }
    });

    request.onload = () => {
      this.overlayLoader.removeLoader(loaderId);

      if (callback) {
        callback(request.response);
      }

      this.events.fire('requestAudio.requestUrl.onload', {
        url: url,
        data: request.response
      });
    }

    request.send();
  };
}

inject(RequestAudio, [ Events, OverlayLoader ]);

export default RequestAudio;
