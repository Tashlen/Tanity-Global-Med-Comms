(() => {
  'use strict';

  const form = document.querySelector('.enquiry-form');
  if (!form) return;

  const recipient = 'medcomms@tanityglobal.com';
  const localPreview = location.protocol === 'file:';
  const sendButton = form.querySelector('[type="submit"]');
  const draftButton = form.querySelector('[data-draft-button]');
  const deliveryNote = form.querySelector('[data-delivery-note]');
  const status = form.querySelector('[data-status]');
  const draft = document.querySelector('[data-draft]');
  const receipt = document.querySelector('[data-receipt]');
  const draftText = draft.querySelector('#draft-text');
  const copyStatus = draft.querySelector('[data-copy-status]');
  const plainText = draft.querySelector('.enquiry-plain');

  if (localPreview) {
    sendButton.textContent = 'Prepare email draft';
    deliveryNote.textContent = 'This creates a draft for you to send from your email app.';
  } else {
    draftButton.hidden = false;
  }

  const supportField = form.elements.namedItem('support_needed');
  if (supportField) {
    const service = new URLSearchParams(location.search).get('support');
    if (service && service.trim()) {
      supportField.value = service.trim().slice(0, 160);
      const projectField = form.querySelector('#message').closest('.enquiry-field');
      projectField.before(supportField.closest('.enquiry-field'));
    }
  }

  function prepareDraft() {
    if (!form.reportValidity()) return;

    const values = new FormData(form);
    const subject = values.get('_subject');
    const paragraphs = [];
    for (const control of form.elements) {
      if (!control.name || control.name.startsWith('_')) continue;
      const value = String(values.get(control.name) || '').trim();
      if (!value) continue;
      const label = control.labels[0].textContent.replace(/\s*\(optional\)/, '').trim();
      paragraphs.push(`${label}: ${value}`);
    }

    const message = paragraphs.join('\n\n');
    draftText.value = `To: ${recipient}\nSubject: ${subject}\n\n${message}`;
    const mailLink = draft.querySelector('[data-mail-link]');
    mailLink.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message.replace(/\n/g, '\r\n'))}`;
    copyStatus.textContent = '';
    draft.hidden = false;
    draft.querySelector('h2').focus();
  }

  draftButton.addEventListener('click', prepareDraft);
  draft.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draftText.value);
      copyStatus.textContent = 'Email details copied.';
    } catch {
      plainText.open = true;
      draftText.focus();
      draftText.select();
      copyStatus.textContent = 'The email details are selected. Use your device’s Copy command.';
    }
  });

  form.addEventListener('input', () => {
    draft.hidden = true;
    plainText.open = false;
    status.textContent = '';
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (localPreview) {
      prepareDraft();
      return;
    }
    if (sendButton.disabled || !form.reportValidity()) return;

    const data = new FormData(form);
    const controls = Array.from(form.querySelectorAll('input:enabled, select:enabled, textarea:enabled, button:enabled'));
    controls.forEach(control => { control.disabled = true; });
    draft.hidden = true;
    status.textContent = 'Sending…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let received = false;
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (response.ok) {
        const result = await response.json();
        received = result.ok === true || (typeof result.next === 'string' && !result.errors);
      }
    } catch {
      // Keep the completed form available when delivery cannot be confirmed.
    } finally {
      clearTimeout(timeout);
      controls.forEach(control => { control.disabled = false; });
    }

    if (received) {
      status.textContent = '';
      form.hidden = true;
      receipt.hidden = false;
      receipt.querySelector('h2').focus();
    } else {
      status.textContent = 'We couldn’t confirm delivery. You can try again or send the email draft below.';
      prepareDraft();
    }
  });

  receipt.querySelector('[data-another]').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    receipt.hidden = true;
    const extras = form.querySelector('.enquiry-extras');
    if (extras) extras.open = false;
    form.elements.namedItem('name').focus();
  });
})();
