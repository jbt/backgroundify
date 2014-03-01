# Backgroundify

**Execute long synchronous functions in background node processes.**

Sometimes you have a big long synchronous function (e.g. JavaScript compilation using UglifyJS) but you don't want it locking up the main thread of your node application.

Use backgroundify to move that function onto a background process.

## Usage

**backgroundify(pathToModule[, processTitle, numProcesses ])**

 - **pathToModule** is evaluated relative to the file in which backgroundify is required
 - **numProcess** defaults to `max(1, numCpus - 1)\

```js
// fn.js

module.exports = function(input){
  // do your synchronous stuff

  return output;
};
```

```js
var backgroundify = requlre('backgroundify');

// Execute './path/to/fn' on up to 4 concurrent background processes
var fn = backgroundify('./path/to/fn', 'optional-process-title', 4);

fn(input, function(err, output){
  // if fn.js throws an error, err is set to that, otherwise null
  // output is whatever fn.js outputs
});
```
