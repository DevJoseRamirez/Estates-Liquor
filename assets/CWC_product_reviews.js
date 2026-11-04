(function () {
  'use strict';

  // Judge.me's public review feed (the same one its own widget reads); no API key, CORS-enabled
  const FEED_URL = 'https://cdn.judge.me/reviews/reviews_for_widget';
  // Where Judge.me's own review form posts; a plain multipart POST, no API key
  const SUBMIT_URL = 'https://api.judge.me/api/v1/reviews';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function initSection(sectionEl) {
    if (!sectionEl || sectionEl.dataset.cwcReady === 'true') return;
    sectionEl.dataset.cwcReady = 'true';

    initWriteReview(sectionEl);

    const list = sectionEl.querySelector('[data-review-list]');
    if (!list || !sectionEl.dataset.productId || !sectionEl.dataset.shopDomain) return;

    const state = {
      page: 0,
      totalPages: 1,
      shown: 0,
      total: parseInt(sectionEl.dataset.reviewTotal, 10) || 0,
      perLoad: parseInt(sectionEl.dataset.perLoad, 10) || 5,
      loading: false,
    };

    const moreButton = sectionEl.querySelector('[data-show-more]');
    if (moreButton) {
      moreButton.addEventListener('click', function () {
        loadPage(sectionEl, list, state);
      });
    }

    // Server had no review count: ask the feed straight away (a hidden section never scrolls into view)
    if (sectionEl.hasAttribute('data-needs-feed')) {
      loadPage(sectionEl, list, state);
      return;
    }

    // Otherwise only fetch once the shopper gets near the reviews
    whenVisible(sectionEl, function () {
      loadPage(sectionEl, list, state);
    });
  }

  function whenVisible(el, callback) {
    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        observer.disconnect();
        callback();
      }
    }, { rootMargin: '400px 0px' });
    observer.observe(el);
  }

  /* ---------- Judge.me feed ---------- */

  function feedUrl(sectionEl, page, perPage) {
    const domain = sectionEl.dataset.shopDomain;
    const params = new URLSearchParams({
      url: domain,
      shop_domain: domain,
      platform: 'shopify',
      product_id: sectionEl.dataset.productId,
      page: String(page),
      per_page: String(perPage),
    });
    return FEED_URL + '?' + params.toString();
  }

  function loadPage(sectionEl, list, state) {
    if (state.loading || state.page >= state.totalPages) return;
    state.loading = true;
    updateMore(sectionEl, state);

    fetch(feedUrl(sectionEl, state.page + 1, state.perLoad))
      .then(function (response) {
        if (!response.ok) throw new Error('Judge.me feed ' + response.status);
        return response.json();
      })
      .then(function (data) {
        state.page += 1;
        if (data.pagination && data.pagination.total_pages) state.totalPages = data.pagination.total_pages;
        if (typeof data.number_of_reviews === 'number') state.total = data.number_of_reviews;
        if (state.page === 1) {
          if (sectionEl.hasAttribute('data-needs-feed') && state.total > 0) fillSummary(sectionEl, data);
          fillHistogram(sectionEl, data.histogram);
        }

        (data.reviews || []).forEach(function (review) {
          list.appendChild(buildReview(normalize(review), sectionEl));
          state.shown += 1;
        });
      })
      .catch(function () {
        // Feed unreachable: leave the summary, drop the empty list chrome
        if (state.page === 0) state.totalPages = 0;
      })
      .then(function () {
        state.loading = false;
        render(sectionEl, state);
      });
  }

  // Judge.me sends titles HTML-escaped and bodies as HTML; reduce both to plain text
  function decode(html) {
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body;
  }

  function normalize(review) {
    const body = decode(review.body_html);
    let paragraphs = Array.prototype.map.call(body.querySelectorAll('p'), function (p) {
      return p.textContent.replace(/\s+/g, ' ').trim();
    }).filter(Boolean);
    if (!paragraphs.length && body.textContent.trim()) paragraphs = [body.textContent.replace(/\s+/g, ' ').trim()];

    return {
      rating: parseFloat(review.rating) || 0,
      author: review.is_anonymous_reviewer ? '' : decode(review.reviewer_name).textContent.trim(),
      verified: review.verified_buyer === true,
      date: review.created_at || '',
      title: decode(review.title).textContent.trim(),
      body: paragraphs,
    };
  }

  // Server-side count was missing: build the score from the feed and reveal the section
  function fillSummary(sectionEl, data) {
    const rating = parseFloat(data.average_rating) || 0;
    const count = data.number_of_reviews;

    const score = sectionEl.querySelector('[data-score]');
    if (score) score.textContent = (Math.round(rating * 10) / 10).toFixed(1);

    const stars = sectionEl.querySelector('[data-score-stars]');
    if (stars) {
      stars.style.setProperty('--rating', Math.min(rating * 20, 100) + '%');
      stars.setAttribute('aria-label', rating.toFixed(1) + ' out of 5 stars');
    }

    const countEl = sectionEl.querySelector('[data-count]');
    if (countEl) {
      const label = count === 1 ? sectionEl.dataset.countSingular : sectionEl.dataset.countPlural;
      countEl.textContent = count + ' ' + (label || '');
    }

    sectionEl.querySelectorAll('[data-has-reviews]').forEach(function (node) { node.hidden = false; });
    const empty = sectionEl.querySelector('[data-empty]');
    if (empty) empty.hidden = true;
    sectionEl.classList.remove('cwc_product-reviews--empty');
    sectionEl.hidden = false;
  }

  // Fills the star breakdown from the feed when the product metafield didn't carry one
  function fillHistogram(sectionEl, histogram) {
    if (!sectionEl.querySelector('[data-histogram-pending]') || !Array.isArray(histogram)) return;
    histogram.forEach(function (entry) {
      const row = sectionEl.querySelector('[data-star="' + entry.rating + '"]');
      if (!row) return;
      const count = row.querySelector('[data-histogram-count]');
      const bar = row.querySelector('[data-histogram-bar]');
      if (count) count.textContent = entry.frequency || 0;
      if (bar) bar.style.width = (entry.percentage || 0) + '%';
    });
  }

  /* ---------- Rendering ---------- */

  function formatDate(value, format) {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    if (format === 'long') return MONTHS[month] + ' ' + day + ', ' + year;
    return String(month + 1).padStart(2, '0') + '/' + String(day).padStart(2, '0') + '/' + year;
  }

  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  function buildReview(review, sectionEl) {
    const article = el('article', 'cwc_product-reviews__review');
    const meta = el('div', 'cwc_product-reviews__review-meta');

    const stars = el('span', 'cwc_product-reviews__stars');
    stars.style.setProperty('--rating', Math.min(review.rating * 20, 100) + '%');
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', review.rating + ' out of 5 stars');
    const starGlyphs = el('span', '', '★★★★★');
    starGlyphs.setAttribute('aria-hidden', 'true');
    stars.appendChild(starGlyphs);
    meta.appendChild(stars);

    if (review.author) {
      const author = el('span', 'cwc_product-reviews__review-author', review.author);
      author.title = review.author;
      meta.appendChild(author);
    }

    const verifiedLabel = sectionEl.dataset.verifiedLabel;
    if (review.verified && verifiedLabel) meta.appendChild(el('span', 'cwc_product-reviews__review-badge', verifiedLabel));

    const date = formatDate(review.date, sectionEl.dataset.dateFormat);
    if (date) meta.appendChild(el('span', 'cwc_product-reviews__review-date', date));

    article.appendChild(meta);
    if (review.title) article.appendChild(el('p', 'cwc_product-reviews__review-title', review.title));

    if (review.body.length) {
      const body = el('div', 'cwc_product-reviews__review-body');
      review.body.forEach(function (paragraph) {
        body.appendChild(el('p', '', paragraph));
      });
      article.appendChild(body);
    }
    return article;
  }

  function render(sectionEl, state) {
    const head = sectionEl.querySelector('[data-list-head]');
    const showing = sectionEl.querySelector('[data-showing]');
    if (head && showing) {
      showing.textContent = (sectionEl.dataset.showingLabel || '')
        .replace('[shown]', state.shown)
        .replace('[total]', Math.max(state.total, state.shown));
      head.hidden = state.shown === 0;
    }
    updateMore(sectionEl, state);
  }

  function updateMore(sectionEl, state) {
    const button = sectionEl.querySelector('[data-show-more]');
    if (!button) return;
    button.hidden = state.shown === 0 || state.page >= state.totalPages;
    button.disabled = state.loading;
  }

  /* ---------- Write a review ---------- */

  function initWriteReview(sectionEl) {
    const button = sectionEl.querySelector('[data-write-review]');
    const panel = sectionEl.querySelector('[data-review-form-panel]');
    const form = sectionEl.querySelector('[data-review-form]');
    if (!button || !panel || !form) return;

    function setOpen(open) {
      panel.hidden = !open;
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (!open) return;
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const firstStar = form.querySelector('input[name="rating"]');
      if (firstStar && !form.querySelector('input[name="rating"]:checked')) firstStar.focus({ preventScroll: true });
    }

    button.addEventListener('click', function () {
      setOpen(panel.hidden);
    });

    const cancel = form.querySelector('[data-form-cancel]');
    if (cancel) {
      cancel.addEventListener('click', function () {
        setOpen(false);
        button.focus();
      });
    }

    initStarInput(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submitReview(sectionEl, form, panel);
    });
  }

  // Lights the stars up to the hovered or chosen one
  function initStarInput(form) {
    const wrap = form.querySelector('[data-star-input]');
    if (!wrap) return;
    const labels = wrap.querySelectorAll('[data-star-value]');

    function paint(value) {
      labels.forEach(function (label) {
        label.classList.toggle('cwc_product-reviews__form-star--on', parseInt(label.getAttribute('data-star-value'), 10) <= value);
      });
    }

    function chosen() {
      const checked = wrap.querySelector('input:checked');
      return checked ? parseInt(checked.value, 10) : 0;
    }

    labels.forEach(function (label) {
      label.addEventListener('mouseenter', function () {
        paint(parseInt(label.getAttribute('data-star-value'), 10));
      });
    });
    wrap.addEventListener('mouseleave', function () { paint(chosen()); });
    wrap.addEventListener('change', function () { paint(chosen()); });
  }

  function showError(form, message) {
    const error = form.querySelector('[data-form-error]');
    if (!error) return;
    error.textContent = message;
    error.hidden = !message;
  }

  function validate(form) {
    let valid = Boolean(form.querySelector('input[name="rating"]:checked'));
    ['name', 'email', 'body'].forEach(function (name) {
      const field = form.elements[name];
      if (!field) return;
      const ok = field.value.trim() !== '' && field.checkValidity();
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok) valid = false;
    });
    return valid;
  }

  function submitReview(sectionEl, form, panel) {
    showError(form, '');
    if (!validate(form)) {
      showError(form, form.dataset.errorRequired || 'Please fill in the required fields.');
      return;
    }

    const submit = form.querySelector('[data-form-submit]');
    if (submit) submit.disabled = true;

    // Same fields Judge.me's own form sends
    const domain = sectionEl.dataset.shopDomain;
    const data = new FormData();
    data.append('shop_domain', domain);
    data.append('url', domain);
    data.append('platform', 'shopify');
    data.append('id', sectionEl.dataset.productId);
    data.append('name', form.elements.name.value.trim());
    data.append('email', form.elements.email.value.trim());
    data.append('rating', form.querySelector('input[name="rating"]:checked').value);
    data.append('body', form.elements.body.value.trim());
    if (form.elements.title && form.elements.title.value.trim()) data.append('title', form.elements.title.value.trim());
    if (form.elements.shopify_customer_id) data.append('shopify_customer_id', form.elements.shopify_customer_id.value);

    fetch(SUBMIT_URL, { method: 'POST', body: data })
      .then(function (response) {
        if (response.ok) return null;
        return response.json().catch(function () { return {}; }).then(function (json) {
          const message = (typeof json.error === 'string' && json.error) ||
            (Array.isArray(json.errors) && json.errors.join(', ')) ||
            (typeof json.message === 'string' && json.message) || '';
          const error = new Error(message);
          error.fromJudgeme = true;
          throw error;
        });
      })
      .then(function () {
        form.hidden = true;
        const success = panel.querySelector('[data-form-success]');
        if (success) {
          success.hidden = false;
          success.focus();
        }
      })
      .catch(function (error) {
        // Show Judge.me's own reason when it gives one; network errors get the friendly message
        const reason = error && error.fromJudgeme ? error.message : '';
        showError(form, reason || form.dataset.errorText || 'Your review could not be sent. Please try again.');
      })
      .then(function () {
        if (submit) submit.disabled = false;
      });
  }

  /* ---------- Init ---------- */

  function initAllSections() {
    document.querySelectorAll('.cwc_product-reviews').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSections);
  } else {
    initAllSections();
  }

  document.addEventListener('shopify:section:load', function (event) {
    const section = event.target.querySelector('.cwc_product-reviews');
    if (section) initSection(section);
  });
})();
