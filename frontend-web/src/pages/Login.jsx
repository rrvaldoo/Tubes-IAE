import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        userId
        name
        email
      }
      message
    }
  }
`

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION)

  const handleLogin = async () => {
    if(!email || !password){
      alert('Please enter credentials')
      return
    }

    try {
      const { data } = await loginMutation({ variables: { input: { email, password } } })
      if (data?.login?.token) {
        localStorage.setItem('token', data.login.token)
        localStorage.setItem('user', JSON.stringify(data.login.user || { name: email, email }))
        window.location.href = '/dashboard'
      } else {
        alert(data?.login?.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      alert(err.message || 'Login error')
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:320,padding:24,boxShadow:'0 4px 12px rgba(0,0,0,.1)'}}>
        <h2>DosWallet Web</h2>
        <div style={{marginBottom:12}}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:12}}>
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <button onClick={handleLogin} style={{width:'100%',padding:10}} disabled={loading}>{loading ? 'Logging...' : 'Login'}</button>
        <div style={{marginTop:12,textAlign:'center'}}>
          <a href="/register">Don't have an account? Register</a>
        </div>
      </div>
    </div>
  )
}
