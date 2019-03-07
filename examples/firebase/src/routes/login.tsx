import React from 'react'
import { map, redirect, route } from 'navi'
import Form from '../styled/Form'
import { RoutingContext } from '../types/RoutingContext'
import AuthFormLayout from '../styled/AuthFormLayout'
import { colors } from '../utils/theme'

export default map(async (request, context: RoutingContext) => {
  if (context.currentUser) {
    return redirect('/')
  }

  if (request.method === 'post') {
    let { email, password } = request.body
    try {
      await context.firebase.auth.signInWithEmailAndPassword(email, password);
      return redirect('/')
    }
    catch (error) {
      return route({
        error,
        view: <Login />
      })
    }
  }

  return route({
    view: <Login />
  })
})

function Login() {
  return (
    <AuthFormLayout heading='Login'>
      <Form method='post'>
        <Form.Errors />
        <Form.Field
          label='Email'
          name='email'
          validate={value =>
            value === '' ? 'Please enter your email.' : undefined
          }
        />
        <Form.Field
          label='Password'
          name='password'
          type='password'
          validate={value =>
            value === '' ? 'Please enter your password.' : undefined
          }
        />
        <Form.SubmitButton bgcolor={colors.red}>
          Login
        </Form.SubmitButton>
      </Form>
    </AuthFormLayout>
  )
}