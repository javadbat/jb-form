import React from 'react';
import { JBDateInput } from 'jb-date-input/react';
import { JBInput } from 'jb-input/react';
import { JBOptionList, JBSelect } from "jb-select/react";
import { JBTextarea } from "jb-textarea/react";
import { JBPaymentInput } from "jb-payment-input/react";
import { JBImageInput } from "jb-image-input/react";
import { JBNumberInput } from "jb-number-input/react";
import { JBForm, JBFormValue } from 'jb-form/react';

const genderList = ["male","female"];
export function PersonForm() {
  return (
    <div style={{display:'flex',flexDirection:'column', gap:'1rem'}}>
      <JBInput name="name" required label="name" />
      <JBDateInput name="birthDate" required label="birthdate" format="YYYY-MM-DD" />
      <JBDateInput name="applyDate" required label="apply date" />
      <JBSelect name="gender" label="gender" required>
        <JBOptionList optionList={genderList}></JBOptionList>
      </JBSelect>
      <JBImageInput name="avatar" label="avatar" required maxFileSize={500 * 1024} />
      <JBTextarea label="description" name="description" required />
    </div>
  );
}
export function BankForm() {
  return (
    <div>
      <JBInput name="bankName" required label="bank name" />
      <JBPaymentInput name="cardNumber" label="card number" />
    </div>
  );
}
export function ProductForm() {
  return (
    <div>
      <JBInput name="productName" required label="product name" />
      <JBNumberInput name="price" label="price" step={1000} showControlButton/>
    </div>
  );
}
export function BookForm({id}:{id?:string}) {
  return (
    <JBForm name="books" id={id}>
      <JBFormValue name="bookId" />
      <JBInput name="bookTitle" required label="bookTitle" />
      <JBNumberInput name="price" label="price" step={1000} showControlButton/>
    </JBForm>
  );
}