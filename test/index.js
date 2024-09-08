import {
  clearTestPage,
  getBrowserAssertions,
  getBrowserGlobals,
  inBrowser,
} from './browser.js';
import { range } from '/utils/misc.js';

const URL_PARAM_KEY = 'file_path';

let mocks = {}; // TODO: avoid globals to allow parallel tests

export function loadNew(filePath) {
  const search = new URLSearchParams();
  search.set(URL_PARAM_KEY, filePath);

  const url = new URL(location.href);
  url.search = search.toString();

  location.href = url;
}

export function loadFilePath() {
  const url = new URL(location.href);
  const params = new URLSearchParams(url.search);
  return params.get(URL_PARAM_KEY);
}

export async function load(filePath) {
  if (!filePath) {
    throw new Error('no file path');
  }
  const tests = [];
  setupGlobals(tests);
  await import(filePath); // populates tests; requires page reload to rerun; TODO: avoid reload
  return tests;
}

export async function run(tests) {
  if (tests.length === 0) {
    throw new Error('no tests');
  }
  const results = [];
  tests.forEach(({ callbacks, test, description }) => {
    if (inBrowser()) {
      clearTestPage();
    }
    try {
      callbacks.before.forEach((cb) => cb());
      test();
      results.push({ success: true, description });
    } catch (error) {
      results.push({ success: false, description, error });
    }
    callbacks.after.forEach((cb) => cb());
    clearMocks();
  });
  return results;
}

// Globals: describe, it, beforeEach, mock, expect
function setupGlobals(tests) {
  let prefix = '';
  const callbacks = {
    before: [],
    after: [],
  };

  Object.assign(window, {
    describe,
    it,
    beforeEach,
    mock,
    expect,
    ...(inBrowser() && getBrowserGlobals()),
  });

  function describe(description, addTests) {
    const previousPrefix = prefix;
    prefix += `${description} `;
    const previousBeforeCallbackCount = callbacks.before.length;
    addTests();
    prefix = previousPrefix;
    const addedBeforeCallbacksCount =
      callbacks.before.length - previousBeforeCallbackCount;
    range(addedBeforeCallbacksCount).forEach(() => callbacks.before.pop());
  }

  function it(description, test) {
    tests.push({
      description: prefix + description,
      test,
      callbacks: {
        before: [...callbacks.before],
        after: [...callbacks.after],
      },
    });
  }

  function beforeEach(callback) {
    callbacks.before.push(callback);
  }

  // TODO: afterEach()
}

function mock(object, property) {
  const original = object[property];
  const calls = [];

  const replacement = (...params) => calls.push({ params });
  object[property] = replacement;

  mocks[replacement] = { object, property, original, calls };

  // return {
  //   with: () => {},
  // };
}

function clearMocks() {
  for (const { object, property, original } of Object.values(mocks)) {
    object[property] = original;
  }
  mocks = {};
}

function expect(object) {
  return {
    ...getAssertions(object),
    not: getAssertions(object, { not: true }),
  };
}

function getAssertions(object, options = {}) {
  return {
    toBe(expected) {
      check(() => object === expected, `expected ${object} to be ${expected}`);
    },
    toHaveProperty(expected) {
      check(
        () => object.hasOwnProperty(expected),
        `expected ${object} to have property ${expected}`
      );
    },
    toHaveBeenCalledWith(...expected) {
      check(
        () =>
          mocks[object].calls.some((call) =>
            call.params.every((param, i) => param === expected[i])
          ),
        `expected ${mocks[object].property}() to have been called with ${expected}`
      );
    },
    ...(inBrowser() && getBrowserAssertions(object, check)),
  };

  function check(test, error) {
    if (!test() && !options.not) {
      throw new Error(error);
    } else if (test() && options.not) {
      throw new Error(error.replaceAll('to', 'not to'));
    }
  }
}
