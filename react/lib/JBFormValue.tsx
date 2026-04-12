import React, { useEffect, useRef, Fragment, type ReactNode, useState } from "react";
import { useJBForm } from "./context.js"
import type { VirtualElement } from "jb-form"
export type Props<TValue> = {
  name: string,
  value?: TValue,
  /**
   * when this virtual value changes this callback called and new Value provided
   * @param value 
   */
  onChange?: (value: TValue) => void,
  /**
   * render value base on your need
   * @param value 
   * @returns 
   */
  children?:(value:TValue)=>ReactNode
}
/**
 * Easiest way to register Virtual value to the form, Will provide value to JBForm Directly for easier multi form value provider
 */
export function JBFormValue<TValue = unknown>({ value, name, onChange,children }: Props<TValue>) {
  const valueRef = useRef<TValue>(null);
  // update when value ref changes
  const [valueState, setValueState] = useState<TValue>(null);
  const form = useJBForm();
  
  useEffect(() => {
    let vElement: VirtualElement<TValue, unknown> | null = null;
    if (form?.virtualElements && name) {
      vElement = form.virtualElements.add({
        name: name,
        getValue: () => valueRef.current,
        setValue: (value) => {
          valueRef.current = value;
          onChange?.(value);
        }
      })
    }
    return () => form?.virtualElements.remove({ virtualElement: vElement })
  }, [form, name, onChange]);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: <valid>
    useEffect(()=>{
    setValueState(valueRef.current)
  },[valueRef.current])
  // biome-ignore lint/complexity/noUselessFragments: <we have no view here>
  return (typeof children == "function"? children(valueState) :<Fragment></Fragment>)
}