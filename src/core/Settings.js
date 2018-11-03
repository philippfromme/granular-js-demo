import * as di from 'di';
import Events from '../core/Events';

function bubbleSort(array, value) {
  const clone = [ ...array ];

  let swapped;

  do {
    swapped = false;

    for (let i = 0; i < array.length - 1; i++) {

      if (clone[ i ][ value ] > clone[ i + 1 ][ value ]) {
        let temp = clone[ i ];
        clone[ i ] = clone[ i + 1 ];
        clone[ i + 1 ] = temp;
        swapped = true;
      }
    }
  } while (swapped);

  return clone;
}

function anonymousFunctionName() {
  const id = Math.random().toString(36).substr(2, 9);

  return `function_${id}`;
}

class Settings {
  constructor(events) {
    this.events = events;

    this.settings = [];

    this.controllers = {};
    this.folders = {};

    events.on('settings.add', context => {
      const { settings, order } = context;

      this.addSettings(settings, order);
    });
  }

  setControllerValue(id, value) {
    if (!this.controllers[id]) {
      console.log(`controller with ID ${id} not found`);

      return;
    }

    const controller = this.controllers[id];
    controller.setValue(value);
  }

  getController(id) {
    if (this.controllers[id]) {
      return this.controllers[id];
    } else {
      console.log('controller with ID not found');
    }
  }

  getFolder(id) {
    if (this.folders[id]) {
      return this.folders[id];
    } else {
      console.log('folder with ID not found');
    }
  }

  addSettings(settings, order) {
    this.controllers = [];
    this.folders = [];

    // lower order means closer to top
    order = order || 0;

    this.settings = [
      ...this.settings,
      {
        settings: settings,
        order: order
      }
    ];

    this.sortSettings();

    let concatenated = [];

    this.settings.forEach(s => {
      concatenated = [ ...concatenated, ...s.settings ];
    });

    this.updateDatGui(concatenated);

    return settings;
  }

  removeSettings(settings) {
    this.settings = this.settings.filter(s => s.settings !== settings);
  }

  sortSettings() {
    this.settings = bubbleSort(this.settings, 'order');
  }

  updateDatGui(variables) {
    this.datGui && this.datGui.destroy();
    this.datGui = new dat.GUI();

    if (this.datGuiVariables) {
      this.datGuiVariables.forEach(variable => {
        delete this[variable];
      });
    }

    this.datGuiVariables = [];
    this.datGuiAnonymousFunctions = {};

    if (variables) {
      this.addVariablesToDatGui(variables);
    }
  }

  addVariablesToDatGui(variables, folder) {
    folder = folder || this.datGui;

    variables.forEach(variable => {

      let functionName = undefined;

      if (variable.type === 'folder') {
        const subFolder = folder.addFolder(variable.name);

        if (variable.id) {
          if (this.folders[variable.id]) {
            throw new Error('folder with ID already exists');
          }

          this.folders[variable.id] = subFolder;
        }

        if (variable.open) {
          subFolder.open();
        }

        const folderNode = subFolder.domElement;

        folderNode.getElementsByClassName('title')[0].innerHTML = variable.name;

        if (variable.debug) {
          folderNode.classList.add('debug');
        }

        this.addVariablesToDatGui(variable.variables, subFolder);
      } else {
        if (variable.variable) {
          this.datGuiVariables = [ ...this.datGuiVariables, variable.variable ];

          this[variable.variable] = null;
        } else if (variable.function && typeof variable.function === 'function') {
          functionName = variable.functionName || anonymousFunctionName();

          this.datGuiAnonymousFunctions[functionName] = variable.function.bind(this);
        }

        if (variable.initial !== undefined) {
          this[variable.variable] = variable.initial;
        }

        let controller;

        switch (variable.type) {
          case 'boolean':
            controller = folder.add(this, variable.variable).listen();
            break;
          case 'number':
            controller = folder.add(this, variable.variable, variable.min, variable.max).listen();
            break;
          case 'dropdown':
            controller = folder.add(this, variable.variable, variable.options).listen();
            break;
          case 'function':
            if (typeof variable.function === 'function') {
              controller = folder.add(this.datGuiAnonymousFunctions, functionName);
            } else {
              controller = folder.add(this, variable.function);
            }
            break;
          default:
            throw new Error('unknown variable type');
        }

        if (variable.debug) {
          const controllerNode = controller.domElement;

          controllerNode.parentNode.parentNode.classList.add('debug');
        }

        if (variable.id) {
          if (this.controllers[variable.id]) {
            throw new Error('controller with ID already exists');
          }

          this.controllers[variable.id] = controller;
        }

        if (variable.step) {
          controller.step(variable.step);
        }

        if (variable.name) {
          controller.name(variable.name);
        }

        if (variable.onChange) {
          controller.onChange(variable.onChange.bind(this));
        }
      }
    });
  }
}

di.annotate(Settings, new di.Inject(Events));

export default Settings;
