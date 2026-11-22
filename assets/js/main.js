(function () {
    'use strict';

   function getUtmParams() {
         var params = new URLSearchParams(window.location.search);
         var utm = {};
         ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
                 if (params.has(key)) utm[key] = params.get(key);
         });
         return utm;
   }

   var form = document.getElementById('booking-form');
    var requestTypeRadios = form ? form.querySelectorAll('input[name="requestType"]') : [];
    var submitBtn = document.getElementById('submit-btn');

   function setRequestType(type) {
         requestTypeRadios.forEach(function (radio) {
                 radio.checked = (radio.value === type);
         });
         updateSubmitLabel();
   }

   function updateSubmitLabel() {
         var selected = form.querySelector('input[name="requestType"]:checked');
         if (!selected || !submitBtn) return;
         submitBtn.textContent = selected.value === 'certificate' ? 'Замовити сертифікат' : 'Записатися на SPA';
   }

   requestTypeRadios.forEach(function (radio) {
         radio.addEventListener('change', updateSubmitLabel);
   });

   var selectedProgramName = null;

   document.querySelectorAll('.js-scroll-to-form').forEach(function (btn) {
         btn.addEventListener('click', function () {
                 var type = btn.getAttribute('data-request-type');
                 if (type) setRequestType(type);
                 selectedProgramName = btn.getAttribute('data-program-name') || null;
                 var target = document.getElementById('form');
                 if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 var nameInput = document.getElementById('name');
                 if (nameInput) {
                           window.setTimeout(function () { nameInput.focus({ preventScroll: true }); }, 600);
                 }
         });
   });

   document.querySelectorAll('.js-scroll-link').forEach(function (link) {
         link.addEventListener('click', function (e) {
                 var href = link.getAttribute('href');
                 if (href && href.charAt(0) === '#') {
                           var target = document.querySelector(href);
                           if (target) {
                                       e.preventDefault();
                                       target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                           }
                 }
         });
   });

   document.querySelectorAll('.faq__question').forEach(function (btn) {
         var answer = btn.nextElementSibling;
         btn.addEventListener('click', function () {
                 var isOpen = btn.getAttribute('aria-expanded') === 'true';
                 document.querySelectorAll('.faq__question').forEach(function (other) {
                           if (other !== btn) {
                                       other.setAttribute('aria-expanded', 'false');
                                       other.nextElementSibling.style.maxHeight = null;
                           }
                 });
                 btn.setAttribute('aria-expanded', String(!isOpen));
                 answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
         });
   });

   document.querySelectorAll('.program__toggle').forEach(function (btn) {
         var details = btn.nextElementSibling;
         btn.addEventListener('click', function () {
                 var isOpen = btn.getAttribute('aria-expanded') === 'true';
                 btn.setAttribute('aria-expanded', String(!isOpen));
                 details.style.maxHeight = isOpen ? null : details.scrollHeight + 'px';
         });
   });

   var phoneInput = document.getElementById('phone');

   function formatUaPhone(raw) {
         var digits = raw.replace(/\D/g, '');
         if (digits.startsWith('380')) {
                 digits = digits.slice(3);
         }
         while (digits.startsWith('0')) {
                 digits = digits.slice(1);
         }
         digits = digits.slice(0, 9);
         var out = '+380';
         if (digits.length > 0) out += ' ' + digits.slice(0, 2);
         if (digits.length > 2) out += ' ' + digits.slice(2, 5);
         if (digits.length > 5) out += ' ' + digits.slice(5, 7);
         if (digits.length > 7) out += ' ' + digits.slice(7, 9);
         return out.trim();
   }

   if (phoneInput) {
         phoneInput.addEventListener('focus', function () {
                 if (!phoneInput.value) phoneInput.value = '+380 ';
         });
         phoneInput.addEventListener('input', function () {
                 var cursorAtEnd = phoneInput.selectionStart === phoneInput.value.length;
                 phoneInput.value = formatUaPhone(phoneInput.value);
                 if (cursorAtEnd) {
                           phoneInput.selectionStart = phoneInput.selectionEnd = phoneInput.value.length;
                 }
         });
   }

   function isValidUaPhone(value) {
         var digits = value.replace(/\D/g, '');
         return /^380\d{9}$/.test(digits);
   }

   var nameInput = document.getElementById('name');
    var consentInput = document.getElementById('consent');
    var resultBox = document.getElementById('form-result');
    var isSubmitting = false;

   function showFieldError(input, errorId, message) {
         var errorEl = document.getElementById(errorId);
         if (message) {
                 input.classList.add('is-invalid');
                 if (errorEl) errorEl.textContent = message;
                 return false;
         }
         input.classList.remove('is-invalid');
         if (errorEl) errorEl.textContent = '';
         return true;
   }

   function validateForm() {
         var valid = true;
         if (!nameInput.value.trim()) {
                 showFieldError(nameInput, 'name-error', "Будь ласка, вкажіть ваше ім'я");
                 valid = false;
         } else {
                 showFieldError(nameInput, 'name-error', '');
         }
         if (!phoneInput.value.trim() || phoneInput.value.trim() === '+380') {
                 showFieldError(phoneInput, 'phone-error', 'Будь ласка, вкажіть номер телефону');
                 valid = false;
         } else if (!isValidUaPhone(phoneInput.value)) {
                 showFieldError(phoneInput, 'phone-error', 'Перевірте формат номера: +380 XX XXX XX XX');
                 valid = false;
         } else {
                 showFieldError(phoneInput, 'phone-error', '');
         }
         var consentError = document.getElementById('consent-error');
         if (!consentInput.checked) {
                 consentError.textContent = 'Потрібна згода на обробку персональних даних';
                 valid = false;
         } else {
                 consentError.textContent = '';
         }
         return valid;
   }

   if (form) {
         form.addEventListener('submit', function (e) {
                 e.preventDefault();
                 if (isSubmitting) return;
                 if (!validateForm()) {
                           resultBox.className = 'form__result';
                           return;
                 }
                 isSubmitting = true;
                 submitBtn.disabled = true;
                 var leadPayload = {
                           name: nameInput.value.trim(),
                           phone: phoneInput.value.trim(),
                           requestType: form.querySelector('input[name="requestType"]:checked').value,
                           program: selectedProgramName || null,
                           timestamp: new Date().toISOString(),
                           source: document.referrer || null,
                           utm: getUtmParams()
                 };
if (typeof fbq === 'function') {
    fbq('track', 'Lead');
}

             fetch('https://retreat-lead.grozalesha078.workers.dev/', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify(leadPayload)
             })
             .then(function (res) {
                 if (!res.ok) throw new Error('Lead request failed');
                 resultBox.className = 'form__result is-success';
                 resultBox.textContent = 'Дякуємо! Заявку надіслано, ми зв\'яжемося з вами найближчим часом.';
             })
             .catch(function () {
                 resultBox.className = 'form__result is-error';
                 resultBox.textContent = 'Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте нам напряму.';
             })
             .finally(function () {
                 isSubmitting = false;
                 submitBtn.disabled = false;
             });
         });
   }

   var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
          var observer = new IntersectionObserver(function (entries) {
                  entries.forEach(function (entry) {
                            if (entry.isIntersecting) {
                                        entry.target.classList.add('is-visible');
                                        observer.unobserve(entry.target);
                            }
                  });
          }, { threshold: 0.12 });
          document.querySelectorAll('[data-animate]').forEach(function (el) {
                  observer.observe(el);
          });
    } else {
          document.querySelectorAll('[data-animate]').forEach(function (el) {
                  el.classList.add('is-visible');
          });
    }

   var stickyCta = document.getElementById('sticky-cta');
    var heroEl = document.getElementById('hero');
    var formEl = document.getElementById('form');

   if (stickyCta && heroEl && formEl) {
         function updateStickyCta() {
                 var heroBottom = heroEl.getBoundingClientRect().bottom;
                 var formTop = formEl.getBoundingClientRect().top;
                 var viewportH = window.innerHeight;
                 var pastHero = heroBottom < viewportH * 0.3;
                 var reachedForm = formTop < viewportH * 0.85;
                 if (pastHero && !reachedForm) {
                           stickyCta.classList.add('is-visible');
                 } else {
                           stickyCta.classList.remove('is-visible');
                 }
         }
         updateStickyCta();
         window.addEventListener('scroll', updateStickyCta, { passive: true });
         window.addEventListener('resize', updateStickyCta);
   }
})();
