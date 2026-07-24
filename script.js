document.getElementById('year').textContent = new Date().getFullYear();

  const burger = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  /* =====================================================================
     DEALER APPLICATION FORM
     TO CONNECT TO GOOGLE SHEETS (next step):
     1. Create a Google Sheet with columns matching the field names below
        (fullName, phone, email, city, state, investment, message).
     2. In the Sheet: Extensions > Apps Script > add a doPost(e) function
        that appends e.parameter values as a new row, then deploy as a
        Web App (Execute as: Me, Who has access: Anyone).
     3. Paste the deployed Web App URL into GOOGLE_SHEET_URL below.
     ===================================================================== */
  const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbx8twpPhG_CcZZCpU6bY-0Z_anCNySqn23GZ99Bfg73F75iS2sIo3iVD8jFCRFIgw0/exec";

  const form = document.getElementById('dealerForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.classList.remove('error');
    submitBtn.disabled = true;
    submitBtn.textContent = 'भेजा जा रहा है...';

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      if (GOOGLE_SHEET_URL) {
        await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data)
        });
      } else {
        await new Promise(res => setTimeout(res, 900));
      }
      statusEl.textContent = 'आवेदन प्राप्त हुआ — हमारी टीम जल्द संपर्क करेगी।';
      form.reset();
    } catch (err) {
      statusEl.textContent = 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'आवेदन जमा करें';
    }
  });