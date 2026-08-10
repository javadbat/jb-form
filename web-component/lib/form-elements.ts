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
  reset() {
    for (const element of this.customElements.keys()) {
      if (element.localName !== 'jb-form') {
        // Runtime registration can include third-party form-associated custom elements
        // that do not implement the JBFormInputStandards contract.
        element.formResetCallback?.();
      }
    }
    for (const element of this.nativeElements.keys()) {
      this.#resetNativeElement(element);
    }
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
      mutation.addedNodes.forEach((addedNode) => {
        if (addedNode instanceof HTMLElement) {
          //only elements
          this.#register(addedNode);
          //addedNodes only contain direct added nodes and not children of that we need to investigate children too
          const children = addedNode.querySelectorAll("*");
          children.forEach((ch) =>{ this.#register(ch)});
        }
      })
      mutation.removedNodes.forEach((removedNode) => {
        if (removedNode instanceof HTMLElement) {
          //only elements
          this.#unRegister(removedNode);
          //addedNodes only contain direct added nodes and not children of that we need to investigate children too
          const children = removedNode.querySelectorAll("*");
          children.forEach((ch) => {this.#unRegister(ch)});
        }
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
        node.setAttribute('form', this.form.id);
      } else {
        this.#handleUnregisteredWebComponent(node);
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
  #resetNativeElement(element: NativeFormElements) {
    // Native controls do not expose formResetCallback(). These assignments mirror
    // the defaults restored by HTMLFormElement.reset().
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox' || element.type === 'radio') {
        element.checked = element.defaultChecked;
      } else if (element.type === 'file') {
        element.value = '';
      } else {
        element.value = element.defaultValue;
      }
      return;
    }
    if (element instanceof HTMLSelectElement) {
      for (const option of element.options) {
        option.selected = option.defaultSelected;
      }
      return;
    }
    if (element instanceof HTMLTextAreaElement) {
      element.value = element.defaultValue;
      return;
    }
    if (element instanceof HTMLOutputElement) {
      element.value = element.defaultValue;
    }
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
    return el.parentElement?.closest('jb-form') == this.#jbForm;
  }
}
