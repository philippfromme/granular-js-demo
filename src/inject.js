import { annotate, Inject } from 'di/src';
import isArray from 'lodash/isArray';

function inject(target, dependencies) {
  if (!isArray(dependencies)) {
    dependencies = [ dependencies ];
  }

  annotate(target, new Inject(...dependencies));
}

export default inject;
