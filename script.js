document.getElementById('year').textContent = new Date().getFullYear();

const burger = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');

if(burger){
  burger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

if(navLinks){
  navLinks.querySelectorAll('a').forEach(a => 
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}


/* ================= DEALER APPLICATION FORM ================= */

const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbx8twpPhG_CcZZCpU6bY-0Z_anCNySqn23GZ99Bfg73F75iS2sIo3iVD8jFCRFIgw0/exec";


const form = document.getElementById('dealerForm');
const statusEl = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');


form.addEventListener('submit', async (e) => {

  e.preventDefault();

  statusEl.textContent = "";
  statusEl.classList.remove('error');

  submitBtn.disabled = true;


  const data = Object.fromEntries(
    new FormData(form).entries()
  );


  try {

    await fetch(GOOGLE_SHEET_URL, {

      method: 'POST',

      mode: 'no-cors',

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      body: new URLSearchParams(data)

    });


    // Hide button after successful submission
    submitBtn.style.display = "none";


    // Show success message
    statusEl.textContent = 
    "आवेदन प्राप्त हुआ — हमारी टीम जल्द संपर्क करेगी।";


    form.reset();


  } catch(err) {


    statusEl.textContent = 
    "कुछ गलत हो गया। कृपया पुनः प्रयास करें।";

    statusEl.classList.add('error');


    // Show button again if error occurs
    submitBtn.style.display = "block";


  }


});
