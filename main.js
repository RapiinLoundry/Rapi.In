/**
 * Rapi.In Laundry — Landing Page JavaScript
 *
 * Features:
 *  1. Navbar scroll state (transparent hero → frosted white)
 *  2. Mobile navigation hamburger toggle
 *  3. Smooth scroll with navbar offset
 *  4. Active section highlight in nav
 *  5. FAQ accordion
 *  6. Scroll-reveal (IntersectionObserver)
 *  7. Book Now modal — open / close / ESC / backdrop click
 *  8. Registration form — client-side validation preview
 *     (NO backend, NO data submission, NO external integration)
 *
 * ─── FUTURE INTEGRATION NOTE ────────────────────────────────────
 *  Search for "FUTURE_INTEGRATION_POINT" in this file and in
 *  index.html to find the exact location where a real backend
 *  endpoint, Google Form URL, or external service should be wired.
 * ────────────────────────────────────────────────────────────────
 */

'use strict';

/* ============================================================
   1. Navbar — scroll state
   ============================================================ */

const navbar = document.getElementById('navbar');

function syncNavbar() {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}

syncNavbar(); // run on load (page may be refreshed mid-scroll)
window.addEventListener('scroll', syncNavbar, { passive: true });


/* ============================================================
   2. Mobile navigation — hamburger
   ============================================================ */

const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu   = document.getElementById('mobile-menu');

hamburgerBtn?.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', String(open));
  hamburgerBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu navigasi');
});

// Close when any link or button in the mobile menu is tapped
mobileMenu?.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Buka menu navigasi');
  });
});


/* ============================================================
   3. Smooth scroll with fixed navbar offset
   ============================================================ */

const NAV_HEIGHT = 80; // px — matches #navbar height

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id     = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });
});


/* ============================================================
   4. Active nav link on scroll
   ============================================================ */

const sections   = document.querySelectorAll('section[id]');
const navLinks   = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObs = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.style.color = active && navbar.classList.contains('scrolled')
          ? 'var(--deep-blue)' : '';
        link.style.fontWeight = active ? '800' : '';
      });
    });
  },
  { rootMargin: `-${NAV_HEIGHT}px 0px -55% 0px`, threshold: 0 }
);

sections.forEach(s => sectionObs.observe(s));


/* ============================================================
   5. FAQ accordion
   ============================================================ */

document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      if (openItem !== item) {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle current
    item.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
});


/* ============================================================
   6. Scroll-reveal
   ============================================================ */

const revealObs = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target); // fire once only
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ============================================================
   7. Book Now modal — open / close
   ============================================================ */

const modalOverlay = document.getElementById('modal-overlay');
const modalBox     = document.getElementById('modal-box');
const closeBtn     = document.getElementById('modal-close-btn');
const bookBtns     = document.querySelectorAll('.book-now-trigger');

/** Elements to trap focus within the modal */
const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function openModal() {
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Move focus into modal
  setTimeout(() => {
    const first = modalBox.querySelector(FOCUSABLE);
    first?.focus();
  }, 80);
}

function closeModal() {
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  resetForm();
}

bookBtns.forEach(btn => btn.addEventListener('click', openModal));
closeBtn?.addEventListener('click', closeModal);

// Close on backdrop click (outside modal box)
modalOverlay?.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

// Close on ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

// Basic focus trap inside modal
modalBox?.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusable = [...modalBox.querySelectorAll(FOCUSABLE)];
  const first     = focusable[0];
  const last      = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
});


/* ============================================================
   8. Registration form — client-side validation preview only
      FRONTEND DEMO — NO BACKEND, NO DATA SUBMISSION
   ============================================================ */

const form          = document.getElementById('reg-form');
const nameInput     = document.getElementById('field-name');
const igInput       = document.getElementById('field-instagram');
const submitBtn     = document.getElementById('submit-btn');
const nameError     = document.getElementById('error-name');
const igError       = document.getElementById('error-instagram');

/** Update submit button state based on field values */
function syncSubmitState() {
  const filled = nameInput.value.trim() !== '' && igInput.value.trim() !== '';
  submitBtn.disabled = !filled;
  submitBtn.setAttribute('aria-disabled', String(!filled));
  submitBtn.classList.toggle('ready', filled);
}

nameInput?.addEventListener('input', () => {
  nameInput.classList.remove('error');
  nameError.classList.remove('visible');
  syncSubmitState();
});

igInput?.addEventListener('input', () => {
  igInput.classList.remove('error');
  igError.classList.remove('visible');
  syncSubmitState();
});

/** Validate a single field — returns true if valid */
function validateField(input, errorEl, errorMsg) {
  if (input.value.trim() === '') {
    input.classList.add('error');
    errorEl.textContent = errorMsg;
    errorEl.classList.add('visible');
    return false;
  }
  input.classList.remove('error');
  errorEl.classList.remove('visible');
  return true;
}

form?.addEventListener('submit', e => {
  e.preventDefault(); // Always prevent — this is a frontend preview only

  const nameOk = validateField(nameInput, nameError, 'Nama lengkap tidak boleh kosong.');
  const igOk   = validateField(igInput,   igError,   'Username Instagram tidak boleh kosong.');

  if (!nameOk || !igOk) return;

  /**
   * FUTURE_INTEGRATION_POINT
   * ──────────────────────────────────────────────────────────
   * When backend / external form service is ready:
   *
   *   const endpoint = form.dataset.action; // set via data-action attribute
   *   fetch(endpoint, {
   *     method: 'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body: JSON.stringify({
   *       fullName:          nameInput.value.trim(),
   *       instagramUsername: igInput.value.trim(),
   *     }),
   *   })
   *   .then(res => { if (!res.ok) throw new Error(); return res.json(); })
   *   .then(data => { showSuccessState(); })
   *   .catch(() => { showErrorState(); });
   *
   * For now, the submission is intentionally a no-op.
   * ──────────────────────────────────────────────────────────
   */

  // Show preview-only message instead of a fake success claim
  showPreviewState();
});

function showPreviewState() {
  const wrap = form.closest('.modal-box');
  const previewNote = wrap.querySelector('.modal-preview-note');
  if (previewNote) {
    previewNote.style.background = '#dbeafe';
    previewNote.style.borderColor = 'var(--sky-blue)';
    previewNote.style.color = '#1e40af';
    previewNote.innerHTML = '🛠️ <strong>Form Preview Mode</strong> — Pendaftaran resmi belum aktif. Tersambung ke sistem pendaftaran saat peluncuran.';
    previewNote.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function resetForm() {
  if (!form) return;
  form.reset();
  syncSubmitState();

  // Reset field error states
  [nameInput, igInput].forEach(input => {
    input.classList.remove('error');
  });
  [nameError, igError].forEach(el => el.classList.remove('visible'));

  // Reset preview note
  const previewNote = form.closest('.modal-box')?.querySelector('.modal-preview-note');
  if (previewNote) {
    previewNote.style.cssText = '';
    previewNote.innerHTML = '⚠️ <strong>Form preview</strong> — Pendaftaran resmi coming soon.';
  }
}
