# JBForm React

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/jb-form)
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://raw.githubusercontent.com/javadbat/jb-form/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/jb-form-react)](https://www.npmjs.com/package/jb-form-react)
![GitHub Created At](https://img.shields.io/github/created-at/javadbat/jb-form)

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

```ts
const form = useJBForm();
```

## Get form value in react with Hooks

syncing form value with react states are a challenging job. some times we have complex forms that rendering one part is depend on other parts.
here we develop a hook that listen to changes event of form value and update states base on latest value

```ts
  // get all forms value
  const formValues = useJBFormValue({formRef:ref});
  // by passing name name you get specific form elements value 
  const {value:bookName} = useJBFormValue<string>({formRef:ref, name:"bookName"});
```
