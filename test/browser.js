import { getBuilder } from '../index.js';
import { getWebUi } from '../ui/web.js';

export function render(getApp) {
  const page = getPage();
  const ui = getWebUi(page);
  const { components, obs, render } = getBuilder(ui);
  const app = getApp({ ...components, obs, page });
  render(app, page);
  return page;
}

// Globals: find, findAll
export function getBrowserGlobals() {
  return {
    find(root, query, text = '') {
      const element = findAll(root, query, text)[0];
      if (!element) {
        throw new Error('not found');
      }
      return element;
    },
    findAll(root, query, text = '') {
      const queryMatches = root.element.querySelectorAll(query);
      const matches = Array.from(queryMatches).filter((el) =>
        el.innerText.includes(text)
      );
      return matches.map((element) => ({ element }));
    },
    click(target) {
      target.element.click();
    },
  };
}

export function getBrowserAssertions(object, check) {
  const document = isPage(object) ? object.document : window.document;

  return {
    toContainElement(type) {
      check(
        () => !!document.querySelector(type),
        `expected ${object} to have ${type} element`
      );
    },
    toContainText(text) {
      check(
        () => object.element.innerText.includes(text),
        `expected ${object} to have text "${text}"` // FIX: elements render [object Object]
      );
    },
  };
}

export function clearTestPage() {
  const iframe = document.querySelector('iframe');
  iframe.contentDocument.body.innerHTML = '';
}

export function inBrowser() {
  return typeof window !== 'undefined';
}

function getPage() {
  const iframe = document.querySelector('iframe');
  const iframeDocument = iframe.contentDocument;
  return {
    window: iframe.contentWindow,
    document: iframeDocument,
    element: iframeDocument.body,
    // findElement: (query) => findElement(iframeDocument, query),
    toString: () => 'page',
  };
}

function isPage(object) {
  return ['window', 'document', 'element'].every((p) =>
    object.hasOwnProperty(p)
  );
}
