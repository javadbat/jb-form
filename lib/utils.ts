import type { CheckValidityAsyncResult } from "./types";

/**
 * get the jbCheckValidity method result and extract invalid elements dom, you can scroll to the dom or play some animation for dom
 * @param result result of jbCheckValidity method
 * @returns list of HTMLElement of invalid doms
 */
export function getInvalidElements(result:CheckValidityAsyncResult):HTMLElement[]{
  const invalidElements:HTMLElement[] = [];
  for (let item of result.elements.entries()){
    if(!item[1].isAllValid){
      invalidElements.push(item[0]);
    }
  }
  for (let item of result.virtualElements.entries()){
    if(!item[1].isAllValid){
      item[0].dom && invalidElements.push(item[0].dom);
    }
  }
    for (let item of result.subForms.entries()){
    if(!item[1].isAllValid){
      invalidElements.push(...getInvalidElements(item[1]));
    }
  }
  return invalidElements;
}