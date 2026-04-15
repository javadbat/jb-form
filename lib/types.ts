import type { ValidationResult, ValidationResultSummary, WithValidation, ValidationHelper } from "jb-validation";
import type { JBFormWebComponent } from "./jb-form.js";
import type { VirtualElement } from "./virtual-element.js";
import type {EventTypeWithTarget} from 'jb-core';
//indicate which property is essential for element to be jb-form compatible 
export interface JBFormInputStandards<TValue = string> {
  disabled: boolean,
  required: boolean,
  /**
   * name can't be null it must return empty string "" when it's not available (it's HTML standard)
   */
  name: string,
  value: TValue,
  id?:string,
  /**
  * @description check if user change the value of component based on value provided from outside and return true if user change a initial value
  */
  readonly isDirty: boolean
  initialValue: TValue
}
export type TraverseCollection<T> = Map<string|number,T> & Map<Symbol,true>
//used inside form to turn all elements data to named object like FormValidationMessages, FormValueResult
export type TraverseResult<T> = {
  [key: string]: T | TraverseCollection<T>
}
export type FormValidationMessages = {
  [key: string]: string| null | TraverseCollection<string|null>
}
export type FormValidationSummary = {
  [key: string]: ValidationResultSummary | TraverseCollection<ValidationResultSummary|null> | null;
}
export type FormValidationResult = {
  // biome-ignore lint/suspicious/noExplicitAny: <it can get any validation value>
  [key: string]: ValidationResult<any> | TraverseCollection<ValidationResult<any> | null> | null;
}

// biome-ignore lint/suspicious/noExplicitAny: <it's a collection it can accept any value>
export type FormValues<TValue = any> = {
  //it may be object or any other type for different inputs
  [key: string]: TValue
}
export type ValidationValue = FormValues;
export type ExtractFunction<T> = (formElement: Partial<WithValidation & JBFormInputStandards>) => T;
export type FormExtractFunction<T> = (formElement: JBFormWebComponent) => T;
export type VirtualExtractFunction<T> = (formElement: VirtualElement<any, any>) => T;
export type VirtualElementConfig<TValue, TValidationValue> = {
  /**
   * @requires
   * @property name of your virtual element 
   */
  name: string,
  /**
   * @property jb-validation ValidationHelper instance. if not provided, this virtual element will not be participated in validation methods and results
   */
  validation?: ValidationHelper<TValidationValue>,
  /**
 * @property help you spot your virtual elements DOM so you could scroll to, in invalidate cases or use it any other way you see fit.
 */
  dom?: HTMLElement,
  /**
   * @property we need your component value for value oriented methods like isDirty
   */
  getValue?: () => TValue,
  /**
   * @property function that return true if your component value is changed from initialValue (write deep compare functions of value compare here)
   */
  getDirtyStatus?: () => boolean,
    /**
   * @property this callback function will be called in case of form setValue called.
   */
  setValue?: (value: TValue) => void,
      /**
   * @property this callback function will be called in case of form setInitialValue called.
   */
  setInitialValue?: (value: TValue) => void
}

export type VirtualElementCallbacks = {
  onChange: () => void
}

export type JBCheckValidityParameter = {
  /**
   * @property in case of error do you want to show it or you just want to get result. true will show error
   */
  showError: boolean
}

export type CheckValidityAsyncResult = {
  /**
   * @property result of all validations
   */
  isAllValid: boolean;
  /**
   * @property keep validation result of standard jb-validation form elements (nested elements not included)
   */
  elements: Map<HTMLElement&WithValidation, ValidationResult<any>>;
  /**
 * @property keep validation result of virtual elements (nested elements not included)
 */
  
// biome-ignore lint/suspicious/noExplicitAny: <it's a collection it can accept any value as generic >
virtualElements: Map<VirtualElement<any, any>, ValidationResult<any>>;
  /**
* @property keep validation result of sub forms and sub forms (you can access nested elements from here) 
*/
  subForms: Map<JBFormWebComponent, CheckValidityAsyncResult>;
}

export type JBFormEventType<TEvent> = EventTypeWithTarget<TEvent,JBFormWebComponent>;