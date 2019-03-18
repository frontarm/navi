import React, { useCallback } from 'react'
import { useCurrentRoute, useNavigation } from 'react-navi'
import { FORM_ERROR } from 'final-form'
import { Form as FinalForm, FormSpy } from 'react-final-form'

export { Field as FormField } from 'react-final-form'

export function Form({
  action,
  children,
  className,
  method = 'POST',
  style,
  validate,
  ...props
}) {
  let { url } = useCurrentRoute()
  let navigation = useNavigation()

  if (!action) {
    action = url.pathname
  }

  let onSubmitFinalForm = useCallback(async (body, form) => {
    try {
      let route = await navigation.navigate(action, {
        body,
        method,
      })

      if (route.type === 'error') {
        throw route.error
      }
    }
    catch (error) {
      let message = error
      if (error instanceof Error) {
        message = error.message
      }
      return typeof message === 'string' ? { [FORM_ERROR]: message } : message
    }
  }, [action, method])

  return (
    <FinalForm
      {...props}
      onSubmit={onSubmitFinalForm}
      subscription={{}}>
      {({ handleSubmit }) =>
        <form
          action={action}
          children={children}
          className={className}
          method={method}
          onSubmit={handleSubmit}
          style={style}
        />
      }
    </FinalForm>
  )
}

export function FormErrors(props) {
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


function defaultFormSubmitButtonRender(props) {
  return <button {...props.button} />
}

export function FormSubmitButton({ render=defaultFormSubmitButtonRender, children='Save', ...props }) {
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
