import inject from '../inject';
import Events from './Events';

class Mouse {
  constructor(events) {
    this.events = events;

    this.states = [];
    this.state = null;

    events.on('mouse.state.add', context => {
      const { state } = context;

      this.addState(state);
    });

    events.on('mouse.state.remove', context => {
      const { state } = context;

      this.removeState(state);
    });

    events.on('mouse.state.change', context => {
      const { state } = context;

      this.setState(state);
    });
  }

  addState(state) {
    if (this.states.includes(state)) {
      return;
    }

    this.states = [ ...this.states, state ];
  }

  removeState(state) {
    this.states = this.states.filter(s => s !== state);
  }

  setState(state) {
    if (!this.states.includes(state)) {
      return;
    }

    this.state = state;

    this.events.fire('mouse.state.changed', {
      state: state
    });
  };
}

inject(Mouse, Events);

export default Mouse;
