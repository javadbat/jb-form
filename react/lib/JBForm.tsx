import React, { useImperativeHandle } from 'react';
import 'jb-form';
// eslint-disable-next-line no-duplicate-imports
import { type JBFormWebComponent } from 'jb-form';
import { useEvents,EventProps } from './events-hook.js';
import { JBFormProvider } from './context.js';

export * from './context.js';

type Props = React.HTMLProps<HTMLFormElement> & EventProps
export * from './context.js';
export const JBForm = React.forwardRef((props: Props, ref: React.ForwardedRef<JBFormWebComponent | undefined>) => {
  const { onSubmit, onValidityChange, onDirtyChange, children, ...formProps } = props;
  const element = React.useRef<JBFormWebComponent>(null);
  useImperativeHandle(
    ref,
    () => (element.current ?? undefined),
    [element],
  );

  useEvents(element,props);

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
