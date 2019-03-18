import React from 'react'
import { map, redirect, route } from 'navi'
import { Form, FormErrors, FormField, FormSubmitButton } from '../controls/Form'

async function login(name) {
  alert('trying login')
  if (name === 'Spartacus') {
    throw new Error("I don't believe you.")
  }
}

export default map(async req => {
  let state = {}

  // If the request fails, store the error in window.history.state so
  // that re-running the route will not retry the request.
  if (req.method === 'POST' && !req.state.error) {
    let name = req.body.name

    try {
      await login(name)
      return redirect('/welcome?name='+encodeURIComponent(name))
    }
    catch (error) {
      state.error = error && error.message
    }
  }

  return route({
    error: state.error,
    state,
    status: state.error ? 400 : 200,
    head: <title>Login</title>,
    view: <Login />
  })
})

function Login() {
  return (
    <Form method='POST' initialValues={{ name: 'Spartacus' }}>
      <h1>Login</h1>
      <FormErrors render={error =>
        error ? <div style={{color: 'red'}}>{error}</div> : null
      } />
      <label>
        Name:&nbsp;
        <FormField name='name' component='input' />
      </label>
      <FormSubmitButton type='submit'>Login</FormSubmitButton>
    </Form>
  )
}