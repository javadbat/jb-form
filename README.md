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





