export function getBuilder(ui) {
  let listener;

  const components = { Span, P, Div, Button };

  return { components, obs, render };

  function Span(...params) {
    const element = ui.createElement('span');
    const [_, children] = parseParams(...params);
    appendChildren(element, children);
    return element;
  }

  function P(...params) {
    const element = ui.createElement('p');
    const [_, children] = parseParams(...params);
    appendChildren(element, children);
    return element;
  }

  function Div(...params) {
    const element = ui.createElement('div');
    const [_, children] = parseParams(...params);
    appendChildren(element, children);
    return element;
  }

  function Button(...params) {
    const element = ui.createElement('button');
    const [attributes, children] = parseParams(...params);

    for (const key in attributes) {
      if (key.startsWith('on')) {
        const event = key.slice(2);
        ui.addEventListener(element, event, attributes[key]);
      }
    }

    appendChildren(element, children);
    return element;
  }

  function parseParams(...params) {
    const [first, ...rest] = params;
    if (typeof first === 'object' && !ui.isElement(first)) {
      return [first, rest];
    } else {
      return [{}, params];
    }
  }

  function appendChildren(element, children) {
    children.forEach((child) => {
      if (typeof child === 'function') {
        const childElement = createReactiveElement(child);
        ui.appendChild(element, childElement);
      } else {
        const childElement = parseElement(child);
        ui.appendChild(element, childElement);
      }
    });
  }

  function createReactiveElement(generate) {
    let element = parseElement(generate()); // saves element to be replaced
    listen(generate, (result) => {
      const replacement = parseElement(result);
      ui.replaceWith(element, replacement);
      element = replacement;
    });
    return element;
  }

  function parseElement(child) {
    if (ui.isElement(child)) {
      return child;
    } else if (['string', 'number'].includes(typeof child)) {
      return ui.createTextNode(child);
    } else {
      throw new Error('not implemented');
    }
  }

  function render(app, root) {
    ui.appendChild(root, app);
  }

  /* Reactivity

  State param limitations
  - param must be object with primitive values
  - getters must not change state values
  */

  function obs(object) {
    const callbacks = [];

    return new Proxy(object, {
      get(target, prop, receiver) {
        console.debug(
          'get()',
          JSON.stringify({ target, prop, value: target[prop] })
        );
        if (listener) {
          console.debug('registering callback');
          callbacks.push({ prop, fn: listener });
        }
        return target[prop];
      },
      set(target, prop, value) {
        console.debug('set()', JSON.stringify({ target, prop, value }));
        target[prop] = value;
        callbacks.filter((cb) => cb.prop === prop).forEach((cb) => cb.fn());
        return true;
      },
    });
  }

  function listen(valueFn, update) {
    const previousListener = listener;
    listener = () => update(valueFn());
    valueFn(); // registers listeners for all props involved
    listener = previousListener;
  }

  // function isObservable(object) {
  //   return typeof object === 'object' && object.hasOwnProperty('listen');
  // }
}
