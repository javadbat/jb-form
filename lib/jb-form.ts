import { ExtractFunction, FormValidationMessages, FormValidationResult, FormValidationSummary, FormValues, JBFormInputStandards, TraverseResult, VirtualElement, VirtualExtractFunction } from './types';
import { type WithValidation } from 'jb-validation';
export * from './types';
//TODO: add events for onDirtyChange or onValidationChange 
export class JBFormWebComponent extends HTMLFormElement {
  //keep original form check validity
  #formCheckValidity = this.checkValidity;
  #formReportValidity = this.reportValidity;
  #virtualElements: VirtualElement<any, any>[] = []
  constructor() {
    super();
    this.initWebComponent();
  }
  initWebComponent() {
    this.#registerEventListener();
    this.checkValidity = this.#checkValidity;
    this.reportValidity = this.#reportValidity;
  }
  connectedCallback(){
    this.#handleStateChanges();
  }
  static get observedAttributes(): string[] {
    return [];
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // do something when an attribute has changed
    this.#onAttributeChange(name, newValue);
  }
  get isDirty():boolean{
    const res = this.getFormDirtyStatus();
    return Object.values(res).reduce((acc,val)=>acc || val,false);
  }
  #registerEventListener(): void {
    this.addEventListener("submit", (e: SubmitEvent) => this.#onSubmit(e), { passive: false });
  }
  #onSubmit(e: SubmitEvent) {
    //prevent catching our dispatch event
    if (!e.isTrusted) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    const isAllValid = this.reportValidity();
    if (isAllValid) {
      this.#dispatchSubmitEvent(e);
    }
  }
  #checkValidity(): boolean {
    //
    //TODO:it's not feasible now but try to bind for natural checkValidity when browser support it.
    for (const elem of this.elements) {
      const element = elem as unknown as WithValidation;
      if (typeof element.checkValidity == "function") {
        //it will automatically update validation result on check
        element.checkValidity();
      }
    }
    const validationResult = this.#formCheckValidity();
    const virtualResult = this.#virtualElements.reduce((acc, item) => {
      if(typeof item.validation?.checkValidity !== "function"){
        return acc;
      }
      return item.validation.checkValidity(false) && acc;
    }, true);

    return validationResult && virtualResult;
  }
  #reportValidity(): boolean {
    let isAllValid = true;
    //TODO:try to bind for natural checkValidity and do not use this methods
    for (const elem of this.elements) {
      const element = elem as unknown as WithValidation;
      if (typeof element.reportValidity == "function") {
        isAllValid = element.reportValidity() && isAllValid;
      }
    }
    const virtualResult = this.#virtualElements.reduce((acc, item) => {
      if(typeof item.validation?.checkValidity !== "function"){
        return acc;
      }
      return item.validation.checkValidity(true) && acc;
    }, true);
    // isAllValid = isAllValid && this.#formReportValidity();
    return isAllValid && virtualResult;
  }
  #dispatchSubmitEvent(e: SubmitEvent) {
    const event = new SubmitEvent('submit', { ...e });
    this.dispatchEvent(event);
  }
  /**
   * @description returns key value object contains validation message of named element
   * @returns @public
   */
  getValidationMessages(): FormValidationMessages {
    return this.#traverseNamedElements(
      (formElement) => formElement.validationMessage ?? null,
      (vElement) => vElement.validation?.resultSummary?.message ?? null,
    );
  }
  /**
   * @description returns key value object contains validation summary result of named element
   * @returns @public
   */
  getValidationSummary(): FormValidationSummary {
    return this.#traverseNamedElements((formElement) => formElement.validation?.resultSummary ?? null,
      (vElement) => vElement.validation?.resultSummary ?? null,
    );
  }
  /**
   * @description returns key value object contains validation summary result of named element
   * @returns @public
   */
  getValidationResult(): FormValidationResult {
    return this.#traverseNamedElements((formElement) => formElement.validation?.result ?? null,
      (vElement) => vElement.validation?.result ?? null
    );
  }
  /**
 * @description returns key value object contains value of named element
 * @returns @public
 */
  getFormValues(): FormValues {
    return this.#traverseNamedElements((formElement) => formElement.value,
      (vElement) => typeof vElement.getValue == "function"?vElement.getValue():null,
    );
  }
  /**
* @description returns key value object contains dirty status of named element
* @returns @public
*/
  getFormDirtyStatus(): TraverseResult<boolean> {
    return this.#traverseNamedElements((formElement) => formElement.isDirty,
      (vElement) => typeof vElement.getDirtyStatus == "function"?vElement.getDirtyStatus():null,
    );
  }
  /**
* @description set value of named form input elements
* @param shouldUpdateInitialValue determine if we should also update initial value or not. pass false if you want initialValue remain untouched
* @returns @public
*/
  setFormValues(value: FormValues, shouldUpdateInitialValue = true) {
    for (const elem of this.elements) {
      const formElement = elem as unknown as Partial<WithValidation & JBFormInputStandards>;
      if (formElement.name && value[formElement.name] !== undefined) {
        formElement.value = value[formElement.name];
      }
    }
    for (const vElem of this.#virtualElements) {
      if (vElem.name && value[vElem.name] !== undefined && typeof vElem.setValue == "function") {
        vElem.setValue(value[vElem.name]) ;
      }
    }
    if (shouldUpdateInitialValue) {
      this.setFormInitialValues(value, false);
    }
  }
  /**
* @description set initial value of named form input elements used for dirty field detection
* @returns @public
*/
  setFormInitialValues(value: FormValues, shouldUpdateValue = true) {
    for (const elem of this.elements) {
      const formElement = elem as unknown as Partial<WithValidation & JBFormInputStandards>;
      if (formElement.name && value[formElement.name] !== undefined) {
        formElement.initialValue = value[formElement.name];
      }
    }
    for (const vElem of this.#virtualElements) {
      if (vElem.name && value[vElem.name] !== undefined && typeof vElem.setInitialValue == "function") {
        vElem.setInitialValue(value[vElem.name]) ;
      }
    }
    if (shouldUpdateValue) {
      this.setFormValues(value, false);
    }
  }
  #traverseFormNamedElements<T>(extractFunction: ExtractFunction<T>): TraverseResult<T> {
    type ValueType = ReturnType<typeof extractFunction>;
    const result: TraverseResult<ValueType> = {};
    //make it partial so every callback function have to check for nullable properties
    for (const formElement of this.elements as unknown as Partial<WithValidation & JBFormInputStandards>[]) {
      if (formElement.name) {
        result[formElement.name] = extractFunction(formElement);
      }
    }
    return result;
  }
  #traverseNamedElements<T>(extractFunction: ExtractFunction<T>, virtualExtractFunction: VirtualExtractFunction<T>): TraverseResult<T> {
    const formElementResult = this.#traverseFormNamedElements(extractFunction);
    const virtualResult = this.#traverseVirtualElement(virtualExtractFunction);
    return { ...formElementResult, ...virtualResult };
  }
  /**
   * @public add virtual element let you register some non standard form element into this form to activate all form helpers and methods for them
   * @param element the element you want to register
   */
  addVirtualElement<TValue, TValidationValue>(element: VirtualElement<TValue, TValidationValue>) {
    this.#virtualElements.push(element);
  }
  /**
   * will traverse all virtual inputs and return object of requested data
   * @param extractFunction 
   */
  #traverseVirtualElement<T>(extractFunction: VirtualExtractFunction<T>) {
    type ValueType = ReturnType<typeof extractFunction>;
    const result: TraverseResult<ValueType> = {};
    //make it partial so every callback function have to check for nullable properties
    for (const formElement of this.#virtualElements) {
      if (formElement.name) {
        result[formElement.name] = extractFunction(formElement);
      }
    }
    return result;
  }
  //keep dirty status from the last time check.
  #prevIsDirty = false;
  #prevValidity = this.checkValidity();
  #handleStateChanges(){
    const checkForDirty = ()=>{
      const currentIsDirty = this.isDirty;
      if(currentIsDirty !== this.#prevIsDirty){
        const event = new CustomEvent("dirty-change",{detail:{isDirty:currentIsDirty}});
        this.dispatchEvent(event);
        this.#prevIsDirty = currentIsDirty;
      }
    };
    const checkForValidity = ()=>{
      const currentValidity = this.checkValidity();
      if(currentValidity !== this.#prevValidity){
        const event = new CustomEvent("validity-change",{detail:{isValid:currentValidity}});
        this.dispatchEvent(event);
        this.#prevValidity = currentValidity;
      }
    };
    this.addEventListener("change",(e)=>{
      const changedElement = e.target as unknown as Partial<JBFormInputStandards & WithValidation> ;
      if(changedElement.isDirty !== undefined){
        //if changed element is in Dirty check league
        checkForDirty();
      }
      if(typeof changedElement.checkValidity == "function"){
        checkForValidity();
      }
    },{passive:true});
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

