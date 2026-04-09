import { createContext, useContext, useEffect, useState, type RefObject } from "react";
import type { JBFormWebComponent } from "jb-form";

export const JBFormContext = createContext<JBFormWebComponent | null>(null);
export const JBFormProvider = JBFormContext.Provider;
export const useJBForm = (): JBFormWebComponent | null => useContext(JBFormContext);

export type useJBFormValueArgs = {
  name?: string,
  events?: string[],
  formRef?: RefObject<JBFormWebComponent | null> 
}
export type UseJBFormValueResult<TValue> = {
  value:TValue
}
/**
 * Help you get latest value of the form or form element value.
 * because jb-form is a web-component we use events to watch for value change. so if you don't get form values exactly when you need update form args array and add events that need listened to like `input`
 */
export const useJBFormValue = <TValue=unknown>(args: useJBFormValueArgs):UseJBFormValueResult<TValue> => {
  const [value, setValue] = useState<TValue>(null)
  // const defaultForm = useJBForm()
  const events = args.events ?? ["change", "form-change"];
  useEffect(() => {
    const form = args.formRef.current;
    const signal = new AbortController();
    if (form) {
      events.forEach(e => {
        form.addEventListener(e, (event) => {
          if (args.name) {
            if (args.name == (event.target as any).name) {
              setValue((event.target as any).value)
            }
          } else {
            setValue(form.value as TValue);
          }
        }, { signal: signal.signal, passive: true })
      });
    }
    return () => {
      signal.abort();
    }
  }, [args.name, events, args.formRef]);
  return { value }
}