/* =========================================================================
   Fardexa — shared site behaviour (vanilla JS, no dependencies/build step)
   ========================================================================= */
(function () {
  'use strict';

  /* ---- Footer year ---- */
  document.querySelectorAll('.js-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- Header: shadow/scroll state ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    var closeMenu = function () {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('.material-symbols-outlined').textContent = 'menu';
    };
    var openMenu = function () {
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.material-symbols-outlined').textContent = 'close';
    };
    toggle.addEventListener('click', function () {
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---- Product filter + search (products.html) ---- */
  var filterBar = document.querySelector('[data-product-filters]');
  if (filterBar) {
    var chips = filterBar.querySelectorAll('.filter-chip');
    var searchInput = filterBar.querySelector('input[type="search"], .search-field input');
    var cards = document.querySelectorAll('[data-product]');
    var noResults = document.querySelector('.no-results');
    var activeFilter = 'all';

    var applyFilters = function () {
      var query = (searchInput && searchInput.value.trim().toLowerCase()) || '';
      var visibleCount = 0;
      cards.forEach(function (card) {
        var category = card.getAttribute('data-category') || '';
        var title = (card.getAttribute('data-title') || card.textContent).toLowerCase();
        var matchesFilter = activeFilter === 'all' || category === activeFilter;
        var matchesQuery = !query || title.indexOf(query) !== -1;
        var visible = matchesFilter && matchesQuery;
        card.hidden = !visible;
        if (visible) visibleCount++;
      });
      if (noResults) noResults.classList.toggle('is-visible', visibleCount === 0);
    };

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });
    if (searchInput) searchInput.addEventListener('input', applyFilters);
  }

  /* ---- FAQ: one-open-per-group accordion ---- */
  document.querySelectorAll('.faq-category').forEach(function (group) {
    var items = group.querySelectorAll('details.faq-item');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  /* ---- Copy-to-clipboard (contact info) ---- */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var reset = function (label) {
        setTimeout(function () { btn.textContent = label; }, 1600);
      };
      var original = btn.textContent;
      var mark = function () { btn.textContent = 'کپی شد ✓'; reset(original); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(mark).catch(function () {});
      } else {
        var tmp = document.createElement('textarea');
        tmp.value = text;
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand('copy'); mark(); } catch (err) { /* no-op */ }
        document.body.removeChild(tmp);
      }
    });
  });

  /* ---- Contact form (no backend: opens the user's mail client) ---- */
  var contactForm = document.querySelector('.js-contact-form');
  if (contactForm) {
    var status = contactForm.querySelector('.form-status');
    var showStatus = function (msg, type) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status is-visible ' + type;
    };
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(contactForm);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var subject = (data.get('subject') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !email || !message) {
        showStatus('لطفاً نام، ایمیل و پیام خود را وارد کنید.', 'error');
        return;
      }
      if (!emailPattern.test(email)) {
        showStatus('لطفاً یک آدرس ایمیل معتبر وارد کنید.', 'error');
        return;
      }

      var mailSubject = encodeURIComponent(subject || 'پیام جدید از وبسایت Fardexa');
      var mailBody = encodeURIComponent(
        'نام: ' + name + '\n' +
        'ایمیل: ' + email + '\n\n' +
        message
      );
      window.location.href = 'mailto:info@fardexa.com?subject=' + mailSubject + '&body=' + mailBody;
      showStatus('کلاینت ایمیل شما در حال باز شدن است. اگر پنجره‌ای باز نشد می‌توانید مستقیماً به info@fardexa.com ایمیل بزنید.', 'success');
      contactForm.reset();
    });
  }
})();