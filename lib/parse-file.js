'use strict';

const path = require('path');
const _ = require('lodash');
const bluebird = require('bluebird');
const readFile = bluebird.promisify(require('fs').readFile);
const yaml = require('js-yaml');

function parseFile(filename) {
  const ext = path.parse(filename).ext;

  return readFile(filename)
    .then(contents => {
      switch (ext) {
        case '.yaml':
          return yaml.safeLoad(contents, {
            filename
          });
        case '.json':
          return JSON.parse(contents);
      }
    })
    .then(json => {
      const promiseIndex = {};

      function recurse(obj) {
        if (!obj || typeof obj !== 'object') {
          return;
        }

        if (obj.$import) {
          const files = [].concat(obj.$import); // Support both single and multiple imports

          files.forEach(file => {
            const importFile = path.resolve(path.parse(filename).dir, file);
            const promise = promiseIndex[importFile] = promiseIndex[importFile] || parseFile(importFile);
            promise.tap(importObj => _.defaultsDeep(obj, importObj));
            delete obj.$import;
          });
        }

        Object.keys(obj).forEach(key => {
          recurse(obj[key]);
        });
      }

      recurse(json);

      return bluebird
        .props(promiseIndex)
        .return(json);
    });
}

module.exports = parseFile;
