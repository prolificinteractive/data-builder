'use strict';

const path = require('path');
const _ = require('lodash');
const bluebird = require('bluebird');
const glob = bluebird.promisify(require('glob'));
const fs = bluebird.promisifyAll(require('fs'));
const yaml = require('js-yaml');

class ParseContext {
  constructor(options) {
    _.defaultsDeep(this, options, {
      file: {
        filename: null,
        contents: null
      },
      value: null,
      parent: null,
      key: null,
      store: {}
    });
  }

  static load(filename) {
    return fs
      .readFileAsync(filename, 'utf8')
      .then(contents => {
        const ext = path.parse(filename).ext;
        let value;

        switch (ext) {
          case '.yaml':
            value = yaml.safeLoad(contents);
            break;
          case '.json':
            value = JSON.parse(contents);
            break;
          default:
            value = contents;
            break;
        }

        return new ParseContext({
          file: {
            filename,
            contents
          },
          value,
          parent: null,
          key: null,
          store: {}
        });
      });
  }

  // Creates a new context from a file, then attaches to this context chain
  static mergeValues(to, from) {
    if (_.isArray(from)) {
      return _.isArray(to)?
        to.concat(from):
        from.slice();
    }

    // Merge keys deeply, no overwriting if imported data and result are objects; otherwise replace
    if (_.isObject(from)) {
      return _.isObject(to)?
        _.merge({}, from, to):
        _.clone(from);
    }

    // For any other types, replace the result
    return from;
  }

  fuse(filename) {
    return ParseContext
      .load(filename)
      .tap(forkedContext => {
        forkedContext.store = this.store;
        forkedContext.value = _.merge({}, forkedContext.value, this.value);
      });
  }

  child(key) {
    return new ParseContext({
      file: this.file,
      value: this.value[key],
      parent: this,
      key: key,
      store: this.store
    });
  }

  // Traverses the data structure, applying any directives
  process() {
    const val = this.value;

    // For arrays, for directives in each member
    if (_.isArray(val)) {
      return bluebird.map(val, (member, i) => {
        return this.child(i).process();
      });
    }

    // For objects, recurse through each key
    if (_.isObject(val)) {
      const directives = [];

      return bluebird
        .props(_.mapValues(val, (v, k) => {
          // Process directives
          if (k.charAt(0) === '$' && typeof this[k] === 'function') {
            directives.push(this[k].bind(this, v));
            return v;
          }

          // Otherwise, recurse into members
          return this.child(k).process();
        }))
        .then(mapped => {
          return bluebird.reduce(directives, (result, directive) => {
            return directive(result);
          }, mapped);
        });
    }

    // Otherwise, just return as a constant
    return bluebird.resolve(this.value);
  }

  // ---- DIRECTIVES -----

  // Imports the contents of the files and merges them with the object the $import key is on
  $import(files, object) {
    const directory = path.parse(this.file.filename).dir;
    const promiseIndex = this.store.importPromises = this.store.importPromises || {};

    return bluebird
      // Expand file globs into array
      .reduce([].concat(files), (unglobbedFiles, fileGlob) => {
        const absPath = path.resolve(directory, fileGlob);

        return glob(absPath).then(expandedFiles => {
          return unglobbedFiles.concat(expandedFiles);
        });
      }, [])

      // Load each file, process it, and merge it into object
      .reduce((result, importFile) => {
        if (!promiseIndex[importFile]) {
          promiseIndex[importFile] = ParseContext.load(importFile).call('process');
        }

        return promiseIndex[importFile].then(importedData => {
          return ParseContext.mergeValues(result, importedData);
        });
      }, this.value);
  }
}

module.exports = ParseContext;
