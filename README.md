# jb-form
jb design system special form with special feature

## setup & install

run following command like any other npm packages

```command
npm i jb-form
```
import component script into your project

```js
import 'jb-form'
```

## usage

jb-form is a little different form of web-component called `Customized built-in elements`  that mean it just extend the feature of `form` and change some of them so you have all `form` feature with a extra feature `jb-form` added.

```html
<form>
  <jb-input name="name" />
  <jb-button type="submit">
</form>
```

and for more feature just add `is="jb-form"`

```html
<form is="jb-form">
  <jb-input name="name" />
  <jb-button type="submit">
</form>
```

## validation

all jb design system form elements are supports form validation with [jb-validation](https://github.com/javadbat/jb-validation) way of providing them. you can check it by `checkValidity` or `reportValidity` function of form to see is input have a valid value or not.    
if you use `jb-form` you can also show validation message of each error.

```html
<form is="jb-form">
  <jb-input name="name" required/>
  <jb-number-input name="age" required/>
  <jb-button type="submit">
</form>
```
```js
// isFormValid1 will be true if use fill all fields and false if one of them is empty
const isFormValid1 = document.querySelector('form').checkValidity();
// isFormValid2 will be true if use fill all fields and false if one of them is empty
// and it shows message below the inputs if they were empty
const isFormValid2 = document.querySelector('form').reportValidity();
```
## get more detailed validation report

one of the `jb-form` extended feature is a more detailed validation report than standard form element.
here is the functions:

```js
const form = document.querySelector('form');
// will return key value object of *named* element with error message ('' if element value is valid) works for all form standards element like HTML input
form.getValidationMessages();
// will return key value object of *named* element with error summary (null if element not implement jb-validation standard) works only for custom element that implement jb-validation standard
form.getValidationSummary();
// will return key value object of *named* element with error full report (null if element not implement jb-validation standard) works only for custom element that implement jb-validation standards
form.getValidationResult();
```
all jb design system support [jb-validation](https://github.com/javadbat/jb-validation) so dont worry about them if you want to use `getValidationSummary` or `getValidationResult`.    
just check that your element must have `name` attribute in its HTML `<jb-input name="something"/>`.
if you have a form element that dont support [jb-validation](https://github.com/javadbat/jb-validation) you can easily create a custom element that implements `WithValidation<ValidationValue>` interface. for more detail read [jb-validation](https://github.com/javadbat/jb-validation) doc.

## value control

jb-design system components support some methods to manage values and state of themselves. things such as `isDirty` , `initialValue` are some of them.    
jb-form provide you some methods that let you manage them easier. here are the methods:
```js
//return all named element values in a single object
form.getFormValues()
// return a object of named elements with their dirty status(read doc below the code for more information)
form.getFormDirtyStatus();
const formValue = {
  name:"joe",
  age:10
}
// set value of form elements.(elements match by their name)
form.setFormValues(formValue);
//if second argument is true or not provided setFormValues will also update initial value and if set to false it just update value
form.setFormValues(formValue,false);
// set initial value of form elements.(initial value is used to compare with value and set isDirty flag)
form.setFormInitialValues(formValue)
//if second argument is true or not provided setFormInitialValues will also update value and if set to false it just update value
form.setFormInitialValues(formValue,false)
```
as you can see all elements have 2 values fields `value` & `initialValue`. value is a normal value of the fields but initial value is used just to be compared with value and set `isDirty` field.
`isDirty` will be true if user change the input value from a provided initial value.



