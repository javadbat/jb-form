import React, { useCallback, useImperativeHandle } from 'react';
import {JBFormWebComponent} from 'jb-form';
import { useBindEvent } from '../../../../common/hooks/use-event.js';
type Props = React.HTMLProps<HTMLFormElement> & {
 onSubmit:(e:SubmitEvent)=>void
}
export const JBForm = React.forwardRef((props:Props, ref:React.ForwardedRef<JBFormWebComponent|undefined>)=> {
  const {onSubmit, children, ...formProps} = props;
  const element = React.useRef<JBFormWebComponent>(null);
  useImperativeHandle(
    ref,
    () => (element.current??undefined),
    [element],
  );
  const onSubmitFunc = useCallback((e:SubmitEvent)=>{
    if(typeof onSubmit == "function"){
      onSubmit(e);
    }
  },[onSubmit]);
  useBindEvent(element,"submit",onSubmitFunc);
  return (
    <form is="jb-form" {...formProps}>
      {
        children
      }
    </form>
  );
});
JBForm.displayName = "JBForm";