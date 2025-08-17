// supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Aapka Supabase project details
const SUPABASE_URL = 'https://fzkjrtudqirpefxsvilc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2pydHVkcWlycGVmeHN2aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjEyNjcsImV4cCI6MjA3MDg5NzI2N30.aSZaNoz5BXESVeYnRAU_cNuOmaN7mOi0nd5-FEN-fZk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 🟢 Signup function
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    console.error('Signup error:', error.message)
    alert(error.message)
  } else {
    alert('Signup successful! Please check your email to confirm.')
    console.log(data)
  }
}

// 🟢 Login function
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('Login error:', error.message)
    alert(error.message)
  } else {
    alert('Login successful!')
    console.log(data)
    window.location.href = "dashboard.html"  // dashboard page pe redirect
  }
}

// 🟢 Logout function
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Logout error:', error.message)
    alert(error.message)
  } else {
    alert('Logged out successfully!')
    window.location.href = "index.html"
  }
}
