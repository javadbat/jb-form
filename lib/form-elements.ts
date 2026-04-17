import { uniqueId } from "jb-core";
import type { JBFormWebComponent } from "./jb-form.js";
import type { JBFormInputStandards, NativeFormElements } from './types.js';
export class FormElements {
  form: HTMLFormElement;
  #jbForm: JBFormWebComponent;
  observer = new MutationObserver(this.#observer.bind(this))
  // we made it partial because elements attribute & properties may change after add or remove so we don't check them when added to the list but we filter non-standard one when fetched.
  customElements = new Map<Partial<JBFormInputStandards<unknown>>, null>();
  nativeElements = new Map<NativeFormElements, null>();
  get allElements() {
    return [...Array.from(this.customElements.keys()), ...Array.from(this.nativeElements.keys())]
  }
  constructor(jbForm: JBFormWebComponent) {
    this.form = document.createElement('form');
    this.form.setAttribute('id', uniqueId('form'));
    this.#jbForm = jbForm;
  }
  initElements() {
    this.#scanAll();
    this.#initObserver();
  }
  #scanAll() {
    const allElement = this.#jbForm.querySelectorAll("*");
    for (const el of allElement) {
      this.#register(el)
    }
  }
  #initObserver() {
    this.observer.observe(this.#jbForm, { subtree: true, childList: true, attributes: false, characterData: false })
  }
  #observer(mutations: MutationRecord[], observer: MutationObserver) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((addedNodes) => {
        this.#register(addedNodes);
      })
      mutation.removedNodes.forEach((addedNodes) => {
        this.#unRegister(addedNodes);
      })
    })
  }
  #unRegister(node: Node) {
    if (this.nativeElements.has(node as NativeFormElements)) {
      this.nativeElements.delete(node as NativeFormElements)
      if ((node as NativeFormElements).getAttribute('form') === this.form.id) {
        (node as NativeFormElements).removeAttribute('form')
      }
    }
    if (this.customElements.has(node as JBFormInputStandards)) {
      this.customElements.delete(node as JBFormInputStandards);
      if ((node as JBFormInputStandards).getAttribute('form') === this.form.id) {
        (node as JBFormInputStandards).removeAttribute('form')
      }
    }
  }
  #register(node: Node | Element) {
    if (!(node instanceof HTMLElement)) return;
    if (this.#isNativeControl(node) && !this.nativeElements.has(node) && this.#isClosest(node)) {
      this.nativeElements.set(node, null);
      node.setAttribute('form', this.form.id);
    } else {
      if (this.#isCustomControl(node) && !this.customElements.has(node) && this.#isClosest(node)) {
        this.customElements.set(node, null);
      } else {
        this.#handleUnregisteredWebComponent(node);
        node.setAttribute('form', this.form.id);
      }
    }

  }
  #isNativeControl(el: HTMLElement) {
    return el instanceof HTMLInputElement ||
      el instanceof HTMLSelectElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLFieldSetElement ||
      el instanceof HTMLOutputElement ||
      el instanceof HTMLObjectElement;
  }
  #handleUnregisteredWebComponent(el: HTMLElement) {
    if (el.localName.includes('-') && !el.matches(':defined')) {
      // when we have non-upgraded web-component
      customElements.whenDefined(el.localName).then((definedConstructor) => {
        if ((definedConstructor as any).formAssociated) {
          this.#register(el);
        }
      })
    }
  }
  #isCustomControl(el: HTMLElement) {
    // Opt-in signal for custom elements
    return el.dataset?.formControl !== undefined ||
      (el.constructor as any)?.formAssociated === true ||
      typeof (el as any).formAssociatedCallback === 'function';
  }
  #isClosest(el: HTMLElement) {
    return el.parentElement?.closest('form[is="jb-form"]') == this.#jbForm;
  }
}