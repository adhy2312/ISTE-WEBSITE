'use client'

export default function MembershipForm() {
  const submitForm = (e: React.FormEvent) => {
    e.preventDefault()
    const form = document.getElementById('mem-form')
    const success = document.getElementById('form-success')
    if (form && success) {
      form.style.display = 'none'
      success.style.display = 'block'
    }
  }

  return (
    <div className="mem-form reveal d2">
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
        <button type="submit" className="form-btn" id="form-btn">Submit Application →</button>
        <div className="form-note">We&apos;ll reach out within 48 hours of submission.</div>
      </form>
      <div className="form-success" id="form-success">
        <div className="form-success-icon">✓</div>
        <div className="form-success-title">Application Received!</div>
        <div className="form-success-sub">We&apos;ll contact you within 48 hours.</div>
      </div>
    </div>
  )
}
