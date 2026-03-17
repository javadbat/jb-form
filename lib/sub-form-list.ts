import { type FormExtractFunction, type FormValues, handleCollectionSet, handleTraverseCollection, type JBFormWebComponent, type TraverseResult, ValueCollectionSymbol, type TraverseCollection } from "./jb-form";

export class SubFormList {
  #list: JBFormWebComponent[] = [];
  #dictionary: Record<string, JBFormWebComponent> = {};
  get list() {
    return [...this.#list] as const;
  }
  get dictionary() {
    return Object.freeze({ ...this.#dictionary });
  }
  setValues<TFormValue extends FormValues = FormValues>(value: TFormValue) {
    const namedSubForms = this.#list.filter(x=> x.name && Object.getOwnPropertyNames(value).includes(x.name))
    for (const subForm of namedSubForms) {
      if (subForm.name && value[subForm.name] !== undefined) {
        if (value[subForm.name] instanceof Map && (value[subForm.name] as TraverseCollection<unknown>).has(ValueCollectionSymbol)) {
          //when we face multiple values element name
          //first we clone both values & form elements then remove found element and value from cloned collection.
          const valueCollection = new Map((value[subForm.name])) as TraverseCollection<unknown>;
          handleCollectionSet(valueCollection, namedSubForms, subForm)
        }else{
          subForm.setFormValues(value[subForm.name], false);
        }
      }
    }
  }
  setInitialValues<TFormValue extends FormValues = FormValues>(value: TFormValue) {
    for (const subForm of this.#list) {
      if (subForm.name && value[subForm.name] !== undefined) {
        subForm.setFormInitialValues(value[subForm.name], false);
      }
    }
  }
  traverse<T>(extractFunction: FormExtractFunction<T>): TraverseResult<T> {
    type ValueType = ReturnType<typeof extractFunction>;
    const result: TraverseResult<ValueType> = {};
    //make it partial so every callback function have to check for nullable properties
    for (const formElement of this.#list) {
      if (formElement.name) {
        //resulted extraction
        const res = extractFunction(formElement);
        if (result[formElement.name] !== undefined) {
          // if we have the form with the same name in the result 
          handleTraverseCollection(result, formElement, res);
        } else {
          result[formElement.name] = res;
        }
      }
    }
    return result;
  }
  add(form: JBFormWebComponent) {
    if (this.#list.includes(form)) {
      return;
    }
    this.#list.push(form);
    if (form.name) {
      this.#dictionary[form.name] = form;
    }
  }
}