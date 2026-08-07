import { useState } from 'react'

import logoImg from '../../assets/LandingPage/Logo.png'
import leftDecorationImg from '../../assets/Signin/leftSidedecoration.png'

const SIGN_IN_FIELDS = [
{
key: 'username',
label: 'Username',
placeholder: 'Username',
type: 'text',
autoComplete: 'username',
icon: 'user',
},
{
key: 'password',
label: 'Password',
placeholder: 'Password',
type: 'password',
autoComplete: 'current-password',
icon: 'lock',
},
]

const SIGN_UP_FIELDS = [
{
key: 'username',
label: 'Username',
placeholder: 'Username',
type: 'text',
autoComplete: 'username',
icon: 'user',
},
{
key: 'password',
label: 'Create Password',
placeholder: 'Create Password',
type: 'password',
autoComplete: 'new-password',
icon: 'lock',
},
]

function AuthField({ label, placeholder, type, autoComplete, icon, value, onChange }) {
return (
<label className="block">
<span className="mb-2 block text-sm font-medium text-slate-700">
{label}
</span>

<div className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white">
<FieldIcon kind={icon} />

<input
type={type}
autoComplete={autoComplete}
placeholder={placeholder}
value={value}
onChange={onChange}
className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
/>
</div>
</label>

)
}

function FieldIcon({ kind }) {
const shared = 'h-5 w-5 shrink-0 text-slate-400'

if (kind === 'user') {
return (
<svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
<path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
<circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
</svg>
)
}

if (kind === 'at') {
return (
<svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
<path d="M15.5 8.5v5.2c0 .9-.7 1.6-1.6 1.6s-1.6-.7-1.6-1.6V11a1.8 1.8 0 1 0-3.1 1.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
</svg>
)
}

if (kind === 'lock') {
return (
<svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
<rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
<path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
</svg>
)
}

return (
<svg viewBox="0 0 24 24" fill="none" className={shared} aria-hidden="true">
<circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
</svg>
)
}

const AUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export default function AuthPage({ onLogin }) {
const [mode, setMode] = useState('sign-in')
const [formValues, setFormValues] = useState({ username: '', password: '' })
const [statusMessage, setStatusMessage] = useState('')
const [statusType, setStatusType] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)

const isSignUp = mode === 'sign-up'
const fields = isSignUp ? SIGN_UP_FIELDS : SIGN_IN_FIELDS

function updateField(field, value) {
setFormValues((currentValues) => ({
...currentValues,
[field]: value,
}))
}

async function handleSubmit(event) {
event.preventDefault()

const username = formValues.username.trim()
const password = formValues.password

if (!username || !password) {
setStatusType('error')
setStatusMessage('Not valid')
return
}

setIsSubmitting(true)
setStatusMessage('')

try {
const endpoint = `${AUTH_BASE_URL}/api/auth/${isSignUp ? 'register' : 'login'}`
const response = await fetch(endpoint, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ username, password }),
})

const responseBody = await response.json().catch(() => null)

if (!response.ok) {
const message = responseBody?.message || responseBody?.detail || 'Not valid'
setStatusType('error')
setStatusMessage(message === 'Invalid username or password' ? 'Not valid' : message)
return
}

if (isSignUp) {
setStatusType('success')
setStatusMessage('Account created. Please sign in.')
setMode('sign-in')
setFormValues({ username, password: '' })
return
}

if (responseBody?.token) {
localStorage.setItem('codesprintToken', responseBody.token)
}

if (responseBody?.username) {
localStorage.setItem('codesprintUsername', responseBody.username)
}

if (responseBody?.userId) {
localStorage.setItem('codesprintUserId', String(responseBody.userId))
}

setStatusType('success')
setStatusMessage(responseBody?.message || 'Login successful')
onLogin?.(responseBody)
} catch {
setStatusType('error')
setStatusMessage('Not valid')
} finally {
setIsSubmitting(false)
}
}

const statusClasses =
statusType === 'error'
? 'border-red-200 bg-red-50 text-red-700'
: statusType === 'success'
? 'border-emerald-200 bg-emerald-50 text-emerald-700'
: 'border-slate-200 bg-slate-50 text-slate-600'

return (
<main className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white">
<div className="flex min-h-screen">
{/* LEFT SIDE - FORM */}
<section className="flex w-full items-center justify-center bg-white px-6 py-10 sm:px-8 lg:w-[40%] lg:px-10">
<div className="w-full max-w-md">
<img src={logoImg} alt="CodeSprint" className="mx-auto mb-8 w-56 sm:w-64 lg:w-72" />

<div className="mb-8 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
<button
type="button"
onClick={() => {
setMode('sign-in')
setStatusMessage('')
setStatusType('')
}}
className={`rounded-lg py-3 text-sm font-semibold transition ${
!isSignUp
? 'bg-white text-blue-700 shadow'
: 'text-slate-600 hover:text-slate-900'
}`}
>
Sign In
</button>

<button
type="button"
onClick={() => {
setMode('sign-up')
setStatusMessage('')
setStatusType('')
}}
className={`rounded-lg py-3 text-sm font-semibold transition ${
isSignUp
? 'bg-white text-blue-700 shadow'
: 'text-slate-600 hover:text-slate-900'
}`}
>
Sign Up
</button>
</div>

<form className="space-y-5" onSubmit={handleSubmit}>
{fields.map((field) => (
<AuthField
key={field.key}
label={field.label}
placeholder={field.placeholder}
type={field.type}
autoComplete={field.autoComplete}
icon={field.icon}
value={formValues[field.key]}
onChange={(event) => updateField(field.key, event.target.value)}
/>
))}

{!isSignUp && (
<div className="flex items-center justify-between gap-4 text-sm">
<label className="flex items-center gap-2 text-slate-600">
<input
type="checkbox"
className="h-4 w-4 rounded border-slate-300 text-blue-600"
/>
Remember Me
</label>

<button type="button" className="font-medium text-blue-600 hover:text-blue-700">
Forgot Password?
</button>
</div>
)}

{statusMessage && (
<div className={`rounded-xl border px-4 py-3 text-sm ${statusClasses}`}>
{statusMessage}
</div>
)}

<button
type="submit"
disabled={isSubmitting}
className="h-12 w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-700 text-base font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
>
{isSubmitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Log In'}
</button>

{!isSignUp && (
<p className="text-center text-sm text-slate-500">Or login with</p>
)}

<p className="text-center text-sm text-slate-500">
{isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
<button
type="button"
onClick={() => setMode(isSignUp ? 'sign-in' : 'sign-up')}
className="font-semibold text-blue-600 hover:text-blue-700"
>
{isSignUp ? 'Sign In' : 'Sign Up'}
</button>
</p>
</form>
</div>
    </section>

    {/* RIGHT SIDE - IMAGE (hidden on mobile/tablet) */}
    <section className="relative hidden overflow-hidden bg-[#eef5ff] lg:flex lg:w-[60%] lg:items-center lg:justify-center">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl" />
      <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-300 opacity-20 blur-3xl" />

      <div className="relative z-10 flex w-full flex-col items-center justify-center px-12 text-center">
        <p className="mb-3 mt-15 text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
          Unlock Your Potential
        </p>

        <h1 className="mb-4 text-5xl font-bold leading-tight text-slate-900 xl:text-6xl">
          Continue your
          <br />
          coding journey
        </h1>

        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          Practice. Learn. Compete. Improve every day with CodeSprint's
          modern learning platform built for aspiring programmers.
        </p>

        <img
          src={leftDecorationImg}
          alt="Coding Illustration"
          className="w-[90%] max-w-[850px] xl:max-w-[1000px] object-contain"
        />
      </div>
    </section>
  </div>
</main>

)
}