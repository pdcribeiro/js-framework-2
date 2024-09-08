import { someFunction, someBrokenFunction } from './some-module.js';

it('succeeds', () => {
  console.log('hello, world');
});

it('fails', () => {
  throw new Error('fail');
});

it('runs module function', () => {
  someFunction();
});

describe('math', () => {
  it('1 is 1', () => {
    expect(1).toBe(1);
  });

  it('1 is 2', () => {
    expect(1).toBe(2);
  });

  it('1 is not 2', () => {
    expect(1).not.toBe(2);
  });

  it('1 is not 1', () => {
    expect(1).not.toBe(1);
  });
});
