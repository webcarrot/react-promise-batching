"use strict";

import ReactUpdates from "react/lib/ReactUpdates";

const SOURCE_NONE = -1;
const SOURCE_FUNCTION = 0;
const SOURCE_PROMISE = 1;

export default class BatchingStrategy {

  constructor() {
    this.source = SOURCE_NONE;
    this.promise = null;
  }

  get isBatchingUpdates() {
    return this._source !== SOURCE_NONE;
  }

  get source() {
    return this._source;
  }

  set source(source) {
    this._source = source;
  }

  get promise() {
    return this._promise;
  }

  set promise(promise) {
    this._promise = promise;
  }

  batchedUpdates(callback, a, b, c, d, e) {
    if (a) {
      // standard call - events, components etc
      const isBatchingUpdates = this.isBatchingUpdates;
      if (!isBatchingUpdates) {
        this.source = SOURCE_FUNCTION;
      }
      this.run(callback, a, b, c, d, e);
      if (!isBatchingUpdates && this.source === SOURCE_FUNCTION) {
        this.close();
      }
      return;
    }
    if (this.isBatchingUpdates) {
      if (callback instanceof Function) {
        if (this.source === SOURCE_FUNCTION) {
          this.run(callback, a, b, c, d, e);
        } else if (this.source === SOURCE_PROMISE) {
          const promise = this.promise.then(() => this.run(callback, a, b, c, d, e)).then(() => this.closePromise(promise));
          this.promise = promise;
        }
      } else if (callback instanceof Promise) {
        if (this.source === SOURCE_FUNCTION) {
          this.source = SOURCE_PROMISE;
          this.promise = Promise.resolve();
        }
        const promise = this.promise.then(() => callback).catch(() => null).then(() => this.closePromise(promise));
        this.promise = promise;
      }
    } else {
      if (callback instanceof Function) {
        this.source = SOURCE_FUNCTION;
        this.run(callback, a, b, c, d, e);
        if (this.source === SOURCE_FUNCTION) {
          this.close();
        }
      } else if (callback instanceof Promise) {
        this.source = SOURCE_PROMISE;
        const promise = callback.catch(() => null).then(() => this.closePromise(promise));
        this.promise = promise;
      }
    }
  }

  run(callback, a, b, c, d, e) {
    try {
      callback(a, b, c, d, e);
    } catch (_) {
      // ignore
    }
  }

  closePromise(promise) {
    if (promise === this.promise) {
      this.promise = null;
      this.close();
    }
  }

  close() {
    try {
      ReactUpdates.flushBatchedUpdates();
    } catch (_) {
      // ignore
    }
    this.source = SOURCE_NONE;
  }

}
