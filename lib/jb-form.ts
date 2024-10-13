import { ElementsObject } from './types';
import { WithValidation } from 'jb-validation/types';
export class JBFormWebComponent extends HTMLFormElement {
  //keep original form check validity
  #formCheckValidity = this.checkValidity;
  #formReportValidity = this.reportValidity;
  constructor() {
    super();
    this.initWebComponent();
    console.log('element', this.elements);
  }
  initWebComponent() {
    this.#registerEventListener();
    this.checkValidity = this.#checkValidity;
    this.reportValidity = this.#reportValidity;
    console.log(this.on);
  }
  static get observedAttributes(): string[] {
    return [];
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // do something when an attribute has changed
    this.#onAttributeChange(name, newValue);
  }
  #registerEventListener(): void {
    this.addEventListener("submit", (e: SubmitEvent) => this.#onSubmit(e), { passive: false });
  }
  #onSubmit(e: SubmitEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.checkValidity();
  }
  #checkValidity(): boolean {
    //
    //TODO:it's not feasible now but try to bind for natural checkValidity when browser support it.
    for (const elem of this.elements) {
      const element = elem as unknown as WithValidation
      if (typeof element.checkValidity == "function") {
        //it will automatically update validation result on check
        element.checkValidity();
      }
    }
    const validationResult = this.#formCheckValidity();
    return validationResult;
  }
  #reportValidity(): boolean {
    //
    //TODO:try to bind for natural checkValidity and do not use this methods
    for (const elem of this.elements) {
      const element = elem as unknown as WithValidation
      if (typeof element.reportValidity == "function") {
        element.reportValidity();
      }
    }
    const validationResult = this.#formReportValidity();
    return validationResult;
  }
  #dispatchSubmitEvent(e: SubmitEvent) {
    const event = new SubmitEvent('submit', { ...e });
    this.dispatchEvent(event);
  }
  #onAttributeChange(name: string, value: string) {
    // switch (name) {
    //   case 'isLoading':
    //     this.isLoading = Boolean(value);
    //     break;
    //   case 'loading-text':
    //     this.loadingText = value;
    //     break;
    //   case 'type':
    //     this.elements!.button.setAttribute('type', value);
    //     break;
    //   case 'button-style':
    //     this.elements!.button.setAttribute('style', value);
    //     break;
    //   case 'disabled':
    //     if (value == "true" || value == "" || value == "disabled") {
    //       this.elements!.button.setAttribute('disabled', "disabled");
    //     } else {
    //       this.elements!.button.removeAttribute('disabled');
    //     }
    //     break;
    // }
  }
}
const myElementNotExists = !customElements.get('jb-form');
if (myElementNotExists) {
  window.customElements.define('jb-form', JBFormWebComponent, { extends: 'form' });
}

