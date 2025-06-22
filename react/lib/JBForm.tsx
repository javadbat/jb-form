'use client';
import React, { useEffect, useImperativeHandle } from 'react';
import 'jb-form';
// eslint-disable-next-line no-duplicate-imports
import { type JBFormWebComponent } from 'jb-form';
import { useEvents,EventProps } from './events-hook.js';
import { JBFormProvider } from './context.js';

export * from './context.js';

export type Props = React.HTMLProps<JBFormWebComponent> & EventProps;

export * from './context.js';

export const JBForm = React.forwardRef((props: Props, ref: React.ForwardedRef<JBFormWebComponent | undefined>) => {
  const { onSubmit, name, onValidityChange, onDirtyChange, children, ...formProps } = props;
  const element = React.useRef<JBFormWebComponent>(null);
  useImperativeHandle(
    ref,
    () => (element.current ?? undefined),
    [element],
  );

  useEvents(element,{onSubmit, onValidityChange, onDirtyChange});
  useEffect(()=>{
    if(element.current){
      if(name){
        element.current.setAttribute('name',name)
      }else{
        element.current.removeAttribute('name')
      }
    }
  },[element.current, name])
  return (
    <form is="jb-form" ref={element} {...formProps}>
      <JBFormProvider value={element.current??null}>
        {
          children
        }
      </JBFormProvider>
    </form>
  );
});

JBForm.displayName = "JBForm";
