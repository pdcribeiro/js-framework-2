import { getWebUi } from './web.js';

it('returns ui object', () => {
  const ui = getWebUi();
  expect(ui).toHaveProperty('createElement');
});

describe('createElement(type)', () => {
  beforeEach(() => {
    mock(document, 'createElement');
  });

  it('calls document.createElement with type param', () => {
    const ui = getWebUi();
    const type = 'span';
    ui.createElement(type);
    console.log(document.createElement);
    expect(document.createElement).toHaveBeenCalledWith(type);
  });
});
