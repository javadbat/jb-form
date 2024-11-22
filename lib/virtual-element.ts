import { ValidationHelper } from "jb-validation";
import { VirtualElementCallbacks, VirtualElementConfig } from "./types";

export class VirtualElement <TValue, TValidationValue> {
  name:string;
  validation?:ValidationHelper<TValidationValue>;
  getValue?:()=>TValue;
  getDirtyStatus?:()=>boolean;
  setValue?:(value:TValue)=>void;
  setInitialValue?:(value:TValue)=>void;
  #callbacks:{
    onChange:()=>void
  }
  constructor(config:VirtualElementConfig<TValue, TValidationValue>){
    this.name = config.name;
    this.validation = config.validation;
    this.getDirtyStatus = config.getDirtyStatus;
    this.getValue = config.getValue;
    this.setInitialValue = config.setInitialValue;
    this.setValue = config.setValue;
  }
  attachCallbacks(callbacks:VirtualElementCallbacks){
    this.#callbacks = callbacks;
  }
  /**
   * @public 
   * @description call this function when form value change so it can trigger dirty and validation check for form
   */
  dispatchOnChange =()=>{
    this.#callbacks.onChange();
  }
}