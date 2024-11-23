import { FormValues, TraverseResult, VirtualElementConfig, VirtualExtractFunction } from "./types";
import { VirtualElement } from "./virtual-element";

type VirtualElementListCallbacks = {
  handleStateChanges: (vElement: VirtualElement<any, any>) => void
}
export class VirtualElementList {
  #list: VirtualElement<any, any>[] = [];
  #dictionary: Record<string,VirtualElement<any,any>> = {}
  #callbacks: VirtualElementListCallbacks;
  constructor(callbacks: VirtualElementListCallbacks) {
    this.#callbacks = callbacks;
  }
  get list() {
    return [...this.#list] as const;
  }
  get dictionary(){
    return Object.freeze(this.#dictionary);
  }
  setValues<TFormValue extends FormValues = FormValues>(value: TFormValue) {
    for (const vElem of this.#list) {
      if (vElem.name && value[vElem.name] !== undefined && typeof vElem.setValue == "function") {
        vElem.setValue(value[vElem.name]);
      }
    }
  }
  setInitialValues<TFormValue extends FormValues = FormValues>(value: TFormValue) {
    for (const vElem of this.#list) {
      if (vElem.name && value[vElem.name] !== undefined && typeof vElem.setInitialValue == "function") {
        vElem.setInitialValue(value[vElem.name]);
      }
    }
  }
  /**
 * @public add virtual element let you register some non standard form element into this form to activate all form helpers and methods for them
 * @param element the element you want to register
 */
  add<TValue, TValidationValue>(config: VirtualElementConfig<TValue, TValidationValue>) {
    const VElement = new VirtualElement(config);
    VElement.attachCallbacks({ onChange: () => this.#callbacks.handleStateChanges(VElement) });
    this.#list.push(VElement);
    this.#dictionary[VElement.name] = VElement;
    return VElement;
  }
  /**
 * will traverse all virtual inputs and return object of requested data
 * @param extractFunction 
 */
  traverse<T>(extractFunction: VirtualExtractFunction<T>) {
    type ValueType = ReturnType<typeof extractFunction>;
    const result: TraverseResult<ValueType> = {};
    //make it partial so every callback function have to check for nullable properties
    for (const formElement of this.#list) {
      if (formElement.name) {
        result[formElement.name] = extractFunction(formElement);
      }
    }
    return result;
  }
}