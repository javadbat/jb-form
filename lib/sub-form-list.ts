import { FormExtractFunction, FormValues, JBFormWebComponent, TraverseResult } from "./jb-form";

export class SubFormList {
  #list:JBFormWebComponent[]= [];
  #dictionary:Record<string,JBFormWebComponent> = {};
  get list() {
    return [...this.#list] as const;
  }
  get dictionary(){
    return Object.freeze({...this.#dictionary});
  }
  setValues<TFormValue extends FormValues = FormValues>(value: TFormValue){
    for (const subForm of this.#list) {
      if (subForm.name && value[subForm.name] !== undefined) {
        subForm.setFormValues(value[subForm.name],false);
      }
    }
  }
  setInitialValues<TFormValue extends FormValues = FormValues>(value: TFormValue){
    for (const subForm of this.#list) {
      if (subForm.name && value[subForm.name] !== undefined) {
        subForm.setFormInitialValues(value[subForm.name],false);
      }
    }
  }
  traverse<T>(extractFunction: FormExtractFunction<T>): TraverseResult<T> {
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
  add(form:JBFormWebComponent){
    if(this.#list.includes(form)){
      return;
    }
    this.#list.push(form);
    if(form.name){
      this.#dictionary[form.name] = form;
    }
  }
}