'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function submitMembership(formData: FormData) {
  try {
    const firstName = formData.get('first_name') as string
    const lastName = formData.get('last_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const department = formData.get('department') as string
    const yearOfStudy = formData.get('year_of_study') as string

    // Validate inputs
    if (!firstName || !lastName || !email || !phone || !department || !yearOfStudy) {
      return { success: false, error: 'All fields are required' }
    }

    const payload = {
      timestamp: new Date().toISOString(),
      firstName,
      lastName,
      email,
      phone,
      department,
      year: yearOfStudy
    };

    // Send data to Google Sheets via Apps Script Webhook
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
      
      if (!webhookUrl || webhookUrl === 'paste_your_script_url_here') {
        console.warn('Google Script URL is missing. Bypassing spreadsheet insertion.');
      } else {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook responded with status: ${response.status}`);
        }
      }
    } catch (webhookError) {
      console.error('Failed to send data to Google Sheets:', webhookError);
      return { success: false, error: 'Failed to save application to the database. Please try again later.' };
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: `ISTE MBCET <${fromEmail}>`,
        to: email,
        subject: 'Welcome to ISTE MBCET! 🎉',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #000;">Application Received!</h2>
            <p>Hi ${firstName},</p>
            <p>Thank you for applying to join the ISTE MBCET Student Chapter.</p>
            <p>We have successfully received your application. Our team will review your details and reach out to you within 48 hours to complete the enrollment process.</p>
            <br/>
            <p><strong>Your Details:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${firstName} ${lastName}</li>
              <li><strong>Department:</strong> ${department}</li>
              <li><strong>Year of Study:</strong> ${yearOfStudy}</li>
            </ul>
            <br/>
            <p>Best regards,</p>
            <p><strong>The ISTE MBCET Team</strong></p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // We don't fail the whole request if just the email fails, since the spreadsheet insert succeeded.
    }

    return { success: true }
  } catch (error: any) {
    console.error('Unexpected error during submission:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again later.' }
  }
}
