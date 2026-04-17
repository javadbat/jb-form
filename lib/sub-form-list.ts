import { TraverseCollection } from "./collections";
import { type FormExtractFunction, type FormValues, handleCollectionSet, handleTraverseCollection, type JBFormWebComponent, type TraverseResult } from "./jb-form";

export class SubFormList {
  #list: JBFormWebComponent[] = [];
  #dictionary: Record<string, JBFormWebComponent | JBFormWebComponent[]> = {};
  get list() {
    return [...this.#list] as const;
  }
  get dictionary() {
    return Object.freeze({ ...this.#dictionary });
  }
  setValues<TFormValue extends FormValues = FormValues>(value: TFormValue) {
    const namedSubForms = this.#list.filter(x => x.name && Object.getOwnPropertyNames(value).includes(x.name))
    for (const subForm of namedSubForms) {
      if (subForm.name && value[subForm.name] !== undefined) {
        if (value[subForm.name] instanceof TraverseCollection) {
          //when we face multiple values element name
          //first we clone both values & form elements then remove found element and value from cloned collection.
          const valueCollection = new TraverseCollection((value[subForm.name]));
          handleCollectionSet(valueCollection, namedSubForms, subForm)
        } else {
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
  #onSubFormAttributeChange = (mutations: MutationRecord[], _observer: MutationObserver) => {
    mutations.forEach((m) => {
      if (m.type == "attributes" && m.attributeName == "name") {
        if (m.oldValue) {
          this.#removeFromDictionary(m.oldValue, m.target as JBFormWebComponent)
        }
        this.#addToDictionary((m.target as JBFormWebComponent).name, m.target as JBFormWebComponent)
      }
    })
  }
  add(form: JBFormWebComponent) {
    if (this.#list.includes(form)) {
      return;
    }
    this.#list.push(form);
    if (form.name) {
      this.#addToDictionary(form.name, form);
    }
    // we observe sub form to know when name changed
    const observer = new MutationObserver(this.#onSubFormAttributeChange)
    observer.observe(form, { attributes: true, attributeFilter: ["name"], attributeOldValue: true, subtree: false, childList: false });
    form.addEventListener('disconnect', () => {
      this.remove(form);
      observer.disconnect
    }, { once: true, passive: true });
  }
  remove(form: JBFormWebComponent) {
    const index = this.#list.findIndex(x => x == form);
    if (index !== -1) {
      this.#list.splice(index, 1);
    }
    this.#removeFromDictionary(form.name, form)

  }
  #addToDictionary(name: string, form: JBFormWebComponent) {
    if (this.#dictionary[name]) {
      this.#dictionary[name] = [this.#dictionary[name], form].flat(1);
    } else {
      this.#dictionary[name] = form;
    }
  }
  #removeFromDictionary(name: string, form: JBFormWebComponent) {
    if (Array.isArray(this.#dictionary[name])) {
      const index = this.#dictionary[name].findIndex((x: JBFormWebComponent) => x == form);
      if (index !== -1) {
        this.#dictionary[name].splice(index, 1)
      }
    } else {
      delete this.#dictionary[name];
    }
  }
}