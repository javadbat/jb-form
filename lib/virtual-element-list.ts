import { TraverseCollection } from "./collections";
import type {FormValues, TraverseResult, VirtualElementConfig, VirtualExtractFunction } from "./types";
import { handleCollectionSet, handleTraverseCollection } from "./utils";
import { VirtualElement } from "./virtual-element";

type VirtualElementListCallbacks = {
  handleStateChanges: (vElement: VirtualElement<any, any>) => void
}
export class VirtualElementList {
  #list: VirtualElement<any, any>[] = [];
  #dictionary: Record<string, VirtualElement<any, any>> = {}
  #callbacks: VirtualElementListCallbacks;
  constructor(callbacks: VirtualElementListCallbacks) {
    this.#callbacks = callbacks;
  }
  get list() {
    return [...this.#list] as const;
  }
  get dictionary() {
    return this.#dictionary;
  }
  setValues<TFormValue extends FormValues = FormValues>(value: TFormValue) {
    const namedVElements = this.#list.filter(x => x.name && Object.getOwnPropertyNames(value).includes(x.name))
    for (const vElem of namedVElements) {
      if (value[vElem.name] !== undefined && typeof vElem.setValue == "function") {
        if (value[vElem.name] instanceof TraverseCollection && value[vElem.name]) {
          //when we face multiple values element name
          //first we clone both values & form elements then remove found element and value from cloned collection.
          const valueCollection = new Map((value[vElem.name])) as TraverseCollection<unknown>;
          handleCollectionSet(valueCollection, namedVElements, vElem)
        } else {
          vElem.setValue(value[vElem.name]);
        }

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
  add = <TValue, TValidationValue>(config: VirtualElementConfig<TValue, TValidationValue>) => {
    const VElement = new VirtualElement(config);
    VElement.attachCallbacks({ onChange: () => this.#callbacks.handleStateChanges(VElement) });
    this.#list.push(VElement);
    this.#dictionary[VElement.name] = VElement;
    return VElement;
  }
  /**
 * @public remove virtual element from form
 * @param virtualElement the element you want to remove
 */
  remove = <TValue, TValidationValue>({ virtualElement }: { virtualElement: VirtualElement<TValue, TValidationValue> }) => {
    const index = this.#list.findIndex(x => x == virtualElement);
    if (index !== -1) {
      this.#list.splice(index, 1);
    }
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
        const res = extractFunction(formElement)
        if (result[formElement.name] !== undefined) {
          //handle traverse result for elements with the same name (create a map for them)
          handleTraverseCollection(result, formElement, res);
        } else {
          result[formElement.name] = res;
        }
      }
    }
    return result;
  }

}