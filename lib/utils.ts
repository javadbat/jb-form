import type { WithValidation } from "jb-validation";
import type { CheckValidityAsyncResult, JBFormInputStandards, TraverseCollection, TraverseResult } from "./types";

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
 * @public this symbol will be putted in Map value to indicate that value is gathered from multiple fields and it's not a array value
 */
export const ValueCollectionSymbol = Symbol("ValueCollectionSymbol");

/**
 * when there is multi element with the same name in traverse we use Map for that collection type
 */
export function handleTraverseCollection<ValueType>(result: TraverseResult<ValueType>, formElement: { name?: string, id?: string }, res: ValueType) {
  if (!(result[formElement.name] instanceof Map && (result[formElement.name] as TraverseCollection<ValueType>).has(ValueCollectionSymbol))) {
    // when current value is not collection yet and it need to be a collection we transform it to collection first
    const key = formElement.id ? formElement.id : 1;
    result[formElement.name] = new Map().set(ValueCollectionSymbol, true).set(key, result[formElement.name] as ValueType)
  }
  // then we add our new item
  const mapResult = (result[formElement.name] as TraverseCollection<ValueType>);
  const key = formElement.id ? formElement.id : mapResult.size;
  mapResult.set(key, res);

}
export function handleCollectionSet(valueCollection: TraverseCollection<unknown>, namedFormElements: Partial<WithValidation<any> & JBFormInputStandards<unknown>>[], formElement: Partial<WithValidation<any> & JBFormInputStandards<unknown>>) {

  valueCollection.delete(ValueCollectionSymbol);
  const elements = namedFormElements.filter(x => x.name == formElement.name);
  //then we assigned all targeted (by id) values
  elements.forEach((x, i) => {
    if (x.id && valueCollection.has(x.id)) {
      // assign value that match id then delete from remaining list
      x.value = valueCollection.get(x.id)
      valueCollection.delete(x.id)
      elements.splice(i, 1);
    }
  })
  //then we assigned non targeted value
  const remainValues = Array.from(valueCollection.values());
  // remain what left
  elements.forEach((x) => {
    x.value = remainValues.shift();
  }
  )
}