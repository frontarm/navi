import React from 'react'
import styled from 'styled-components/macro'
import { FieldProps as FormControlFieldProps } from 'react-final-form'
import FormControl, {
  FormProps as FormControlProps,
  FormSubmitButtonProps as FormControlSubmitButtonProps
} from '../controls/Form'
import Button, { ButtonProps } from './Button'
import Field, { FieldProps } from './Field'
import Input from './Input'
import { Omit } from '../types/Omit'


const StyledForm = styled(FormControl)`

`


interface StyledFormErrorsProps {
  active: boolean
}

const StyledFormErrors = styled.div<StyledFormErrorsProps>`

`


function Form<Schema extends object>(props: FormControlProps<Schema>) {
  return (
    <StyledForm {...props as any} />
  )
}

function FormErrors({ defaultMessage = '' }) {
  return (
    <FormControl.Errors
      defaultMessage={defaultMessage}
      render={error => 
        <StyledFormErrors active={typeof error === 'string'}>
          {error}
        </StyledFormErrors>
      }
    />
  )
}

interface FormFieldProps extends FormControlFieldProps<any, any>, Omit<FieldProps, 'children'> {
  type?: string
}

function FormField({ label, type, ...props }: FormFieldProps) {
  return (
    <FormControl.Field {...props} render={({ input, meta }) =>
      <Field label={label}>
        <Input type={type} {...input} />
      </Field>
    } />
  )
}


interface FormSubmitButtonProps extends Omit<FormControlSubmitButtonProps, 'render'>, ButtonProps {}

function FormSubmitButton({ children='Save', ...submitButtonProps }: FormSubmitButtonProps) {
  return (
    <FormControl.SubmitButton {...submitButtonProps} render={({ button, submitting }) =>
      <Button {...button} busy={submitting}>
        {children}
      </Button>
    } />
  )
}


export default Object.assign(Form, {
  Errors: FormErrors,
  Field: FormField,
  SubmitButton: FormSubmitButton,
})

