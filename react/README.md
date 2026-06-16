# JBForm React

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/jb-form)
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://raw.githubusercontent.com/javadbat/jb-form/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/jb-form-react)](https://www.npmjs.com/package/jb-form-react)
![GitHub Created At](https://img.shields.io/github/created-at/javadbat/jb-form)

React wrapper for `jb-form`, plus hooks and helpers for reading form values from React.

## Installation

```sh
npm i jb-form
```

```jsx
import { JBForm } from 'jb-form/react';

<JBForm>
  {/* put your form controls here */}
</JBForm>
```

## When to use

Use `JBForm` when a React form needs aggregate JB validation, value collection, dirty-state tracking, virtual values, or nested `jb-form` sections.

## Props

| prop | type | description |
| --- | --- | --- |
| `name` | `string` | Name used when this form is nested inside another `JBForm`. |
| `onSubmit` | `(event) => void` | Fired after the underlying `jb-form` validates a trusted submit. |
| `onDirtyChange` | `(event) => void` | Fired when aggregate dirty state changes. Read `event.detail.isDirty`. |
| `onValidityChange` | `(event) => void` | Fired when aggregate synchronous validity changes. Read `event.detail.isValid`. |
| `onChange` | `(event) => void` | Fired for form/child change events. |
| `onInit` | `(event) => void` | Fired when the underlying `jb-form` dispatches `init`. |
| `onLoad` | `(event) => void` | Wired by the wrapper for compatibility, but the current web component does not dispatch `load`. |

## Ref access

Use a ref when you need the underlying `JBFormWebComponent` methods.

```jsx
const formRef = useRef(null);

function submit() {
  const form = formRef.current;
  if (form?.reportValidity()) {
    console.log(form.getFormValues());
  }
}

return (
  <JBForm ref={formRef}>
    {/* fields */}
  </JBForm>
);
```

## useJBForm

`useJBForm()` returns the nearest form instance from context.

```tsx
import { useJBForm } from 'jb-form/react';

function SaveButton() {
  const form = useJBForm();

  return (
    <button onClick={() => console.log(form?.getFormValues())}>
      Save
    </button>
  );
}
```

## useJBFormValue

`useJBFormValue` listens to form events and returns either the whole form value or one named field value.

```tsx
const { value: formValues } = useJBFormValue({ formRef });
const { value: bookName } = useJBFormValue<string>({
  formRef,
  name: 'bookName',
});
```

By default it listens to `change` and `form-change`. Pass `events` when your fields update on other events such as `input`.

```tsx
const { value } = useJBFormValue({
  formRef,
  events: ['input', 'change', 'form-change'],
});
```

## JBFormValue

Use `JBFormValue` to register a React-only value as a virtual form element.

```tsx
import { JBForm, JBFormValue } from 'jb-form/react';

function Page() {
  const [tags, setTags] = useState([]);

  return (
    <JBForm>
      <JBFormValue name="tags" value={tags} onChange={setTags} />
    </JBForm>
  );
}
```

## Events

```jsx
<JBForm
  onSubmit={(event) => {
    event.preventDefault();
    console.log(event.target.getFormValues());
  }}
  onDirtyChange={(event) => setIsDirty(event.detail.isDirty)}
  onValidityChange={(event) => setIsValid(event.detail.isValid)}
>
  {/* fields */}
</JBForm>
```

## Shared Documentation

For web-component behavior, methods, events, virtual elements, nested forms, and value collection, see [`jb-form`](https://github.com/javadbat/jb-form).

## AI agent notes

- Import `JBForm`, `useJBForm`, `useJBFormValue`, or `JBFormValue` from `jb-form/react`.
- Use a `ref` for imperative methods such as `getFormValues()`, `setFormValues()`, `reportValidity()`, and `jbCheckValidity()`.
- Use `onSubmit`, `onDirtyChange`, and `onValidityChange` for form workflows.
- Use `JBFormValue` for React state that should participate in form values but is not represented by a form control.
- Use `useJBFormValue({ formRef })` to subscribe React state to form changes.
- `onLoad` is typed by the wrapper, but the current web component dispatches `init`, not `load`.
