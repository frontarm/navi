import React from 'react'
import { map, redirect, route } from 'navi'
import Form from '../styled/Form'
import { RoutingContext } from '../types/RoutingContext'
import AuthFormLayout from '../styled/AuthFormLayout'
import { colors } from '../utils/theme';

export default map(async (request, context: RoutingContext) => {
  if (context.currentUser) {
    return redirect('/?welcome')
  }

  try {
    if (request.method !== 'post') {
      throw undefined
    }
    
    let { email, password } = request.body
    await context.firebase.auth.createUserWithEmailAndPassword(email, password);
    return redirect('/?welcome')
  }
  catch (error) {
    return route({
      error,
      view: <Register />,
      title: 'Register',
    })
  }
})

function Register() {
  return (
    <AuthFormLayout heading='Register'>
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
          Sign up
        </Form.SubmitButton>
      </Form>
    </AuthFormLayout>
  )
}