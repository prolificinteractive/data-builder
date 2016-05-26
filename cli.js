#!/usr/bin/env node

'use strict';
const yaml = require('js-yaml');
const path = require('path');
const program = require('commander');
const parseFile = require('./lib/parse-file');
const pkg = require('./package.json');

program
  .version(pkg.version)
  .usage('[options] <file>')
  .option('-f, --format <format>', 'Output format, either "json" or "yaml"')
  .parse(process.argv);

parseFile(path.resolve(process.cwd(), program.args[0]))
  .then(json => {
    return program.format === 'json'?
      JSON.stringify(json, null, 2):
      yaml.safeDump(json);
  })
  .tap(console.log)
  .catch(err => {
    throw err;
  });
