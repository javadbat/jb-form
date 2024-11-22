import type { ValidationResult, ValidationResultSummary, WithValidation, ValidationHelper } from "jb-validation";
import { type JBFormWebComponent } from "./jb-form";
import { type VirtualElement } from "./virtual-element";

//indicate which property is essential for element to be jb-form compatible 
export interface JBFormInputStandards<TValue=string> {
  disabled:boolean,
  required:boolean,
  name:string,
  value: TValue,
  /**
  * @description check if user change the value of component based on value provided from outside and return true if user change a initial value
  */
  readonly isDirty:boolean
  initialValue:TValue
}
//used inside form to turn all elements data to named object like FormValidationMessages, FormValueResult
export type TraverseResult<T> = {
  [key:string]:T
}
export type FormValidationMessages = {
  [key:string]:string
}
export type FormValidationSummary = {
  [key:string]:ValidationResultSummary | null;
}
export type FormValidationResult = {
  [key:string]:ValidationResult<any> | null;
}
export type FormValues<TValue=any> = {
  //it may be object or any other type for different inputs
  [key:string]: TValue
}
export type ValidationValue = FormValues;
export type ExtractFunction<T> = (formElement: Partial<WithValidation & JBFormInputStandards>)=>T;
export type FormExtractFunction<T> = (formElement: JBFormWebComponent)=>T;
export type VirtualExtractFunction<T> = (formElement: VirtualElement<any,any>)=>T;
export type VirtualElementConfig<TValue,TValidationValue> = {
  name:string,
  validation?:ValidationHelper<TValidationValue>,
  getValue?:()=>TValue,
  getDirtyStatus?:()=>boolean,
  setValue?:(value:TValue)=>void
  setInitialValue?:(value:TValue)=>void
}
export type VirtualElementCallbacks = {
  onChange:()=>void
}