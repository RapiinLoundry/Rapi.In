/**
 * Rapi.In Laundry — Landing Page JavaScript
 *
 * 1. Navbar scroll state
 * 2. Mobile hamburger
 * 3. Smooth scroll (navbar-offset aware)
 * 4. Active nav highlight on scroll
 * 5. FAQ accordion
 * 6. Scroll-reveal (IntersectionObserver)
 * 7. Early Access modal (open / close / ESC / backdrop)
 * 8. Privacy Policy modal
 * 9. Registration form — submits to Google Apps Script → Google Sheets
 */
'use strict';

/* ================================================================
   KONFIGURASI — EDIT DI SINI JIKA URL BERUBAH
   ================================================================ */
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxRZYdOyFM-o-g_p3jqvPtyqPYvEY4ZTZtPhFo8Mt0d81jcl__4Xv6f0uiGyRRhpxN8Vw/exec';


/* ── 1. Navbar scroll ── */
const navbar = document.getElementById('navbar');
const syncNav = () => navbar.classList.toggle('scrolled', window.scrollY > 30);
syncNav();
window.addEventListener('scroll', syncNav, { passive: true });


/* ── 2. Mobile hamburger ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');

hamburger?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu navigasi');
});
mobileNav?.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    hamburger?.setAttribute('aria-label', 'Buka menu navigasi');
  });
});


/* ── 3. Smooth scroll ── */
const NAV_H = 72;
document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (a.classList.contains('privacy-trigger') || a.classList.contains('early-access-trigger')) return;
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - NAV_H,
      behavior: 'smooth',
    });
  });
});


/* ── 4. Active nav link ── */
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a[href^="#"]');
const sObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navAs.forEach(a => {
      const active = a.getAttribute('href') === `#${e.target.id}`;
      a.style.color      = active ? 'var(--cta)' : '';
      a.style.fontWeight = active ? '800' : '';
    });
  });
}, { rootMargin: `-${NAV_H}px 0px -55% 0px`, threshold: 0 });
sections.forEach(s => sObs.observe(s));


/* ── 5. FAQ accordion ── */
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    item.closest('.faq-wrap')?.querySelectorAll('.faq-item.open').forEach(o => {
      if (o !== item) {
        o.classList.remove('open');
        o.querySelector('.faq-btn')?.setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});


/* ── 6. Scroll-reveal ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    revObs.unobserve(e.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));


/* ── 7 & 8. Modal helpers ── */
const FOCUSABLE = 'button:not([disabled]),input:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';

function openModal(el) {
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => el.querySelector(FOCUSABLE)?.focus(), 80);
}
function closeModal(el, resetFn) {
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  resetFn?.();
}
function trapFocus(box) {
  box.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const all   = [...box.querySelectorAll(FOCUSABLE)];
    const first = all[0];
    const last  = all[all.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  });
}

// ESC closes any open modal
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal-bd.open').forEach(m => closeModal(m));
});
// Backdrop click
document.querySelectorAll('.modal-bd').forEach(bd => {
  bd.addEventListener('click', e => { if (e.target === bd) closeModal(bd); });
});

/* Registration modal */
const regModal      = document.getElementById('reg-modal');
const regModalBox   = document.getElementById('reg-modal-box');
const regModalClose = document.getElementById('reg-modal-close');

document.querySelectorAll('.early-access-trigger').forEach(btn => {
  btn.addEventListener('click', () => openModal(regModal));
});
regModalClose?.addEventListener('click', () => closeModal(regModal, resetModalForm));
trapFocus(regModalBox);

/* Privacy modal */
const privModal      = document.getElementById('privacy-modal');
const privModalClose = document.getElementById('privacy-modal-close');

document.querySelectorAll('.privacy-trigger').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); openModal(privModal); });
});
privModalClose?.addEventListener('click', () => closeModal(privModal));


/* ================================================================
   9. REGISTRATION FORM — Kirim data ke Google Sheets via Apps Script
   ================================================================ */

/**
 * Tampilkan status loading pada tombol submit.
 */
function setSubmitLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.textContent = 'Mengirim...';
    btn.classList.remove('active');
  } else {
    btn.disabled = false;
    btn.setAttribute('aria-disabled', 'false');
    btn.classList.add('active');
  }
}

/**
 * Tampilkan pesan sukses — sembunyikan form, tampilkan konfirmasi.
 */
function showSuccess(form, notice) {
  // Sembunyikan semua input & tombol
  form.querySelectorAll('.form-grp, .btn-submit').forEach(el => {
    el.style.display = 'none';
  });

  // Update notice jadi pesan sukses
  if (notice) {
    notice.style.display     = 'flex';
    notice.style.background  = '#d1fae5';
    notice.style.borderColor = '#10b981';
    notice.style.color       = '#065f46';
    notice.style.fontWeight  = '600';
    notice.style.padding     = '.9rem 1.1rem';
    notice.innerHTML = '✅ <strong>Pendaftaran berhasil!</strong>&nbsp; Kami akan menghubungi kamu sebelum peluncuran. Terima kasih sudah daftar!';
    notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Tampilkan pesan error jaringan / server.
 */
function showError(submitBtn, submitBtnOriginalText, notice) {
  // Kembalikan tombol ke kondisi semula
  submitBtn.disabled = false;
  submitBtn.setAttribute('aria-disabled', 'false');
  submitBtn.textContent = submitBtnOriginalText;
  submitBtn.classList.add('active');

  if (notice) {
    notice.style.display     = 'flex';
    notice.style.background  = '#fee2e2';
    notice.style.borderColor = '#ef4444';
    notice.style.color       = '#7f1d1d';
    notice.style.fontWeight  = '600';
    notice.innerHTML = '❌ <strong>Gagal mengirim.</strong>&nbsp; Coba lagi dalam beberapa saat.';
  }
}

/**
 * Wire a registration form:
 * - Validasi client-side
 * - Kirim ke Google Apps Script (→ Google Sheets)
 * - Tampilkan sukses / error
 */
function wireForm({ form, nameIn, igIn, nameErr, igErr, submitBtn, notice }) {
  if (!form) return;

  /* Sync tombol submit — aktif hanya jika kedua field terisi */
  function sync() {
    const ok = nameIn.value.trim() !== '' && igIn.value.trim() !== '';
    submitBtn.disabled = !ok;
    submitBtn.setAttribute('aria-disabled', String(!ok));
    submitBtn.classList.toggle('active', ok);
  }

  /* Validasi satu field */
  function validate(input, errEl, msg) {
    if (!input.value.trim()) {
      input.classList.add('invalid');
      errEl.textContent = msg;
      errEl.classList.add('show');
      return false;
    }
    input.classList.remove('invalid');
    errEl.classList.remove('show');
    return true;
  }

  nameIn.addEventListener('input', () => {
    nameIn.classList.remove('invalid');
    nameErr.classList.remove('show');
    sync();
  });
  igIn.addEventListener('input', () => {
    igIn.classList.remove('invalid');
    igErr.classList.remove('show');
    sync();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    /* Validasi dua field */
    const ok1 = validate(nameIn, nameErr, 'Nama lengkap tidak boleh kosong.');
    const ok2 = validate(igIn,   igErr,   'Username Instagram tidak boleh kosong.');
    if (!ok1 || !ok2) return;

    /* Simpan teks asli tombol sebelum diganti "Mengirim..." */
    const originalBtnText = submitBtn.textContent;

    /* Tampilkan loading */
    setSubmitLoading(submitBtn, true);

    /* Sembunyikan notice lama */
    if (notice) notice.style.display = 'none';

    /* Siapkan payload */
    const payload = {
      fullName:          nameIn.value.trim(),
      instagramUsername: igIn.value.trim(),
      timestamp:         new Date().toISOString(),
    };

    try {
      /*
       * Kirim ke Google Apps Script.
       * Mode 'no-cors' diperlukan karena Google Apps Script
       * tidak mengirimkan header CORS yang sesuai.
       * Response tidak bisa dibaca (opaque), tapi data tetap terkirim.
       */
      await fetch(APPS_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      /* Fetch dengan mode no-cors selalu "berhasil" secara teknis.
         Anggap sukses jika tidak ada exception. */
      showSuccess(form, notice);

    } catch (err) {
      /* Error jaringan (offline, CORS block, dsb.) */
      showError(submitBtn, originalBtnText, notice);
    }
  });

  /* Reset — dipanggil saat modal ditutup */
  form._reset = () => {
    form.reset();
    sync();
    [nameIn, igIn].forEach(i => i.classList.remove('invalid'));
    [nameErr, igErr].forEach(el => el.classList.remove('show'));

    // Tampilkan kembali semua field yang mungkin disembunyikan oleh showSuccess
    form.querySelectorAll('.form-grp, .btn-submit').forEach(el => {
      el.style.display = '';
    });

    if (notice) {
      notice.style.cssText = '';
      notice.style.display = 'none';
    }
  };
}

/* ── Wire inline form (Section 6) ── */
wireForm({
  form:      document.getElementById('ea-form'),
  nameIn:    document.getElementById('ea-name'),
  igIn:      document.getElementById('ea-ig'),
  nameErr:   document.getElementById('ea-err-name'),
  igErr:     document.getElementById('ea-err-ig'),
  submitBtn: document.getElementById('ea-submit'),
  notice:    document.getElementById('ea-notice'),
});

/* ── Wire modal form ── */
wireForm({
  form:      document.getElementById('modal-form'),
  nameIn:    document.getElementById('m-name'),
  igIn:      document.getElementById('m-ig'),
  nameErr:   document.getElementById('m-err-name'),
  igErr:     document.getElementById('m-err-ig'),
  submitBtn: document.getElementById('modal-submit'),
  notice:    document.getElementById('modal-notice'),
});

function resetModalForm() {
  document.getElementById('modal-form')?._reset?.();
}
