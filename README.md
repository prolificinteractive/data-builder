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

```
'use strict';

const parseFile = require('data-builder');

function buildFile() {
  return parseFile(__dirname + '/path/to/file.yaml')
    .then(doStuffToData)
    .then(doMoreStuffToData);
}
```

## Directives API

Directives are keys that specify a function to perform at that path in the data structure.

Right now, the tool only recognizes one directive, `$import`.

### $import

The `$import` directive loads the specified file, relative to that file, and deeply extends the object at that location with the imported object. You can override keys by defining them explicitly before or after the `$import` directive.

It can also take an array of files, which will be loaded asynchronously (no guaranteed order).

#### Example

`a.yaml`

```
foo:
  bar:
    $import: b.yaml
    z: 300
```

`b.yaml`

```
x: 100
y: 200
```

Result:

```
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
