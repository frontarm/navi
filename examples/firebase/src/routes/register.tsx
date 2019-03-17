import React from 'react'
import { map, redirect, route } from 'navi'
import { useNavigation } from 'react-navi'
import Form from '../styled/Form'
import { RoutingContext } from '../types/RoutingContext'
import AuthFormLayout from '../styled/AuthFormLayout'
import { colors } from '../utils/theme';
import Firebase from '../Firebase';

export default map<RoutingContext>(({ context }) => {
  if (context.currentUser) {
    return redirect('/?welcome')
  }
  else {
    return route({
      view: <Register firebase={context.firebase} />,
      title: 'Register',
    })
  }
})

function Register({ firebase }: { firebase: Firebase }) {
  let navigation = useNavigation()

  return (
    <AuthFormLayout heading='Register'>
      <Form onSubmit={async (value: any) => {
        let { email, password } = value
        await firebase.auth.createUserWithEmailAndPassword(email, password)
        await navigation.navigate('/?welcome')
      }}>
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