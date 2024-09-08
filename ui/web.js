export function getWebUi(page = null) {
  const document = page ? page.document : window.document;

  return {
    createElement(type) {
      const element = document.createElement(type);
      return { element };
    },
    createTextNode(text) {
      const element = document.createTextNode(text);
      return { element };
    },
    appendChild(parent, child) {
      parent.element.appendChild(child.element);
    },
    getElementById(id) {
      const element = document.getElementById(id);
      return { element };
    },
    addEventListener({ element }, event, callback) {
      element.addEventListener(event, callback);
    },
    removeEventListener({ element }, event, callback) {
      element.removeEventListener(event, callback);
    },
    isElement(object) {
      return object.hasOwnProperty('element');
    },
    replaceWith(current, replacement) {
      console.debug('replacing', current.element, 'with', replacement.element);
      current.element.replaceWith(replacement.element);
    },
  };
}
