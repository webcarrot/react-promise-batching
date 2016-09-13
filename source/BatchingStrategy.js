"use strict";

import ReactUpdates from "react/lib/ReactUpdates";

const SOURCE_NONE = -1;
const SOURCE_FUNCTION = 0;
const SOURCE_PROMISE = 1;

const GENERATOR_FUNCTION = "GeneratorFunction";
const GENERATOR_OBJECT = "[object Generator]";

export default class BatchingStrategy {

  constructor() {
    this._source = SOURCE_NONE;
    this._promise = null;
  }

  get isBatchingUpdates() {
    return this._source !== SOURCE_NONE;
  }

  batchedUpdates(callback, a, b, c, d, e) {
    if (callback instanceof Function) {
      if (GENERATOR_FUNCTION === callback.constructor.name) {
        this._handleGeneratorFunction(callback, a, b, c, d, e);
      } else {
        this._handleFunction(callback, a, b, c, d, e);
      }
    } else if (callback !== null && callback instanceof Object) {
      if (callback instanceof Promise) {
        this._handlePromise(callback);
      } else if (GENERATOR_OBJECT === callback.toString()) {
        this._handleGeneratorObject(callback);
      }
    }
  }

  _handlePromise(promiseToHandle) {
    if (this._source === SOURCE_PROMISE) {
      const promise = this._promise = this._promise.then(() => promiseToHandle).catch(() => null).then(() => this._closePromise(promise));
    } else {
      this._source = SOURCE_PROMISE;
      const promise = this._promise = promiseToHandle.catch(() => null).then(() => this._closePromise(promise));
    }
  }

  _handleGeneratorFunction(callback, a, b, c, d, e) {
    try {
      this._handleGeneratorObject(callback(a, b, c, d, e))
    } catch (_) {
      // ignore
    }
  }

  _handleGeneratorObject(generator) {
    const generatorPromise = new Promise((resolve, reject) => {
      let done = false;
      while (!done) {
        try {
          done = generator.next().done;
        } catch (err) {
          reject(err);
        }
      }
      resolve();
    });
    this._handlePromise(generatorPromise);
  }

  _handleFunction(callback, a, b, c, d, e) {
    const isBatchingUpdates = this.isBatchingUpdates;
    if (!isBatchingUpdates) {
      this._source = SOURCE_FUNCTION;
    }
    try {
      callback(a, b, c, d, e);
    } catch (_) {
      // ignore
    }
    if (!isBatchingUpdates && this._source === SOURCE_FUNCTION) {
      this._close();
    }
    return;

  }

  _closePromise(promise) {
    if (promise === this._promise) {
      this._promise = null;
      this._close();
    }
  }

  _close() {
    try {
      ReactUpdates.flushBatchedUpdates();
    } catch (_) {
      // ignore
    }
    this._source = SOURCE_NONE;
  }

}
