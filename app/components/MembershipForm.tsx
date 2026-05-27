'use client'

import { useState, useRef, useEffect } from 'react'
import { submitMembership } from '../actions/membership'
import { useBrain } from '../brain/BrainProvider'

interface MembershipFormProps {
  enabled?: boolean;
  closedMessage?: string;
}

export default function MembershipForm({ enabled = true, closedMessage = "Membership applications are currently closed." }: MembershipFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  
  // Connect to Central Nervous System
  const brain = useBrain()
  const interactionCount = useRef(0)

  // Traffic Monitoring (Membership Engine)
  const handleInteraction = () => {
    interactionCount.current += 1;
    if (interactionCount.current > 5) {
      // Simulate traffic surge to the central brain
      brain.notifyEngine('Membership', 'traffic_surge', { intensity: interactionCount.current });
      interactionCount.current = 0; // reset
    }
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enabled) return;
    
    setStatus('loading')
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)

    try {
      const result = await submitMembership(formData)

      if (result.success) {
        setStatus('success')
      } else {
        setErrorMsg(result.error || 'Failed to submit application.')
        setStatus('error')
      }
    } catch (err) {
      console.error('Form submission error:', err)
      setErrorMsg('An unexpected error occurred — please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="mem-form reveal d2">
      {!enabled ? (
        <div className="form-success" style={{ display: 'block', textAlign: 'center', padding: '40px 20px' }}>
          <div className="form-success-icon" style={{ borderColor: 'var(--border)', color: 'var(--g400)' }}>⨯</div>
          <div className="form-success-title" style={{ color: 'var(--g200)' }}>Currently Closed</div>
          <div className="form-success-sub" style={{ marginTop: '12px', fontSize: '0.9rem' }}>{closedMessage}</div>
        </div>
      ) : status !== 'success' ? (
        <form id="mem-form" onSubmit={submitForm} onChange={handleInteraction} onFocus={handleInteraction}>
          <div className="form-head">Apply for Membership</div>
          <div className="form-sub">One-time enrollment &nbsp;·&nbsp; Students only</div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fn">First Name</label>
              <input type="text" id="fn" name="first_name" placeholder="Arjun" required />
            </div>
            <div className="form-group">
              <label htmlFor="ln">Last Name</label>
              <input type="text" id="ln" name="last_name" placeholder="Menon" required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="em">Email Address</label>
            <input type="email" id="em" name="email" placeholder="you@mbcet.ac.in" required />
          </div>
          <div className="form-group">
            <label htmlFor="ph">Phone Number</label>
            <input type="tel" id="ph" name="phone" placeholder="+91 98765 43210" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dp">Department</label>
              <select id="dp" name="department" required>
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
              <select id="yr" name="year_of_study" required>
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
