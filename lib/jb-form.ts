import { JBCheckValidityParameter, CheckValidityAsyncResult, ExtractFunction, FormExtractFunction, FormValidationMessages, FormValidationResult, FormValidationSummary, FormValues, JBFormInputStandards, TraverseResult, ValidationValue, VirtualElementConfig, VirtualExtractFunction } from './types';
import { type WithValidation, ValidationHelper, ValidationItem } from 'jb-validation';
import { VirtualElement } from './virtual-element';
import { VirtualElementList } from './virtual-element-list';
import { SubFormList } from './sub-form-list';
export * from './types.js';
export * from './utils.js';
export {VirtualElement};
export class JBFormWebComponent extends HTMLFormElement {
  //keep original form check validity
  #formCheckValidity = this.checkValidity;
  #formReportValidity = this.reportValidity;
  #virtualElements = new VirtualElementList({ handleStateChanges: this.#handleStateChanges.bind(this) });
  #subForms = new SubFormList();
  callbacks = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    showValidationError: (message: string) => { },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    cleanValidationError: () => { },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setValidationResult: () => { }
  }
  #internals: ElementInternals;
  get validation() {
    return this.#validation;
  }
  #validation = new ValidationHelper<ValidationValue>({
    showValidationError: this.callbacks.showValidationError.bind(this),
    clearValidationError: this.callbacks.cleanValidationError.bind(this),
    getValue: this.getFormValues.bind(this),
    getValidations: this.#getInsideValidations.bind(this),
    getValueString: (value) => JSON.stringify(value),
    setValidationResult: this.callbacks.setValidationResult
  })
  get isDirty(): boolean {
    const res = this.getFormDirtyStatus();
    return Object.values(res).includes(true);
  }
  get value() {
    return this.getFormValues();
  }
  get virtualElements() {
    return {
      list: this.#virtualElements.list as ReadonlyArray<VirtualElement<any, any>>,
      dictionary: this.#virtualElements.dictionary as Readonly<Record<string, VirtualElement<any, any>>>,
      add: this.#virtualElements.add
    };
  }
  get subForms() {
    return {
      list: this.#subForms.list,
      dictionary: this.#subForms.dictionary,
    };
  }
  constructor() {
    super();
        if (typeof this.attachInternals == "function") {
      //some browser don't support attachInternals
      this.#internals = this.attachInternals();
      this.#internals.role = "form";
    }
    this.initWebComponent();
  }
  initWebComponent() {
    this.#registerEventListener();
    this.checkValidity = this.#checkValidity;
    this.reportValidity = this.#reportValidity;
    this.#initJBFormTree();
  }
  connectedCallback() {
    this.#dispatchJBFormInit();
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
    this.addEventListener("change", (e) => {
      const element = e.target as unknown as Partial<JBFormInputStandards & WithValidation>;
      this.#handleStateChanges(element);
    }, { passive: true });
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

  #getInsideValidations(): ValidationItem<ValidationValue>[] {
    return [
      {
        validator: () => {
          //TODO:it's not feasible now but try to bind for natural checkValidity when browser support it.
          for (const elem of this.elements) {
            const element = elem as unknown as WithValidation;
            if (typeof element.checkValidity == "function") {
              //it will automatically update validation result on check
              const res = element.checkValidity();
              if (res == false) {
                return element.validationMessage != "" ? element.validationMessage : false;
              }
            }
          }
          return true;
        },
        message: "form element is invalid"
      },
      {
        validator: () => {
          const invalidElement = this.#virtualElements.list.find((item) => {
            if (typeof item.validation?.checkValidity !== "function") {
              return false;
            }
            return !item.validation.checkValidity({ showError: false });
          });
          if (invalidElement == undefined) {
            return true;
          } else {
            invalidElement.validation.resultSummary.message;
          }
        },
        message: "virtual element is invalid"
      },
      {
        validator: () => {
          const invalidForm = this.#subForms.list.find((item) => {
            return !item.checkValidity();
          });
          if (invalidForm == undefined) {
            return true;
          } else {
            invalidForm.validation.resultSummary.message;
          }
        },
        message: "form element is invalid"
      }
    ];
  }
  #checkValidity(): boolean {
    //
    return this.#validation.checkValiditySync({ showError: false }).isAllValid;
  }
  #reportValidity(): boolean {
    //we dont use this.#validation because validation methods design to find first error and keep it but here we need to show every error on components 
    let isAllValid = true;
    //TODO:try to bind for natural checkValidity and do not use this methods
    for (const elem of this.elements) {
      const element = elem as unknown as WithValidation;
      if (typeof element.reportValidity == "function") {
        isAllValid = element.reportValidity() && isAllValid;
      }
    }
    const virtualResult = this.#virtualElements.list.reduce((acc, item) => {
      if (typeof item.validation?.checkValidity !== "function") {
        return acc;
      }
      return item.validation.checkValiditySync({ showError: true }) && acc;
    }, true);
    const formResult = this.#subForms.list.reduce((acc, item) => {
      return item.reportValidity() && acc;
    }, true);
    // isAllValid = isAllValid && this.#formReportValidity();
    return isAllValid && virtualResult && formResult;
  }
  #dispatchSubmitEvent(e: SubmitEvent) {
    const event = new SubmitEvent('submit', { ...e });
    this.dispatchEvent(event);
  }
  /**
   * @description this function will check all standard jb validations includes async validations virtual elements and sub forms. it have most rich validation result betweens jb-form validation results methods
   *  @public
   */
  async jbCheckValidity(params: JBCheckValidityParameter) {
    const result: CheckValidityAsyncResult = {
      isAllValid: true,
      elements: new Map(),
      virtualElements: new Map(),
      subForms:new Map()
    };
    //check for elements
    for (const elem of this.elements) {
      const element = elem as unknown as WithValidation & HTMLElement;
      if (typeof element.validation?.checkValidity == "function") {
        const res = await element.validation.checkValidity({ showError: params.showError });
        result.isAllValid = res.isAllValid && result.isAllValid;
        result.elements.set(element, res);
      }
    }
    // check for virtual elements
    for (const vElement of this.#virtualElements.list) {
      if (typeof vElement.validation?.checkValidity === "function") {
        const res = await vElement.validation.checkValidity({ showError: params.showError });
        result.isAllValid = res.isAllValid && result.isAllValid;
        result.virtualElements.set(vElement, res);
      }
    }
    //check for sub forms
    for (const subForm of this.#subForms.list) {
      const res = await subForm.jbCheckValidity(params);
      result.isAllValid = res.isAllValid && result.isAllValid;
      result.subForms.set(subForm, res);
    }
    return result;
  }
  /**
   * @description returns key value object contains validation message of named element
   * @returns @public
   */
  getValidationMessages(): FormValidationMessages {
    return this.#traverseNamedElements(
      (formElement) => formElement.validationMessage ?? null,
      (vElement) => vElement.validation?.resultSummary?.message ?? null,
      (subForm) => subForm.validation.resultSummary.message ?? null,
    );
  }
  /**
   * @description returns key value object contains validation summary result of named element
   * @returns @public
   */
  getValidationSummary(): FormValidationSummary {
    return this.#traverseNamedElements((formElement) => formElement.validation?.resultSummary ?? null,
      (vElement) => vElement.validation?.resultSummary ?? null,
      (subForm) => subForm.validation.resultSummary,
    );
  }
  /**
   * @description returns key value object contains validation summary result of named element
   * @returns @public
   */
  getValidationResult(): FormValidationResult {
    return this.#traverseNamedElements((formElement) => formElement.validation?.result ?? null,
      (vElement) => vElement.validation?.result ?? null,
      (subForm) => subForm.validation.result,
    );
  }
  /**
 * @description returns key value object contains value of named element
 * @returns @public
 */
  getFormValues<TFormValue extends FormValues = FormValues>(): TFormValue {
    return this.#traverseNamedElements((formElement) => formElement.value,
      (vElement) => typeof vElement.getValue == "function" ? vElement.getValue() : null,
      (subForm) => subForm.getFormValues(),
    ) as TFormValue;
  }
  /**
* @description returns key value object contains dirty status of named element
* @returns @public
*/
  getFormDirtyStatus(): TraverseResult<boolean> {
    return this.#traverseNamedElements((formElement) => formElement.isDirty,
      (vElement) => typeof vElement.getDirtyStatus == "function" ? vElement.getDirtyStatus() : null,
      (subForm) => subForm.isDirty,
    );
  }
  /**
* @description set value of named form input elements
* @param shouldUpdateInitialValue determine if we should also update initial value or not. pass false if you want initialValue remain untouched
*/
  setFormValues<TFormValue extends FormValues = FormValues>(value: TFormValue, shouldUpdateInitialValue = true) {
    for (const elem of this.elements) {
      const formElement = elem as unknown as Partial<WithValidation & JBFormInputStandards>;
      if (formElement.name && value[formElement.name] !== undefined) {
        formElement.value = value[formElement.name];
      }
    }
    this.#virtualElements.setValues(value);
    this.#subForms.setValues(value);
    if (shouldUpdateInitialValue) {
      this.setFormInitialValues(value, false);
    }
  }
  /**
* @description set initial value of named form input elements used for dirty field detection
*/
  setFormInitialValues<TFormValue extends FormValues = FormValues>(value: TFormValue, shouldUpdateValue = true) {
    for (const elem of this.elements) {
      const formElement = elem as unknown as Partial<WithValidation & JBFormInputStandards>;
      if (formElement.name && value[formElement.name] !== undefined) {
        formElement.initialValue = value[formElement.name];
      }
    }
    this.#virtualElements.setInitialValues(value);
    this.#subForms.setInitialValues(value);
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

  #traverseNamedElements<T>(extractFunction: ExtractFunction<T>, virtualExtractFunction: VirtualExtractFunction<T>, formExtractFunction: FormExtractFunction<T>): TraverseResult<T> {
    const formElementResult = this.#traverseFormNamedElements(extractFunction);
    const virtualResult = this.#virtualElements.traverse(virtualExtractFunction);
    const subFormResult = this.#subForms.traverse(formExtractFunction);
    return { ...formElementResult, ...virtualResult, ...subFormResult };
  }

  //keep dirty status from the last time check.
  #prevIsDirty = false;
  #prevValidity = this.checkValidity();
  #handleStateChanges(element: Partial<JBFormInputStandards & WithValidation> | VirtualElement<any, any>) {
    const checkForDirty = () => {
      const currentIsDirty = this.isDirty;
      if (currentIsDirty !== this.#prevIsDirty) {
        //this event should not bubble because parent form event bind should not capture sub form event due to isDirty  may be set false in sub form but still true in parent
        const event = new CustomEvent("dirty-change", { bubbles: false, cancelable: false, composed: true, detail: { isDirty: currentIsDirty } });
        this.dispatchEvent(event);
        this.#prevIsDirty = currentIsDirty;
      }
    };
    const checkForValidity = () => {
      const currentValidity = this.checkValidity();
      if (currentValidity !== this.#prevValidity) {
        //this event should not bubble because parent form event bind should not capture sub form event 
        const event = new CustomEvent("validity-change", { bubbles: false, cancelable: false, composed: true, detail: { isValid: currentValidity } });
        this.dispatchEvent(event);
        this.#prevValidity = currentValidity;
      }
    };
    if (element instanceof VirtualElement) {
      //because `dirty-change` event does not bubble we must trigger form change so upper form can get new isDirty or validity value 
      this.#dispatchOnChange();
      checkForDirty();
      checkForValidity();
      return;
    } else {
      if (element.isDirty !== undefined) {
        //if changed element is in Dirty check league
        checkForDirty();
      }
      if (typeof element.checkValidity == "function") {
        checkForValidity();
      }
    }
  }
  /**
   * @description this function would find all internal jb-form elements and register them as it sub forms
   */
  #initJBFormTree() {
    this.addEventListener('init', (e) => {
      if (e.target instanceof JBFormWebComponent && e.target !== this) {
        this.#subForms.add(e.target);
      }
    });
  }
  #dispatchJBFormInit() {
    const event = new CustomEvent("init", { bubbles: true, composed: true, cancelable: false });
    this.dispatchEvent(event);
  }
  #dispatchOnChange() {
    const event = new Event("change",{bubbles:true,cancelable:false,composed:true});
    this.dispatchEvent(event);
  }
  #onAttributeChange(name: string, value: string) {
    //TODO: add attrubutes to watch
  }
}
const myElementNotExists = !customElements.get('jb-form');
if (myElementNotExists) {
  window.customElements.define('jb-form', JBFormWebComponent, { extends: 'form' });
}

