'use strict';

const should = require('should');
const parseFile = require('../lib/parse-file');

describe('Loading a file', () => {
  describe('without imports', () => {
    it('loads cleanly', () => {
      return parseFile(__dirname + '/fixtures/nested.yaml').tap(data => {
        data.hello.object.should.equal(true);
      });
    });
  });

  describe('with one level of imports', () => {
    it('parses the data specified in the $import file', () => {
      return parseFile(__dirname + '/fixtures/import.yaml').tap(data => {
        data.a.nested.hello.object.should.equal(true);
      });
    });
  });

  describe('with nested imports', () => {
    it('resolves the whole $import tree', () => {
      return parseFile(__dirname + '/fixtures/example.yaml').tap(data => {
        data.foo.biz.a.nested.hello.object.should.equal(true);
      });
    });
  });

  describe('with an import array', () => {
    it('loads each import at that location in the object', () => {
      return parseFile(__dirname + '/fixtures/import-array.yaml').tap(data => {
        data.obj.hello.object.should.equal(true);
        data.obj.a.nested.hello.object.should.equal(true);
      });
    });
  });
});
