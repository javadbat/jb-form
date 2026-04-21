'use client';
import React, { useEffect, useImperativeHandle, useState, type PropsWithChildren } from 'react';
import 'jb-form';
import type { JBFormWebComponent } from 'jb-form';
import { useEvents,type EventProps } from './events-hook.js';
import { JBFormProvider } from './context.js';
import type { JBElementStandardProps } from 'jb-core/react';
import "./module-declaration.js";
export * from './context.js';
export {JBFormValue, type Props as JBFormValueProps} from './JBFormValue.js'
type JBFormProps =  PropsWithChildren<EventProps> & {
  name?:string,
  ref?: React.ForwardedRef<JBFormWebComponent | undefined>,
}
export type Props = JBElementStandardProps<JBFormWebComponent, keyof JBFormProps> & JBFormProps;

export * from './context.js';

export function JBForm(props: Props) {
  const element = React.useRef<JBFormWebComponent>(null);
  
  const { ref, onSubmit, onValidityChange, onDirtyChange, onInit, onLoad, onChange, children, ...formProps } = props;
  /** we need re-render after ref assignment  */
  const [_,setRefChange] = useState<number>(0);

  useImperativeHandle(
    ref,
    () => (element.current ?? undefined),
    [element]
  );

  useEffect(()=>{
    setRefChange(s=>s+1);
  },[element.current])
  
  useEvents(element,{onSubmit, onValidityChange, onDirtyChange,onInit,onLoad,onChange});
  return (
    <jb-form ref={element} {...formProps}>
      <JBFormProvider value={element.current}>
        {
          children
        }
      </JBFormProvider>
    </jb-form>
  );
};

JBForm.displayName = "JBForm";
