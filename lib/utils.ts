import type { WithValidation } from "jb-validation";
import type { CheckValidityAsyncResult, JBFormInputStandards, TraverseResult } from "./types";
import { TraverseCollection } from "./collections";

/**
 * get the jbCheckValidity method result and extract invalid elements dom, you can scroll to the dom or play some animation for dom
 * @param result result of jbCheckValidity method
 * @returns list of HTMLElement of invalid doms
 */
export function getInvalidElements(result: CheckValidityAsyncResult): HTMLElement[] {
  const invalidElements: HTMLElement[] = [];
  for (const item of result.elements.entries()) {
    if (!item[1].isAllValid) {
      invalidElements.push(item[0]);
    }
  }
  for (const item of result.virtualElements.entries()) {
    if (!item[1].isAllValid) {
      item[0].dom && invalidElements.push(item[0].dom);
    }
  }
  for (const item of result.subForms.entries()) {
    if (!item[1].isAllValid) {
      invalidElements.push(...getInvalidElements(item[1]));
    }
  }
  return invalidElements;
}

/**
 * when there is multi element with the same name in traverse we use Map for that collection type
 */
export function handleTraverseCollection<ValueType>(result: TraverseResult<ValueType>, formElement: { name?: string, id?: string }, res: ValueType) {
  if(!formElement.name){
    return
  }
  if (!(result[formElement.name] instanceof TraverseCollection)) {
    // when current value is not collection yet and it need to be a collection we transform it to collection first
    const key = formElement.id ? formElement.id : 0;
    result[formElement.name] = new TraverseCollection<ValueType>().set(key, result[formElement.name] as ValueType)
  }
  // then we add our new item
  const mapResult = (result[formElement.name] as TraverseCollection<ValueType>);
  const key = formElement.id ? formElement.id : mapResult.size;
  mapResult.set(key, res);

}
export function handleCollectionSet(valueCollection: TraverseCollection<unknown>, namedFormElements: Partial<WithValidation<any> & JBFormInputStandards<unknown>>[], formElement: Partial<WithValidation<any> & JBFormInputStandards<unknown>>) {

  const elements = namedFormElements.filter(x => x.name == formElement.name);
  //then we assigned all targeted (by id) values
  elements.forEach((x, i) => {
    if (x.id && valueCollection.has(x.id)) {
      // assign value that match id then delete from remaining list
      x.value = valueCollection.get(x.id)
      dispatchFormChangeEvent(x)
      valueCollection.delete(x.id)
      elements.splice(i, 1);
    }
  })
  //then we assigned non targeted value
  const remainValues = Array.from(valueCollection.values());
  // remain what left
  elements.forEach((x) => {
    x.value = remainValues.shift();
    dispatchFormChangeEvent(x)
  }
  )
}

/**
 * when we update form element value with a form value setter we also dispatch this event
 */
export function dispatchFormChangeEvent(formElement: unknown) {
  if (formElement instanceof HTMLElement) {
    const event = new Event("form-change", { bubbles: true, composed: true, cancelable: false });
    formElement.dispatchEvent(event);
  }
}