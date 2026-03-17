import React, { useEffect, useRef, Fragment } from "react";
import { useJBForm } from "./context.js"
import type { VirtualElement } from "jb-form"
export type Props<TValue> = {
  name: string,
  value?: TValue,
  setValue?: (value: TValue) => void
}
/**
 * Will provide value to JBForm Directly for easier multi form value provider
 */
export function JBFormValue<TValue = any>({ value, name, setValue }: Props<TValue>) {
  const valueRef = useRef<TValue>(null)
  const form = useJBForm();
  
  useEffect(() => {
    let vElement: VirtualElement<TValue, unknown> | null = null;
    if (form?.virtualElements && name) {
      vElement = form.virtualElements.add({
        name: name,
        getValue: () => valueRef.current,
        setValue: (value) => {
          valueRef.current = value;
          setValue?.(value);
        }
      })
    }
    return () => form?.virtualElements.remove({ virtualElement: vElement })
  }, [form, name]);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);
  // biome-ignore lint/complexity/noUselessFragments: <we have no view here>
  return (<Fragment></Fragment>)
}