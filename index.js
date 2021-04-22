import QUnit from './vendor/qunit.js';

QUnit.config.autostart = false;

export const isLocal = QUnit.isLocal;
export const on = QUnit.on;
export const test = QUnit.test;
export const skip = QUnit.skip;
export const start = QUnit.start;
export const is = QUnit.is;
export const extend = QUnit.extend;
export const stack = QUnit.stack;
export const onUnhandledRejection = QUnit.onUnhandledRejection;
export const assert = QUnit.assert;
export const dump = QUnit.dump;
export const done = QUnit.done;
export const testStart = QUnit.testStart;
export const moduleStart = QUnit.moduleStart;
export const version = QUnit.version;
export const module = QUnit.module;
export const todo = QUnit.todo;
export const only = QUnit.only;
export const config = QUnit.config;
export const objectType = QUnit.objectType;
export const load = QUnit.load;
export const onError = QUnit.onError;
export const pushFailure = QUnit.pushFailure;
export const equiv = QUnit.equiv;
export const begin = QUnit.begin;
export const log = QUnit.log;
export const testDone = QUnit.testDone;
export const moduleDone = QUnit.moduleDone;
export const diff = QUnit.diff;

export default Object.assign(QUnit, {
  QUnitxVersion: '0.0.1'
});
