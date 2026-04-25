const form = document.getElementById('delete-request-form')
const status = document.getElementById('delete-request-status')
const submitButton = form?.querySelector('button[type="submit"]')

const setStatus = (message, tone = 'muted') => {
  if (!status) return
  status.textContent = message
  status.dataset.tone = tone
}

if (form instanceof HTMLFormElement) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const emailInput = document.getElementById('delete-email')
    if (!(emailInput instanceof HTMLInputElement)) return

    const cleanEmail = emailInput.value.trim()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setStatus('Enter the email tied to your Oriah account.', 'error')
      emailInput.focus()
      return
    }

    const nameInput = document.getElementById('delete-name')
    const accountIdInput = document.getElementById('delete-account-id')
    const platformInput = document.getElementById('delete-platform')
    const detailsInput = document.getElementById('delete-details')

    const payload = {
      email: cleanEmail,
      name: nameInput instanceof HTMLInputElement ? nameInput.value.trim() : '',
      account_id:
        accountIdInput instanceof HTMLInputElement
          ? accountIdInput.value.trim()
          : '',
      platform:
        platformInput instanceof HTMLSelectElement
          ? platformInput.value.trim()
          : '',
      details:
        detailsInput instanceof HTMLTextAreaElement
          ? detailsInput.value.trim()
          : '',
      _subject: 'Oriah Delete Account Request',
      _captcha: 'false',
      message: [
        'Delete-account request submitted from joinoriah.com/delete-account.',
        `Account email: ${cleanEmail}`,
        `Full name: ${nameInput instanceof HTMLInputElement ? nameInput.value.trim() || 'Not provided' : 'Not provided'}`,
        `User ID or username: ${accountIdInput instanceof HTMLInputElement ? accountIdInput.value.trim() || 'Not provided' : 'Not provided'}`,
        `Platform: ${platformInput instanceof HTMLSelectElement ? platformInput.value.trim() || 'Not provided' : 'Not provided'}`,
        `Details: ${detailsInput instanceof HTMLTextAreaElement ? detailsInput.value.trim() || 'Not provided' : 'Not provided'}`,
      ].join('\n'),
    }

    submitButton?.setAttribute('disabled', 'disabled')
    setStatus('Sending request...', 'muted')

    try {
      const response = await fetch(
        'https://formsubmit.co/ajax/privacy@joinoriah.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        throw new Error('Request failed')
      }

      form.reset()
      setStatus(
        'Request sent. We will review it and contact you at that email address if verification is needed.',
        'success',
      )
    } catch {
      setStatus(
        'Could not send the request right now. Email privacy@joinoriah.com if this continues.',
        'error',
      )
    } finally {
      submitButton?.removeAttribute('disabled')
    }
  })
}
