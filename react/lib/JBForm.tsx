import React, { useCallback, useImperativeHandle } from 'react';
import {type JBFormWebComponent} from 'jb-form';
import { useBindEvent } from '../../../../common/hooks/use-event.js';
type Props = React.HTMLProps<HTMLFormElement> & {
 onSubmit?:(e:SubmitEvent)=>void
 onDirtyChange?:(e:CustomEvent)=>void
 onValidityChange?:(e:CustomEvent)=>void
}
export const JBForm = React.forwardRef((props:Props, ref:React.ForwardedRef<JBFormWebComponent|undefined>)=> {
  const {onSubmit,onValidityChange,onDirtyChange, children, ...formProps} = props;
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
  const onValidityChangeFunc = useCallback((e:CustomEvent)=>{
    if(typeof onValidityChange == "function"){
      onValidityChangeFunc(e);
    }
  },[onSubmit]);
  const onDirtyChangeFunc = useCallback((e:CustomEvent)=>{
    if(typeof onDirtyChange == "function"){
      onDirtyChange(e);
    }
  },[onSubmit]);
  useBindEvent(element,"submit",onSubmitFunc);
  useBindEvent(element,"dirty-change",onDirtyChangeFunc);
  useBindEvent(element,"validity-change",onValidityChangeFunc);
  return (
    <form ref={element} is="jb-form" {...formProps}>
      {
        children
      }
    </form>
  );
});
JBForm.displayName = "JBForm";