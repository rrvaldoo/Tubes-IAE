import React, { useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
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

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const [register, { loading }] = useMutation(REGISTER_MUTATION)

  const handleRegister = async () => {
    if(!name || !email || !phone || !password){
      alert('Please fill all fields')
      return
    }

    try {
      const { data } = await register({ variables: { input: { name, email, phone, password } } })
      if(data?.register?.token){
        localStorage.setItem('token', data.register.token)
        localStorage.setItem('user', JSON.stringify(data.register.user || { name, email }))
        window.location.href = '/dashboard'
      } else {
        alert(data?.register?.message || 'Registration failed')
      }
    } catch(err){
      console.error(err)
      alert(err.message || 'Registration error')
    }
  }

  return (
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:360,padding:24,boxShadow:'0 4px 12px rgba(0,0,0,.1)'}}>
        <h2>Create an account</h2>
        <div style={{marginBottom:8}}>
          <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:8}}>
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:8}}>
          <input placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <div style={{marginBottom:12}}>
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8}} />
        </div>
        <button onClick={handleRegister} style={{width:'100%',padding:10}} disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        <div style={{marginTop:12,textAlign:'center'}}>
          <a href="/login">Already have an account? Login</a>
        </div>
      </div>
    </div>
  )
}
