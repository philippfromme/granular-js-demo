import inject from '../inject';
import Settings from '../core/Settings';

const OVERLAY_CLASS = 'overlay_about';
const HIDDEN_CLASS = 'overlay_hidden';

class OverlayAbout {
  constructor(settings) {
    const overlay = document.getElementsByClassName(OVERLAY_CLASS)[0];

    overlay.addEventListener('click', () => {
      overlay.classList.add(HIDDEN_CLASS);
    });

    settings.addSettings(
      [
        {
          type: 'function',
          function() {
            overlay.classList.remove(HIDDEN_CLASS);
          },
          name: '<i class="fa fa-question" aria-hidden="true"></i> About'
        },
      ],
      9999
    );
  }
}

inject(OverlayAbout, [ Settings ]);

export default OverlayAbout;
