import React, { useRef, useEffect, useState, useCallback, } from "react";
import { JBButton } from "jb-button/react";
import 'jb-form';
import { getInvalidElements } from 'jb-form';
import { JBForm, JBFormValue, useJBFormValue, type Props } from 'jb-form/react';
import { PersonForm, BankForm, ProductForm, BookForm } from "./samples/TestForms";
import type { Meta, StoryObj } from '@storybook/react';

// eslint-disable-next-line no-duplicate-imports
import { type JBFormEventType, type JBFormWebComponent, TraverseCollection } from "jb-form";
import { JBInput } from "jb-input/react";
import { JBNumberInput } from "jb-number-input/react";


const meta: Meta<Props> = {
  title: "Components/form elements/JBForm",
  component: JBForm,
};
export default meta;
type Story = StoryObj<typeof JBForm>;

export const Normal: Story = {
  args: {
    name: "testForm"
  }
};

const defaultFormValue = {
  name: "ali",
  birthDate: '2024-10-26',
  applyDate: new Date().toISOString(),
  gender: "male",
  description: "i'm ali",
  avatar: "https://www.wikipedia.org/portal/wikipedia.org/assets/img/Wikipedia-logo-v2.png"
}
export const FormTest: Story = {
  render:
    (args) => {
      const ref = useRef<JBFormWebComponent>(null);
      const [isDirty, setIsDirty] = useState(false);
      const [isValid, setIsValid] = useState(true);
      const onSubmit = () => {
        alert("submit");
      };
      const onDirtyChange = (e: JBFormEventType<CustomEvent>) => {
        setIsDirty(e.detail.isDirty);
      };
      const onValidityChange = (e: JBFormEventType<CustomEvent>) => {
        setIsValid(e.detail.isValid);
      };
      // biome-ignore lint/correctness/useExhaustiveDependencies: <we need this>
      useEffect(() => {
        if (ref.current) {
          setIsValid(ref.current.checkValidity());
        }
      }, [ref]);
      return (
        <JBForm ref={ref} {...args} style={{ display: 'flex', flexDirection: "column", gap: '1rem' }} onSubmit={onSubmit} onDirtyChange={onDirtyChange} onValidityChange={onValidityChange}>
          <PersonForm />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <JBButton disabled={!isDirty} type="submit">submit</JBButton>
            <JBButton onClick={() => alert(ref.current?.checkValidity())}>check validity({isValid ? 'valid' : 'invalid'})</JBButton>
            <JBButton onClick={() => alert(ref.current?.reportValidity())}>report validity</JBButton>
            <JBButton onClick={() => console.debug(ref.current?.getValidationMessages())}>getValidationMessages</JBButton>
            <JBButton onClick={() => console.debug(ref.current?.getValidationSummary())}>getValidationSummary</JBButton>
            <JBButton onClick={() => console.debug(ref.current?.getValidationResult())}>getValidationResult</JBButton>
            <JBButton onClick={() => console.debug(ref.current?.getFormValues())}>getFormValues</JBButton>
            <JBButton onClick={() => console.debug(ref.current?.setFormValues(defaultFormValue, true))}>setFormDefaultValue</JBButton>
            <JBButton onClick={() => console.debug(ref.current?.getFormDirtyStatus())}>getFormDirtyStatus</JBButton>
          </div>
        </JBForm>

      );
    },
  args: {
    name: "test-form",
  }
};

export const FormTreeTest: Story = {
  render:
    (args) => {
      const ref = useRef<JBFormWebComponent>(null);
      const [isDirty, setIsDirty] = useState(false);
      const [isValid, setIsValid] = useState(true);
      const onSubmit = useCallback(() => {
        alert("submit");
      }, []);
      const onDirtyChange = useCallback((e: JBFormEventType<CustomEvent>) => {
        setIsDirty(e.detail.isDirty);
      }, []);
      const onValidityChange = useCallback((e: JBFormEventType<CustomEvent>) => {
        setIsValid(e.detail.isValid);
      }, []);
      // biome-ignore lint/correctness/useExhaustiveDependencies: <we need this reaction>
      useEffect(() => {
        if (ref.current) {
          setIsValid(ref.current.checkValidity());
          ref.current.addEventListener('submit', onSubmit as EventListenerOrEventListenerObject);
          ref.current.addEventListener('dirty-change', onDirtyChange as EventListenerOrEventListenerObject);
          ref.current.addEventListener('validity-change', onValidityChange as EventListenerOrEventListenerObject);
        }
      }, [ref.current, onValidityChange, onDirtyChange, onSubmit]);
      const [showPersonForm, setShowPersonForm] = useState(true);
      return (
        //@ts-expect-error
        <form is="jb-form" ref={ref} {...args} style={{ display: 'flex', flexDirection: "column", gap: '1rem' }}>
          {
            showPersonForm && 
            <form is="jb-form" name="personForm">
              <PersonForm></PersonForm>
            </form>
          }
          <JBButton onClick={()=>setShowPersonForm(x=>!x)}>{showPersonForm?`Hide`:`Show`} Person Form</JBButton>
          <hr></hr>
          <form is="jb-form" name="bank-form">
            <BankForm />
          </form>
          <div>isDirty:{isDirty ? 'dirty' : 'clean'}</div>
          <div>isValid:{isValid ? 'valid' : 'invalid'}</div>
        </form>

      );
    },
  args: {
    name: "parent-form",
  }
};

export const SpotInvalidElementTest: Story = {
  render:
    (args) => {
      const ref = useRef<JBFormWebComponent>(null);
      const shakeInvalid = async () => {
        const res = await ref.current!.jbCheckValidity({ showError: true });
        const elements = getInvalidElements(res);
        elements.forEach(el => {
          el.animate([
            { transform: "rotate(0deg)", display: 'block' },
            { transform: "rotate(2deg)", display: 'block' },
            { transform: "rotate(-2deg)", display: 'block' },
            { transform: "rotate(0deg)", display: 'block' },
          ], { duration: 100, iterations: 10, fill: 'auto' })
        })
      }
      return (
        <JBForm ref={ref} {...args} style={{ display: 'flex', flexDirection: "column", gap: '1rem' }}>
          <JBForm name="personForm">
            <PersonForm></PersonForm>
          </JBForm>
          <hr></hr>
          <JBForm name="bank-form">
            <BankForm />
          </JBForm>
          <JBButton onClick={shakeInvalid}>shake invalids</JBButton>
        </JBForm>

      );
    },
  args: {
    name: "parent-form",
  }
};

export const FormWithSameName: Story = {
  render: () => {
    const ref = useRef<JBFormWebComponent>(null);
    const getValue = () => {
      const values = ref.current?.getFormValues();
      console.log(values);
    }
    const getValidations = () => {
      ref.current?.checkValidity()
      const validations = ref.current?.getValidationResult()
      console.log(validations);
    }
    return (
      <JBForm ref={ref} name="masterForm">
        <p>see browser console for result</p>
        <BankForm />
        <p>we have 3 exact phone number form element</p>
        <JBInput name="phoneNumber" label="phone number 1" />
        <JBInput name="phoneNumber" label="phone number 2" />
        <JBInput name="phoneNumber" label="phone number 3" />
        <p>we have 3 exact form with same name of `ProductForm`</p>
        <hr />
        <JBForm name="ProductForm"><ProductForm /></JBForm>
        <hr />
        <JBForm name="ProductForm"><ProductForm /></JBForm>
        <hr />
        <JBForm name="ProductForm"><ProductForm /></JBForm>
        <hr />
        <JBForm name="ProductForm"><ProductForm /></JBForm>
        <br />
        <div style={{ display: 'flex', gap: '0.5rem', paddingBlock: '1rem' }}>
          <JBButton onClick={getValue}>Get Values</JBButton>
          <JBButton onClick={getValidations}>Get Validations</JBButton>
        </div>
      </JBForm>
    )
  }
}

export const FormValue: Story = {

  // biome-ignore lint/suspicious/noExplicitAny: <here we have different args than component args>
  render: (args: any) => {

    const ref = useRef<JBFormWebComponent>(null);
    const getValue = () => {
      console.log(ref.current?.getFormValues());
    }
    const setValue = () => {
      ref.current?.setFormValues(args.value)
    }
    const [bookId, setBookId] = useState(10);
    const formValues = useJBFormValue({formRef:ref});
    useEffect(()=>{
      console.log("already set value",formValues);
    },[formValues])
    return (
      <JBForm name="myForm" ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <JBInput name="bookName" label="book name" />
        <JBNumberInput name="price" label="price" />
        <JBFormValue name="bookId" value={bookId} onChange={(value) => setBookId(value)}>{(v)=><p>Hidden Value (bookId) is {v}</p>}</JBFormValue>
        <JBButton onClick={getValue}>Get Value (See Console log)</JBButton>
        <JBButton onClick={setValue}>Set Value (Set value in args)</JBButton>

      </JBForm>
    )
  }, args: {
    //@ts-ignore
    value: {
      bookId: 5,
      bookName: "Wikipedia",
      price: 100000
    }
  }
}
export const UseJBFormValue: Story = {

  // biome-ignore lint/suspicious/noExplicitAny: <here we have different args than component args>
  render: (args: any) => {

    const ref = useRef<JBFormWebComponent>(null);
    const getValue = () => {
      console.log(ref.current?.getFormValues());
    }
    const setValue = () => {
      ref.current?.setFormValues(args.value)
    }
    const [bookId, setBookId] = useState(10);
    const formValues = useJBFormValue({formRef:ref});
    const {value:bookName} = useJBFormValue<string>({formRef:ref, name:"bookName"});
    useEffect(()=>{
      console.log("already set value",formValues);
    },[formValues])
    return (
      <JBForm name="myForm" ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>click on set value and see logs for full form values</p>
        <JBInput name="bookName" label="book name" />
        <JBNumberInput name="price" label="price" />
        <p>Hidden Value (bookId) is {bookId}</p>
        <JBFormValue name="bookId" value={bookId} onChange={(value) => setBookId(value)} />
        <JBButton onClick={getValue}>Get Value (See Console log)</JBButton>
        <JBButton onClick={setValue}>Set Value (Set value in args)</JBButton>
        <p>the book name we set: <b>{bookName}</b></p>
      </JBForm>
    )
  }, args: {
    //@ts-ignore
    value: {
      bookId: 5,
      bookName: "Wikipedia",
      price: 100000
    }
  }
}
export const ArrayValue: Story = {

  // biome-ignore lint/suspicious/noExplicitAny: <here we have different args than component args>
  render: (args: any) => {

    const ref = useRef<JBFormWebComponent>(null);
    const getValue = () => {
      console.log(ref.current?.getFormValues());
    }
    const setValue = () => {
      ref.current?.setFormValues(args.value)
    }
    return (
      <JBForm name="myForm" ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>first muli form element directly in form</p>
        <JBInput name="phoneNumber" label="phone number 1" />
        <JBInput name="phoneNumber" label="phone number 2" />
        <JBInput name="phoneNumber" label="phone number 3" />
        <hr />
        <BookForm />
        <hr />
        <BookForm />
        <hr />
        <p>Form With Id "myBookForm"</p>
        <BookForm id="myBookForm" />
        <JBButton onClick={getValue}>Get Value (log it into console)</JBButton>
        <JBButton onClick={setValue}>Set Value (Set value in args)</JBButton>
      </JBForm>
    )
  }, args: {
    //@ts-ignore
    value: {
      phoneNumber: new TraverseCollection<any>([[1, '09125588745'], [2, '0919074020'], [3, '09145898742']]) as TraverseCollection<string>,
      books: new TraverseCollection<any>([
        [1, {
          bookId: 1,
          bookTitle: "Planets",
          price: 100000
        }],
        [2, {
          bookId: 2,
          bookTitle: "Animals",
          price: 20000
        }],
        ["myBookForm", {
          bookId: 3,
          bookTitle: "Set With Id",
          price: 5000000
        }
        ]]
      )
    }
  }
}