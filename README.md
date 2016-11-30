# react-promise-batching
Batching strategy that support promise and generators as callback

## Usage

```
npm install react-promise-batching
```

Do once:
```javascript
import batchingStrategyInstance from "react-promise-batching";
import ReactUpdates from "react-dom/lib/ReactUpdates";
ReactUpdates.injection.injectBatchingStrategy(batchingStrategyInstance);
```

Somewhere:
```javascript
import ReactUpdates from "react/lib/ReactUpdates";
const batchedUpdates = ReactUpdates.batchedUpdates;
// ...
function someAction() {
  // do async stuff
  const fooPromise = fluxLib.callActionAndReturnPromise(fooAction);
  batchedUpdates(fooPromise);
  const barPromise = fluxLib.callActionAndReturnPromise(barAction);
  batchedUpdates(barPromise);
  // no real sense now ...
  // simple function
  const emptyFunction = () => null;
  batchedUpdates(emptyFunction);
  // generator function
  const generatorFunction = function*(a, b) {yield a+b;};
  batchedUpdates(generatorFunction, 1, 2);
  // generator object
  const generatorObject = generatorFunction(1, 2);
  batchedUpdates(generatorObject);
  // render after: fooPromise, barPromise resolve/reject and emptyFunction, generatorFunction and generatorObject do its job
}
// ...
```

## Todo
Tests...
