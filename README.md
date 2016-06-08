# Data Builder

Data Builder is a simple preprocessor for JSON and YAML files that uses directive keys to apply functions. It's useful for composing large JSON and YAML files from smaller parts, for instance for Swagger specs.

## Installation

`npm install -g data-builder`

## Usage

### CLI

`databuild path/to/file.yaml --format=yaml > result.yaml`

`--format` - Specifies the output format. It can be either `yaml` or `json`.

### Library

This module exports a function, which takes a path to a file as its lone argument:

```javascript
'use strict';

const dataBuilder = require('data-builder');

dataBuilder
  .parseFile(__dirname + '/path/to/file.yaml')
  .then(doStuffWithData)
  .tap(doMoreStuffWithData);
```

## Directives API

Directives are keys that specify a function to perform at that path in the data structure.

Right now, the tool only recognizes one directive, `$import`.

### $import

The `$import` directive loads the specified file, relative to that file, and deeply extends the object at that location with the imported object. You can override keys by defining them explicitly before or after the `$import` directive.

It can also take an array of files, which will be loaded asynchronously (no guaranteed order) and merged.

#### Merge Behavior

When objects are imported, they will be merged passively (existing keys are not overridden). When arrays are imported, they will be concatenated if the existing value is an array. Any incompatible merging will result in the new value replacing the previous.

#### Globs

As of 0.1, the library supports globbing via the [`node-glob` library](https://github.com/isaacs/node-glob), which will pull in files matching a pattern. This also works when you have an array of imports--it will simply expand the globbed files into the array.

#### Example

`a.yaml`

```yaml
foo:
  bar:
    $import: b.yaml
    z: 300
```

`b.yaml`

```yaml
x: 100
y: 200
```

Result:

```yaml
foo:
  bar:
    x: 100
    y: 200
    z: 300
```

### Examples

Go to the `examples` directory in the repo to see a fully working Swagger example.

### Development

Just run `npm test`.
