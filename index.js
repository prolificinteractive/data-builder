'use strict';

const ParseContext = require('./lib/parse-context');

module.exports = {
  parseFile(filename) {
    return ParseContext.load(filename).call('process');
  }
};
