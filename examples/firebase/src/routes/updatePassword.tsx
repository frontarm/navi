import React from 'react'
// import { map, redirect, route } from 'navi'
// import Form from '../styled/Form'
// import { RoutingContext } from '../types/RoutingContext'

// export default map(async (request, context: RoutingContext) => {
//   if (request.method === 'post') {
//     let { password } = request.body
//     try {
//       await request.serializeEffectToHistory(() =>
//         context.firebase.auth.currentUser!.updatePassword(password)
//       )
//       return redirect('/')
//     }
//     catch (error) {
//       return route({
//         error,
//         view: <UpdatePassword />
//       })
//     }
//   }

//   return route({
//     view: <UpdatePassword />
//   })
// })

// function UpdatePassword() {
//   return (
//     <Form method='post'>
//       <h1>Need a new Password?</h1>
//       <Form.Errors />
//       <Form.Field
//         label='New password'
//         name='password'
//         type='password'
//         validate={value =>
//           value === '' ? 'Please enter a password.' : undefined
//         }
//       />
//       <Form.Field
//         label='And again'
//         name='passwordConfirmation'
//         type='password'
//         validate={(value, allValues: any) =>
//           value !== allValues.password ? 'This should match your password.' : undefined
//         }
//       />
//       <Form.SubmitButton>
//         Request a new Password
//       </Form.SubmitButton>
//     </Form>
//   )
// }

