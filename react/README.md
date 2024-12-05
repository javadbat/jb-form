# JBForm React

jb form react component to make jb-form easier to use

## usage
```jsx
import {JBForm} from 'jb-form/react'

<JBForm>
{/*put your form here*/}
</JBForm>

```
## get form instance

to get from instance you have 2 way:
1. with Ref props
```jsx
const formRef = useRef();
if(formRef.current){
  //do whatever you want here
  formRef.current.checkValidity()
}
return(
<JBForm ref={formRef}>
{/*put your form here*/}
</JBForm>
)

```
2. get with `useJBForm` hook.