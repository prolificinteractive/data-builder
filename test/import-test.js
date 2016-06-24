'use strict';

const should = require('should');
const dataBuilder = require('../index');

describe('Loading a file', () => {
  describe('without imports', () => {
    it('loads cleanly', () => {
      return dataBuilder.parseFile(__dirname + '/fixtures/nested.yaml').tap(data => {
        data.hello.object.should.equal(true);
      });
    });
  });

  describe('with a text file', () => {
    it('should use the contents of the file as the value', () => {
      return dataBuilder
        .parseFile(__dirname + '/fixtures/text-import.yaml')
        .tap(data => {
          data.text.trim().should.equal('# A Heading');
        });
    });
  });

  describe('with one level of imports', () => {
    it('parses the data specified in the $import file', () => {
      return dataBuilder.parseFile(__dirname + '/fixtures/import.yaml').tap(data => {
        data.a.nested.hello.object.should.equal(true);
      });
    });
  });

  describe('with nested imports', () => {
    it('resolves the whole $import tree', () => {
      return dataBuilder.parseFile(__dirname + '/fixtures/example.yaml').tap(data => {
        data.foo.biz.a.nested.hello.object.should.equal(true);
      });
    });

    it('removes all $import keys', () => {
      return dataBuilder.parseFile(__dirname + '/fixtures/example.yaml').tap(data => {
        JSON.stringify(data).indexOf('$import').should.equal(-1);
      });
    });
  });

  describe('with an import array', () => {
    it('loads each import at that location in the object', () => {
      return dataBuilder.parseFile(__dirname + '/fixtures/import-array.yaml').tap(data => {
        data.obj.hello.object.should.equal(true);
        data.obj.a.nested.hello.object.should.equal(true);
      });
    });
  });

  describe('with array as imported object type', () => {
    it('assigns to the key it was imported on', () => {
      return dataBuilder.parseFile(__dirname + '/fixtures/array-importer.yaml').tap(data => {
        data.my.array.should.be.an.instanceOf(Array);
      });
    });
  });

  describe('file globs', () => {
    describe('within string argument', () => {
      it('loads all matching files', () => {
        return dataBuilder.parseFile(__dirname + '/fixtures/glob.yaml').tap(data => {
          data.single.obj.hello.object.should.equal(true);
          data.single.a.b.should.be.an.instanceOf(Array);
        });
      });
    });

    describe('within array argument', () => {
      it('loads all matching files', () => {
        return dataBuilder.parseFile(__dirname + '/fixtures/glob.yaml').tap(data => {
          data.multi.obj.hello.object.should.equal(true);
          data.multi.a.b.should.be.an.instanceOf(Array);
          data.multi.my.array[2].should.equal('item 3');
        });
      });
    });
  });
});
