import React from 'react'
// import { map, redirect, route } from 'navi'
// import Form from '../styled/Form'
// import { RoutingContext } from '../types/RoutingContext'

// export default map(async (request, context: RoutingContext) => {
//   if (context.currentUser) {
//     return redirect('/')
//   }

//   if (request.method === 'post') {
//     let { email, password } = request.body
//     try {
//       await request.serializeEffectToHistory(() =>
//         context.firebase.auth.signInWithEmailAndPassword(email, password)
//       )
//       return redirect('/')
//     }
//     catch (error) {
//       return route({
//         error,
//         view: <Login />
//       })
//     }
//   }

//   return route({
//     view: <Login />
//   })
// })

// function Login() {
//   return (
//     <Form method='post'>
//       <h1>Need a new Password?</h1>
//       <Form.Errors />
//       <Form.Field
//         label='Your email'
//         name='email'
//         validate={value =>
//           value === '' ? 'Please enter your email.' : undefined
//         }
//       />
//       <Form.SubmitButton>
//         Request a new Password
//       </Form.SubmitButton>
//     </Form>
//   )
// }