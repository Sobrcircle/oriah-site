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

    // 2026-08-18 — posts to our own /api/delete-account instead of
    // formsubmit.co. Two reasons: joinoriah.com has no MX records, so mail to
    // privacy@joinoriah.com could never arrive and every request submitted
    // here was silently dropped while the page said "Request sent"; and it
    // handed a third party the exact data class the request is about.
    // Server builds the message body now — the client only reports fields.
    const payload = {
      email: cleanEmail,
      name: nameInput instanceof HTMLInputElement ? nameInput.value.trim() : '',
      accountId:
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
    }

    submitButton?.setAttribute('disabled', 'disabled')
    setStatus('Sending request...', 'muted')

    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

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
        'Could not send the request right now. Email oriah@moradilabs.com if this continues.',
        'error',
      )
    } finally {
      submitButton?.removeAttribute('disabled')
    }
  })
}
