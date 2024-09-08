import { render } from './test/browser.js';

it('renders element', () => {
  const page = render(({ P }) => P(''));
  expect(page).toContainElement('p');
});

it('renders text element with single text string', () => {
  const text = 'hello, world';
  const page = render(({ P }) => P(text));

  const element = find(page, 'p');
  expect(element).toContainText(text);
});

it('renders text element with multiple text strings', () => {
  const first = 'hello, ';
  const second = 'world!';
  const page = render(({ P }) => P(first, second));

  const element = find(page, 'p');
  expect(element).toContainText(first + second);
});

it('renders text element with text element child', () => {
  const first = 'hello, ';
  const second = 'world!';
  const page = render(({ P, Span }) => P(first, Span(second)));

  const element = find(page, 'p');
  expect(element).toContainText(first + second);
});

describe('implements simple counter', () => {
  it('passing function with observable to text element', () => {
    const page = renderCounter(({ P, state }) =>
      P('count: ', () => state.value)
    );
    testCounter(page);
  });

  it('passing function with string template to text element', () => {
    const page = renderCounter(({ P, state }) =>
      P(() => `count: ${state.value}`)
    );
    testCounter(page);
  });

  it('passing function with text element', () => {
    const page = renderCounter(
      ({ P, state }) =>
        () =>
          P(`count: ${state.value}`)
    );
    testCounter(page);
  });

  function renderCounter(getText) {
    return render(({ obs, Div, P, Button }) => {
      const state = obs({ value: 0 });
      return Div(
        getText({ P, state }), // eg. P('count: ', () => state.value)
        Button({ onclick: () => state.value++ }, '+')
      );
    });
  }

  it('as a custom component', () => {
    const page = render(({ obs, Div, P, Button }) => {
      function Counter() {
        const state = obs({ value: 0 });
        return Div(
          P(() => `count: ${state.value}`),
          Button({ onclick: () => state.value++ }, '+')
        );
      }
      return Counter();
    });

    testCounter(page);
  });

  it('as a custom component passing an initial value', () => {
    const initialValue = 1;

    const page = render(({ obs, Div, P, Button }) => {
      function Counter({ startAt }) {
        const state = obs({ value: startAt });
        return Div(
          P(() => `count: ${state.value}`),
          Button({ onclick: () => state.value++ }, '+')
        );
      }
      return Counter({ startAt: initialValue });
    });

    testCounter(page, { initialValue });
  });

  // TODO?: check listeners are attached in the right places in the code
  it('as a custom component passing an observable to another component', () => {
    const page = render(({ obs, Div, P, Button }) => {
      function Display({ counter }) {
        return P(() => `count: ${counter.value}`);
      }
      function Counter() {
        const state = obs({ value: 0 });
        return Div(
          Display({ counter: state }),
          Button({ onclick: () => state.value++ }, '+')
        );
      }
      return Counter();
    });
    testCounter(page);
  });

  // TODO?: check listeners are attached in the right places in the code
  it('as a custom component passing an observable value to another component', () => {
    const page = render(({ obs, Div, P, Button }) => {
      function Display({ value }) {
        return P(`count: ${value}`);
      }
      function Counter() {
        const state = obs({ value: 0 });
        return Div(
          () => Display({ value: state.value }),
          Button({ onclick: () => state.value++ }, '+')
        );
      }
      return Counter();
    });

    testCounter(page);
  });

  function testCounter(page, { initialValue = 0 } = {}) {
    const button = find(page, 'button');
    click(button);
    click(button);
    click(button);

    const p = find(page, 'p');
    expect(p).toContainText(`count: ${initialValue + 3}`);
  }
});

it('implements double counter', () => {
  const page = render(({ obs, Div, P, Button }) => {
    const counter = obs({ a: 0, b: 0 });
    return Div(
      P(() => `a: ${counter.a}`),
      P(() => `b: ${counter.b}`),
      P(() => `sum: ${counter.a + counter.b}`),
      Button({ onclick: () => counter.a++ }, 'a+'),
      Button({ onclick: () => counter.b++ }, 'b+')
    );
  });

  const aButton = find(page, 'button', 'a+');
  click(aButton);
  click(aButton);
  const bButton = find(page, 'button', 'b+');
  click(bButton);

  const aCount = find(page, 'p', 'a:');
  const bCount = find(page, 'p', 'b:');
  const sumCount = find(page, 'p', 'sum:');
  expect(aCount).toContainText('a: 2');
  expect(bCount).toContainText('b: 1');
  expect(sumCount).toContainText('sum: 3');
});

// it('', () => {});
// describe('', () => {});

// const counter = obs({})
// const app = Div(
//     If(() => counter.value)
//         .Then(Div(
//             P('count: ', () => counter.value),
//             Button({ onclick: () => counter.value++ }, 'add'),
//         ))
//         .Else(Button({ onclick: () => counter = { value: 0 } }, 'init'))
// )

// const count = obs(0) // returns object; object is passed when reactivity is needed
// const app = Div(
//     P('count: ', count), // creates text node that gets updated when count.val is updated
//     Button({ onclick: () => count.val++ }, 'Increment'),
// )

/*
Use cases for obs
  - Span('hello, ', s.name)
  - Span(() => `hello, ${s.name}`)
  - If(() => s.name === 'dave').Then(span('you are the chosen one'))
  - For(() => s.items).Each((item, i) => {}, :key)
  - Button({ onclick: () => console.log(counter.value) }, 'read'),
  - Button({ onclick: () => counter.value++ }, 'write'),
*/

/* TODO: figure out best way to make attributes reactive
- Display({ value: () => state.value }),
- Display(() => { value: state.value }),
- () => Display({ value: state.value }),
*/

// TODO: implement If, For, Await, etc.
