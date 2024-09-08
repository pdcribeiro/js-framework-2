export function someFunction() {
  console.log('ran module function');
}

export function someBrokenFunction() {
  throw new Error('module function failed');
}
