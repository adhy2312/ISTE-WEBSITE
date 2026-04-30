'use client'

import { useState } from 'react'

// Replace this with your deployed Google Apps Script URL
const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || ''

export default function MembershipForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const firstName = (document.getElementById('fn') as HTMLInputElement).value.trim()
    const lastName = (document.getElementById('ln') as HTMLInputElement).value.trim()
    const email = (document.getElementById('em') as HTMLInputElement).value.trim()
    const phone = (document.getElementById('ph') as HTMLInputElement).value.trim()
    const department = (document.getElementById('dp') as HTMLSelectElement).value
    const year = (document.getElementById('yr') as HTMLSelectElement).value

    const payload = { firstName, lastName, email, phone, department, year }

    try {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      // Google Apps Script with no-cors returns opaque response
      // so we assume success if no network error was thrown
      setStatus('success')
    } catch (err) {
      console.error('Form submission error:', err)
      setErrorMsg('Network error — please check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <div className="mem-form reveal d2">
      {status !== 'success' ? (
        <form id="mem-form" onSubmit={submitForm}>
          <div className="form-head">Apply for Membership</div>
          <div className="form-sub">One-time enrollment &nbsp;·&nbsp; Students only</div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fn">First Name</label>
              <input type="text" id="fn" placeholder="Arjun" required />
            </div>
            <div className="form-group">
              <label htmlFor="ln">Last Name</label>
              <input type="text" id="ln" placeholder="Menon" required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="em">Email Address</label>
            <input type="email" id="em" placeholder="you@mbcet.ac.in" required />
          </div>
          <div className="form-group">
            <label htmlFor="ph">Phone Number</label>
            <input type="tel" id="ph" placeholder="+91 98765 43210" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dp">Department</label>
              <select id="dp" required>
                <option value="">Select</option>
                <option>Computer Science Engineering</option>
                <option>CSE with AI</option>
                <option>Electronics &amp; Communication</option>
                <option>Electrical &amp; Computer Engineering</option>
                <option>Electrical Engineering</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="yr">Year of Study</label>
              <select id="yr" required>
                <option value="">Select</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="form-btn"
            id="form-btn"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Submitting…' : 'Submit Application →'}
          </button>
          {status === 'error' && (
            <div className="form-error">{errorMsg}</div>
          )}
          <div className="form-note">We&apos;ll reach out within 48 hours of submission.</div>
        </form>
      ) : (
        <div className="form-success" id="form-success" style={{ display: 'block' }}>
          <div className="form-success-icon">✓</div>
          <div className="form-success-title">Application Received!</div>
          <div className="form-success-sub">We&apos;ll contact you within 48 hours.</div>
        </div>
      )}
    </div>
  )
}
