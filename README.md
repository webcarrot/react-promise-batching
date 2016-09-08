# react-promise-batching
Batching strategy that support promise as callback

## Usage

```
npm install react-promise-batching
```

Do once:
```Javascript
import BatchingStrategy from "react-promise-batching";
import ReactUpdates from "react/lib/ReactUpdates";
ReactUpdates.injection.injectBatchingStrategy(new BatchingStrategy());
```

Somewhere:
```Javascript
import ReactUpdates from "react/lib/ReactUpdates";
const batchedUpdates = ReactUpdates.batchedUpdates;
// ...
// do ansync stuff
const fooPromise = service.getFooData();
batchedUpdates(fooPromise);
const barPromise = service.getBarData();
batchedUpdates(barPromise);
const emptyFunction = () => null;
batchedUpdates(emptyFunction);
// render after both fooPromise and barPromise resolve/reject and emptyFunction do its job
// ...
```
