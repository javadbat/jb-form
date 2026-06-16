# jb-form

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/jb-form)
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://raw.githubusercontent.com/javadbat/jb-form/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/jb-form)](https://www.npmjs.com/package/jb-form)
![GitHub Created At](https://img.shields.io/github/created-at/javadbat/jb-form)

JB Design System form coordinator for validation, dirty checks, value collection, virtual fields, and nested forms.

- Validates JB form controls with one command.
- Tracks aggregate dirty state.
- Gets and sets values for named child controls.
- Supports native form controls, form-associated custom elements, virtual elements, and nested `jb-form` elements.
- Dispatches submit, dirty-change, and validity-change events.

## When to use

Use `jb-form` when a group of fields needs aggregate validation, value collection, dirty-state tracking, virtual fields, or nested form sections.

Use a native `<form>` when you only need browser-native submission and do not need JB aggregate helpers.

## Demo

- [Storybook](https://javadbat.github.io/design-system/?path=/docs/components-form-elements-jbform)
- [Value collection demo](https://javadbat.github.io/design-system/?path=/docs/components-form-elements-jbform-valuecollection--docs)

## Using With JS Frameworks

- [<img src="https://img.shields.io/badge/React.js-jb--form%2Freact-000.svg?logo=react&logoColor=%2361DAFB" height="30" />](https://github.com/javadbat/jb-form/tree/main/react)

## Installation

```sh
npm i jb-form
```

```js
import 'jb-form';
```

```html
<jb-form>
  <jb-input name="name" required></jb-input>
  <jb-button type="submit">Submit</jb-button>
</jb-form>
```

## API reference

### Attributes

| name | type | default | description |
| --- | --- | --- | --- |
| `name` | `string` | `""` | Name used when this form is nested inside another `jb-form`. |

### Properties

| name | type | readonly | description |
| --- | --- | --- | --- |
| `value` | `FormValues` | no | Aggregated object of named child values. Setting it calls `setFormValues(value)`. |
| `name` | `string` | no | Name attribute value used by parent `jb-form` traversal. |
| `isDirty` | `boolean` | yes | `true` when any named child control, virtual element, or sub-form is dirty. |
| `validation` | `ValidationHelper<FormValues>` | yes | Aggregate `jb-validation` helper. |
| `validElements` | `HTMLElement[]` | yes | Connected native and custom form controls registered directly under this `jb-form`. |
| `virtualElements` | object | yes | Virtual element registry: `list`, `dictionary`, `add(config)`, and `remove({ virtualElement })`. |
| `subForms` | object | yes | Nested `jb-form` registry: `list` and `dictionary`. |
| `formElements` | `FormElements` | yes | Internal native/custom child form element registry. |

### Methods

| name | returns | description |
| --- | --- | --- |
| `checkValidity()` | `boolean` | Runs synchronous aggregate validation without showing errors. |
| `reportValidity()` | `boolean` | Runs synchronous aggregate validation and asks children to show errors. |
| `jbCheckValidity({ showError })` | `Promise<CheckValidityAsyncResult>` | Runs rich async validation for `jb-validation` compatible children, virtual elements, and sub-forms. |
| `getValidationMessages()` | `FormValidationMessages` | Returns validation messages for named child controls, virtual elements, and sub-forms. |
| `getValidationSummary()` | `FormValidationSummary` | Returns validation summaries for named `jb-validation` compatible items. |
| `getValidationResult()` | `FormValidationResult` | Returns full validation results for named `jb-validation` compatible items. |
| `getFormValues()` | `FormValues` | Returns all named child values. Repeated names become `TraverseCollection`. |
| `getFormDirtyStatus()` | `TraverseResult<boolean>` | Returns dirty status for named child controls, virtual elements, and sub-forms. |
| `setFormValues(value, shouldUpdateInitialValue?)` | `void` | Sets values by `name`. Also updates initial values unless the second argument is `false`. |
| `setFormInitialValues(value, shouldUpdateValue?)` | `void` | Sets initial values used for dirty checks. Also updates current values unless the second argument is `false`. |

### Events

| event | detail | description |
| --- | --- | --- |
| `submit` | none | Dispatched after a trusted child submit is intercepted and `reportValidity()` returns `true`. |
| `dirty-change` | `{ isDirty: boolean }` | Dispatched when aggregate dirty state changes. |
| `validity-change` | `{ isValid: boolean }` | Dispatched when aggregate synchronous validity changes. |
| `change` | none | Dispatched by the form when a virtual element changes. Child controls may also bubble their own `change` events through `jb-form`. |
| `form-change` | none | Dispatched from a child control when `setFormValues()` changes it programmatically. |
| `init` | none | Dispatched from `connectedCallback` after child element scanning starts. |
| `disconnect` | none | Dispatched from `disconnectedCallback`. |

## Validation

Use `checkValidity()` for a silent synchronous check and `reportValidity()` to show child validation messages.

```js
const form = document.querySelector('jb-form');

const isValid = form.checkValidity();
const isValidAndShown = form.reportValidity();
```

Use `jbCheckValidity()` when async validations are involved. It validates JB validation-compatible child controls, virtual elements, and sub-forms and returns a tree result with element references.

```js
import { getInvalidElements } from 'jb-form';

const result = await form.jbCheckValidity({ showError: true });
const invalidElements = getInvalidElements(result);
```

Detailed validation helpers:

```js
form.getValidationMessages();
form.getValidationSummary();
form.getValidationResult();
```

## Value control

`jb-form` collects values from named direct child controls, virtual elements, and named sub-forms.

```js
const form = document.querySelector('jb-form');

const values = form.getFormValues();

form.setFormValues({
  name: 'Joe',
  age: 10,
});

form.setFormValues({ name: 'Joe' }, false);
```

`setFormValues(value)` updates both `value` and `initialValue` by default. Pass `false` as the second argument when you only want to change current values.

```js
form.setFormInitialValues({ name: 'Joe', age: 10 });
form.setFormInitialValues({ name: 'Joe' }, false);
```

## Dirty state

```js
console.log(form.isDirty);
console.log(form.getFormDirtyStatus());

form.addEventListener('dirty-change', (event) => {
  console.log(event.detail.isDirty);
});
```

## Submit

`jb-form` listens for trusted `submit` events from submit-capable child controls, prevents the original event, calls `reportValidity()`, and dispatches its own `submit` event when the form is valid.

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log(form.getFormValues());
});
```

## Virtual elements

Use virtual elements for state that is not represented by a JB/native form control but still needs to participate in form values, dirty checks, or validation.

```ts
import { ValidationHelper } from 'jb-validation';

const tagList = form.virtualElements.add({
  name: 'tags',
  validation: new ValidationHelper({
    getValue: () => tags,
    getValidations: () => [
      {
        validator: (value) => value.length > 0,
        message: 'Select at least one tag',
      },
    ],
  }),
  getValue: () => tags,
  getDirtyStatus: () => tags.length !== initialTags.length,
  setValue: (value) => {
    tags = value;
  },
  setInitialValue: (value) => {
    initialTags = value;
  },
});

tagList.dispatchOnChange();
```

Remove a virtual element when it is no longer part of the form:

```js
form.virtualElements.remove({ virtualElement: tagList });
```

## Same-name values

When two or more named items share the same `name`, the value becomes a `TraverseCollection`, which extends `Map` and is marked with `ValueCollectionSymbol`.

```html
<jb-form>
  <jb-input name="personName" value="Ali"></jb-input>
  <jb-input name="phoneNumber" value="1234"></jb-input>
  <jb-input name="phoneNumber" value="5678"></jb-input>
</jb-form>
```

```js
const values = form.getFormValues();
console.log(values.phoneNumber instanceof Map); // true
```

If fields have `id`, the collection uses the `id` as the key; otherwise it uses numeric keys.

## Sub forms

Nested `jb-form` elements can be managed individually and by a parent form.

```html
<jb-form id="parentForm">
  <jb-form name="profile">
    <jb-input name="firstName"></jb-input>
  </jb-form>
  <jb-form name="security">
    <jb-input name="password"></jb-input>
  </jb-form>
</jb-form>
```

```js
console.log(document.querySelector('#parentForm').getFormValues());
```

## Slots and styling

`jb-form` has a default slot for child controls and layout content. It does not currently expose CSS parts or CSS variables.

## Related Docs

- See [`jb-form/react`](https://github.com/javadbat/jb-form/tree/main/react) if you want to use this component in React.
- See [All JB Design System Component List](https://javadbat.github.io/design-system/) for more components.
- Use [Contribution Guide](https://github.com/javadbat/design-system/blob/main/docs/contribution-guide.md) if you want to contribute to this component.

## AI agent notes

- Import `jb-form` once before using `<jb-form>`.
- Put fields inside the default slot and give each field a `name` if its value should be collected.
- Use `getFormValues()` for aggregate values and `setFormValues(values)` to update children by name.
- Use `jbCheckValidity({ showError: true })` for async validation; `checkValidity()` and `reportValidity()` are synchronous.
- Listen to `submit`, `dirty-change`, and `validity-change` for form workflows.
- Repeated names return `TraverseCollection`, not a plain array.
- Use `virtualElements.add(config)` for non-DOM or non-standard form state.
- This package includes [`custom-elements.json`](./custom-elements.json) and points to it with the package.json `customElements` field. The field is documented by the Custom Elements Manifest project in [Referencing manifests from npm packages](https://github.com/webcomponents/custom-elements-manifest#referencing-manifests-from-npm-packages).
- In `custom-elements.json`, `exports.kind: "js"` describes JavaScript/TypeScript exports and `exports.kind: "custom-element-definition"` maps the `jb-form` tag name to `JBFormWebComponent`.
