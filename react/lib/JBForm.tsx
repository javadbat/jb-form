'use client';
import React, { useEffect, useImperativeHandle, type PropsWithChildren } from 'react';
import 'jb-form';
// eslint-disable-next-line no-duplicate-imports
import { type JBFormWebComponent } from 'jb-form';
import { useEvents,EventProps } from './events-hook.js';
import { JBFormProvider } from './context.js';
import type { JBElementStandardProps } from 'jb-core/react';

export * from './context.js';

type JBFormProps =  PropsWithChildren<EventProps> & {
  name?:string
}
export type Props = JBElementStandardProps<JBFormWebComponent, keyof JBFormProps> & JBFormProps;

export * from './context.js';

export const JBForm = React.forwardRef((props: Props, ref: React.ForwardedRef<JBFormWebComponent | undefined>) => {
  const { onSubmit, name, onValidityChange, onDirtyChange, onInit, onLoad, children, ...formProps } = props;
  const element = React.useRef<JBFormWebComponent>(null);
  useImperativeHandle(
    ref,
    () => (element.current ?? undefined),
    [element],
  );

  useEvents(element,{onSubmit, onValidityChange, onDirtyChange,onInit,onLoad,});
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
