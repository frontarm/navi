import React from 'react'
import { route } from 'navi'
import { useNavigation } from 'react-navi'
import Form from '../styled/Form'
import { RoutingContext } from '../types/RoutingContext'
import AuthFormLayout from '../styled/AuthFormLayout'
import { colors } from '../utils/theme'
import Firebase from '../Firebase';

export default route<RoutingContext>({
  getView: ({ context }) => <Login firebase={context.firebase} />,
  title: 'Login',
})

function Login({ firebase }: { firebase: Firebase }) {
  let navigation = useNavigation()

  return (
    <AuthFormLayout heading='Login'>
      <Form onSubmit={async (value: any) => {
        let { email, password } = value
        await firebase.auth.signInWithEmailAndPassword(email, password)
        await navigation.navigate('/')
      }}>
        <Form.Errors />
        <Form.Field
          label='Email'
          name='email'
          validate={(value: any) =>
            value === '' ? 'Please enter your email.' : undefined
          }
        />
        <Form.Field
          label='Password'
          name='password'
          type='password'
          validate={(value: any) =>
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