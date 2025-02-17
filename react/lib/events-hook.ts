import { useEvent } from "jb-core/react";
import { RefObject } from "react";
import type {JBFormEventType, JBFormWebComponent} from 'jb-form';

export type EventProps = {
  /**
   * when component loaded, in most cases component is already loaded before react mount so you dont need this but if you load web-component dynamically with lazy load it will be called after react mount
   */
  onLoad?: (e: JBFormEventType<CustomEvent>) => void,
    /**
   * when all property set and ready to use, in most cases component is already loaded before react mount so you dont need this but if you load web-component dynamically with lazy load it will be called after react mount
   */
  onInit?: (e: JBFormEventType<CustomEvent>) => void,
  /**
   * when value changed to invalid value
   */
  onValidityChange?: (e: JBFormEventType<CustomEvent>) => void,
  /**
   * when form dirty status change(user change value in form), dirty->clean | clean->dirty
   */
  onDirtyChange?: (e: JBFormEventType<CustomEvent>) => void,
  onSubmit?: (e: JBFormEventType<SubmitEvent>) => void,
}
export function useEvents(element:RefObject<JBFormWebComponent>,props:EventProps){
  useEvent(element, 'load', props.onLoad, true);
  useEvent(element, 'init', props.onInit, true);
  useEvent(element, "validity-change", props.onValidityChange);
  useEvent(element, "dirty-change", props.onDirtyChange);
  useEvent(element, "submit", props.onSubmit);
  
}