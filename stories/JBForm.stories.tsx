import React, { useRef, useEffect, useState } from "react";
import { JBButton } from "jb-button/react";
import 'jb-form';
import { getInvalidElements } from 'jb-form';
import { JBForm, Props } from 'jb-form/react';
import { PersonForm, BankForm } from "./samples/TestForms";
import type { Meta, StoryObj } from '@storybook/react';

// eslint-disable-next-line no-duplicate-imports
import type { JBFormWebComponent } from "jb-form";


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
      const onDirtyChange = (e) => {
        setIsDirty(e.detail.isDirty);
      };
      const onValidityChange = (e) => {
        setIsValid(e.detail.isValid);
      };
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
      const onSubmit = () => {
        alert("submit");
      };
      const onDirtyChange = (e) => {
        setIsDirty(e.detail.isDirty);
      };
      const onValidityChange = (e) => {
        setIsValid(e.detail.isValid);
      };
      useEffect(() => {
        if (ref.current) {
          setIsValid(ref.current.checkValidity());
          ref.current.addEventListener('submit', onSubmit);
          ref.current.addEventListener('dirty-change', onDirtyChange);
          ref.current.addEventListener('validity-change', onValidityChange);
        }
      }, [ref]);
      return (
        <form is="jb-form" ref={ref} {...args} style={{ display: 'flex', flexDirection: "column", gap: '1rem' }}>
          <form is="jb-form" name="personForm">
            <PersonForm></PersonForm>
          </form>
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
            { transform: "rotate(0deg)", display:'block' },
            { transform: "rotate(2deg)", display:'block' },
            { transform: "rotate(-2deg)", display:'block' },
            { transform: "rotate(0deg)", display:'block' },
          ],{duration:100,iterations:10,fill:'auto'})
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