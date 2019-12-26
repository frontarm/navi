import React, { useCallback } from 'react'
import { FORM_ERROR, FormApi, FormState } from 'final-form'
import {
  Form as FinalForm,
  FormProps as FinalFormProps,
  FormSpy,
  Field
} from 'react-final-form'
import { Omit } from '../types/Omit'


export type FormErrors<Schema extends object> = Partial<Record<keyof Schema, string>>


export interface FormProps<Schema extends object> extends Omit<FinalFormProps, 'component' | 'children' | 'onSubmit' | 'validate'> {
  children: React.ReactNode
  className?: string
  component?: string | React.ElementType<any>
  initialValues?: Schema
  style?: React.CSSProperties
  submitError?: string | FormErrors<Schema>
  onSubmit?: (
    value: Schema,
    form: FormApi,
  ) => Promise<any>,
  validate?: (value: Schema) => undefined | FormErrors<Schema> | Promise<undefined | FormErrors<Schema>>
}

export function Form<Schema extends object>({
  children,
  className,
  component: Component = 'form',
  style,
  onSubmit,
  validate,
  ...props
}: FormProps<Schema>) {
  let onSubmitFinalForm = useCallback(async (value, form) => {
    if (onSubmit) {
      try {
        await onSubmit(value, form)
      }
      catch (error) {
        let message;
        if (error instanceof Error) {
          message = error.message
        }
        return typeof error === 'string' ? { [FORM_ERROR]: message } : error
      }
    }
  }, [onSubmit])

  let validateFinalForm = useCallback(async (values: Schema) => {
    let validateErrors = await (validate && validate(values))
    let submitErrors = props.submitError
    return combineErrors(validateErrors, submitErrors)
  }, [validate, props.submitError])

  return (
    <FinalForm
      {...props}
      onSubmit={onSubmitFinalForm}
      subscription={{}}
      validate={validateFinalForm as any}>
      {({ handleSubmit }) =>
        React.createElement(Component, {
          children,
          className,
          onSubmit: handleSubmit,
          style,
        })
      }
    </FinalForm>
  )
}


export interface FormErrorsProps {
  /**
   * When there has been an error submitting the form, the `message` property
   * will have a string value.
   */
  render: (message?: string) => React.ReactElement<any>,
  
  /**
   * Allows you to set the default error message that is shown when the form
   * couldn't be submitted, and there's no submit error message.
   */
  defaultMessage?: string
}

export function FormErrors(props: FormErrorsProps) {
  let {
    defaultMessage = "Your data couldn't be saved.",
    render,
  } = props

  return (
    <FormSpy render={state => {
      let error =
        state.submitFailed ? (state.submitError || defaultMessage) : undefined
      
      return render(error)
    }} />
  )
}


function defaultFormSubmitButtonRender(props: FormSubmitRenderProps) {
  return <button {...props.button} />
}

export interface FormSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode,
  render: (props: FormSubmitRenderProps) => React.ReactElement<any>,
}

export interface FormSubmitRenderProps extends FormState<any> {
  button: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export function FormSubmitButton({ render=defaultFormSubmitButtonRender, children='Save', ...props }: FormSubmitButtonProps) {
  return (
    <FormSpy render={state =>
      render({
        ...state,
        button: {
          disabled: state.submitting,
          children,
          ...props,
          type: 'submit',
        }
      })
    } />
  )
}


function combineErrors<Schema extends object>(...errors: (undefined | string | FormErrors<Schema>)[]): undefined | FormErrors<Schema> {
  if (errors.length === 0) {
    return
  }

  let result = {}
  let hasErrors = false
  do {
    let error = errors.shift()
    if (typeof error === 'string') {
      error = { [FORM_ERROR]: error } as any
    }
    if (error) {
      hasErrors = true
      Object.assign(result, error)
    }
  } while (errors.length)

  return hasErrors ? result : undefined
}


export { Field, FormSpy }


export default Object.assign(Form, {
  Spy: FormSpy,
  Field,
  SubmitButton: FormSubmitButton,
  Errors: FormErrors,
})