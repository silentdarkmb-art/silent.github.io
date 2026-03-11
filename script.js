/* =========================================================
   BLOXBURST - script.js
   ✅ JSON-based — lahat ng games data galing sa games.json
   ✅ Index auto NEW (3 days) + sort + date display
   ✅ Copy buttons (codes)
   ✅ Global search autocomplete (from games.json)
   ✅ Codes dropdown (click + hover)
   ✅ More Content auto RANDOM 6
   ✅ Suggestion + More from BLOXBURST (random)
   ✅ Gamecode.html auto A–Z + Load More (20)
   ✅ Gamecode.html shows ACTIVE code count
   ✅ Subfolder-safe: pathPrefix applied to ALL fetch + img + href
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     HELPERS
     ========================= */
  const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const NEW_BADGE_DAYS = 3; // days before NEW badge disappears

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return '(' + MONTHS[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ')';
  }

  function isNew(lastupdate) {
    const diffMs   = Date.now() - new Date(lastupdate).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= NEW_BADGE_DAYS;
  }

  async function getActiveCodeCountFromPage(url) {
    try {
      const res  = await fetch(url, { cache: "no-store" });
      const html = await res.text();
      const doc  = new DOMParser().parseFromString(html, "text/html");
      return Array.from(doc.querySelectorAll(".code-card"))
        .filter(card => !card.classList.contains("expired")).length;
    } catch (e) {
      return 0;
    }
  }

  const page = (location.pathname.split("/").pop() || "").toLowerCase();

  /* =========================
     PATH PREFIX (subfolder-safe)
     ========================= */
  const isSubfolder = window.location.pathname.split('/').filter(Boolean).length >= 2;
  const pathPrefix  = isSubfolder ? '../' : '';

  /* =========================
     LOAD games.json — CORE
     ========================= */
  async function loadGames() {
    try {
      const res  = await fetch(pathPrefix + 'games.json');
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Failed to load games.json:', e);
      return [];
    }
  }

  /* =========================
     A) INDEX.HTML — GAME CARDS
     Auto NEW badge + Auto date + Sort by lastupdate
     ========================= */
  async function buildIndexCards() {
    const rowEl = document.querySelector('.games-row');
    if (!rowEl) return;

    const games = await loadGames();
    if (!games.length) return;

    // Sort by lastupdate descending (newest first)
    const sorted = [...games].sort((a, b) =>
      new Date(b.lastupdate).getTime() - new Date(a.lastupdate).getTime()
    );

    const MAX_VISIBLE = Number(rowEl.getAttribute('data-max')) || 16;

    rowEl.innerHTML = '';

    sorted.forEach((game, idx) => {
      const gameIsNew   = isNew(game.lastupdate);
      const displayDate = formatDate(game.lastupdate); // always use actual lastupdate from JSON

      const a = document.createElement('a');
      a.className   = 'game-link';
      a.href        = game.url;
      a.style.display = idx < MAX_VISIBLE ? '' : 'none';


      a.innerHTML = `
        <div class="game-card"
             data-name="${game.name.toLowerCase()}"
             data-lastupdate="${game.lastupdate}"
             data-tooltip="${game.tooltip || ''}">
          ${gameIsNew ? '<span class="game-new-badge" style="display:inline-flex;">NEW</span>' : ''}
          <img src="${game.image}" class="game-thumb" alt="${game.name}" loading="lazy">
          <div class="game-info">
            <h3>${game.name}</h3>
            <p><span>Code</span> Release!</p>
            <p class="game-date-display">${displayDate}</p>
          </div>
        </div>
      `;

      rowEl.appendChild(a);
    });
  }

 if (page === 'index.html' || page === 'index' || page === '') {
    buildIndexCards();
  }

  /* =========================
     B) COPY BUTTONS (codes pages)
     ========================= */
  document.querySelectorAll(".code-card").forEach((card) => {
    const copyBtn = card.querySelector(".copy-btn");
    if (!copyBtn) return;
    if (copyBtn.disabled || copyBtn.classList.contains("expired-btn") || card.classList.contains("expired")) return;

    if (!copyBtn.dataset.originalLabel) {
      copyBtn.dataset.originalLabel = copyBtn.textContent.trim();
    }

    const getCode = () => {
      const dataCode = card.getAttribute("data-code");
      if (dataCode && dataCode.trim()) return dataCode.trim();
      const codeEl = card.querySelector(".code-text");
      if (!codeEl) return "";
      return codeEl.textContent.replace(/\bNEW\b/g, "").trim();
    };

    copyBtn.addEventListener("click", async () => {
      const code = getCode();
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        copyBtn.classList.add("copied");
        copyBtn.textContent = "Copied ✓";
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.textContent = copyBtn.dataset.originalLabel;
        }, 2000);
      } catch (e) {
        copyBtn.textContent = "Failed";
        setTimeout(() => (copyBtn.textContent = copyBtn.dataset.originalLabel), 1500);
      }
    });
  });

  /* =========================
     C) GLOBAL AUTOCOMPLETE SEARCH (from games.json)
     ========================= */
  const globalSearch   = document.getElementById("globalSearch");
  const suggestionsBox = document.getElementById("searchSuggestions");

  function hideSuggestions() {
    if (!suggestionsBox) return;
    suggestionsBox.classList.remove("show");
    suggestionsBox.innerHTML = "";
  }

  function showSuggestions(items) {
    if (!suggestionsBox) return;
    suggestionsBox.innerHTML = "";
    items.slice(0, 6).forEach((item) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `
        <img class="suggestion-thumb" src="${pathPrefix}${item.image}" alt="${item.name}" loading="lazy">
        <div class="suggestion-text">
          <div class="suggestion-title">${item.name}</div>
          <div class="suggestion-sub">Click to open codes</div>
        </div>
        <div class="suggestion-pill">Open</div>
      `;
      div.addEventListener("click", () => { window.location.href = pathPrefix + item.url; });
      suggestionsBox.appendChild(div);
    });
    suggestionsBox.classList.add("show");
  }

  async function initSearch() {
    const games = await loadGames();
    if (!globalSearch || !suggestionsBox) return;

    function findMatches(query) {
      const q = (query || "").toLowerCase().trim();
      if (!q) return [];
      return games.filter(g => g.name.toLowerCase().includes(q));
    }

    window.clearGlobalSearch = function() {
      if (!globalSearch) return;
      globalSearch.value = "";
      globalSearch.focus();
      hideSuggestions();
    };

    globalSearch.addEventListener("input", function() {
      const matches = findMatches(this.value);
      matches.length ? showSuggestions(matches) : hideSuggestions();
    });

    globalSearch.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const matches = findMatches(this.value);
        if (matches.length) window.location.href = pathPrefix + matches[0].url;
      }
      if (e.key === "Escape") hideSuggestions();
    });

    document.addEventListener("click", function(e) {
      const shell   = globalSearch.closest(".search-shell");
      const wrapper = globalSearch.closest(".header-search");
      const container = wrapper || shell;
      if (container && !container.contains(e.target)) hideSuggestions();
    });
  }

  initSearch();

  /* =========================
     D) CODES DROPDOWN (CLICK + HOVER)
     ========================= */
  const dropdown = document.getElementById("codesDropdown");
  const codesBtn = document.getElementById("codesBtn");

  if (dropdown && codesBtn) {
    let pinned = false;
    codesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      pinned = !pinned;
      dropdown.classList.toggle("open", pinned);
    });
    dropdown.addEventListener("mouseenter", () => { if (!pinned) dropdown.classList.add("open"); });
    dropdown.addEventListener("mouseleave", () => { if (!pinned) dropdown.classList.remove("open"); });
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) { pinned = false; dropdown.classList.remove("open"); }
    });
  }

  /* =========================
     E) MORE CONTENT (RANDOM 6 from games.json)
     ========================= */
  async function buildMoreContent() {
    const moreGrid = document.getElementById("moreGrid");
    if (!moreGrid) return;

    const games   = await loadGames();
    const current = (location.pathname.split("/").pop() || "").toLowerCase();

    const filtered = games.filter(g => g.url.toLowerCase() !== current);

    // Shuffle
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    moreGrid.innerHTML = '';
    shuffled.slice(0, 6).forEach(game => {
      const a = document.createElement('a');
      a.className = 'more-card';
      a.href = pathPrefix + game.url;
      a.innerHTML = `
        <img src="${pathPrefix}${game.image}" alt="${game.name}" loading="lazy">
        <div class="more-info"><h3>${game.name} Codes</h3></div>
      `;
      moreGrid.appendChild(a);
    });
  }

  buildMoreContent();

  /* =========================
     E2) SUGGESTION + MORE FROM BLOXBURST (RANDOM)
     ========================= */
  async function buildSuggestionGrids() {
    const suggestGrid  = document.getElementById("suggestGrid");
    const moreFromGrid = document.getElementById("moreFromGrid");
    if (!suggestGrid && !moreFromGrid) return;

    const games   = await loadGames();
    const current = (location.pathname.split("/").pop() || "").toLowerCase();

    const filtered = games.filter(g => g.url.toLowerCase() !== current);
    filtered.sort((a, b) => new Date(b.lastupdate).getTime() - new Date(a.lastupdate).getTime());

    const pool     = filtered.slice(0, 30);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const renderGrid = (gridEl, list) => {
      if (!gridEl) return;
      gridEl.innerHTML = '';
      list.forEach(game => {
        const a = document.createElement('a');
        a.className = 'suggest-card';
        a.href = pathPrefix + game.url;
        a.innerHTML = `
          <img src="${pathPrefix}${game.image}" alt="${game.name}" loading="lazy">
          <div class="suggest-info">
            <h3>${game.name} Codes</h3>
            <p>${game.rewards || 'Free Rewards'}</p>
          </div>
        `;
        gridEl.appendChild(a);
      });
    };

    renderGrid(suggestGrid, shuffled.slice(0, 6));
    renderGrid(moreFromGrid, shuffled.slice(6, 12));
  }

  buildSuggestionGrids();

  /* =========================
     F) GAMECODE.HTML (AUTO A–Z FROM games.json)
     ========================= */
  async function buildGamecodeAZ() {
    const sectionsRoot = document.getElementById("alphaSections");
    const alphaNav     = document.getElementById("alphaNav");
    const loadMoreBtn  = document.getElementById("loadMoreBtn");
    if (!sectionsRoot || !alphaNav || !loadMoreBtn) return;

    const games         = await loadGames();
    const itemsPerClick = 20;

    // ✅ FIX: Gamitin na lang ang activeCodes mula sa games.json — hindi na mag-fetch ng bawat HTML page (sobrang bagal noon!)
    const items = games.map((game) => {
      let desc = 'Code Release!';
      if (page === 'gamecode.html') {
        const count = game.activeCodes || 0;
        desc = count === 1 ? '1 Active Code' : `${count} Active Codes`;
      }
      const first  = (game.name[0] || '#').toUpperCase();
      const letter = /^[A-Z]$/.test(first) ? first : '#';
      return { ...game, desc, letter };
    });

    // Sort A-Z
    items.sort((a, b) => {
      if (a.letter !== b.letter) return a.letter.localeCompare(b.letter);
      return a.name.localeCompare(b.name);
    });

    const letters = ['#'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    const groups  = {};
    letters.forEach(l => (groups[l] = []));
    items.forEach(it => {
      if (!groups[it.letter]) groups[it.letter] = [];
      groups[it.letter].push(it);
    });

    // Build alpha nav
    alphaNav.innerHTML = '';
    letters.forEach(l => {
      const has = groups[l] && groups[l].length > 0;
      const a   = document.createElement('a');
      a.className   = 'alpha-link' + (has ? '' : ' disabled');
      a.href        = has ? `#sec-${l}` : '#';
      a.textContent = l;
      alphaNav.appendChild(a);
    });

    // Build sections
    sectionsRoot.innerHTML = '';
    const allCardEls = [];

    letters.forEach(l => {
      if (!groups[l] || !groups[l].length) return;

      const sec = document.createElement('section');
      sec.className = 'alpha-section';
      sec.id        = `sec-${l}`;
      sec.innerHTML = `<div class="alpha-head">${l}</div><div class="alpha-grid"></div>`;

      const grid = sec.querySelector('.alpha-grid');

      groups[l].forEach(item => {
        const gameIsNew = isNew(item.lastupdate);
        const a = document.createElement('a');
        a.className = 'game-link';
        a.href = pathPrefix + item.url;
        a.innerHTML = `
          <div class="game-card">
            ${gameIsNew ? '<span class="game-new-badge" style="display:inline-flex;">NEW</span>' : ''}
            <img src="${pathPrefix}${item.image}" class="game-thumb" alt="${item.name}" loading="lazy">
            <div class="game-info">
              <h3>${item.name}</h3>
              <p>${item.desc}</p>
            </div>
          </div>
        `;
        grid.appendChild(a);
        allCardEls.push(a);
      });

      sectionsRoot.appendChild(sec);
    });

    // Load more logic
    let visibleCount = 0;
    allCardEls.forEach(el => (el.style.display = 'none'));

    function updateButton() {
      const left = allCardEls.length - visibleCount;
      if (left <= 0) {
        loadMoreBtn.textContent = 'No more games';
        loadMoreBtn.disabled    = true;
      } else {
        loadMoreBtn.textContent = `View More (${left} left)`;
        loadMoreBtn.disabled    = false;
      }
    }

    function showNext() {
      const next = Math.min(visibleCount + itemsPerClick, allCardEls.length);
      for (let i = visibleCount; i < next; i++) allCardEls[i].style.display = '';
      visibleCount = next;
      updateButton();
      // ✅ FIX: Itago ang alpha-section kung walang visible cards
      sectionsRoot.querySelectorAll('.alpha-section').forEach(sec => {
        const hasVisible = Array.from(sec.querySelectorAll('.game-link')).some(el => el.style.display !== 'none');
        sec.style.display = hasVisible ? '' : 'none';
      });
    }

    loadMoreBtn.onclick = showNext;
    showNext();
  }

  buildGamecodeAZ();

  /* =========================
     GAME WIKI — FROM wiki.json
     ✅ Para mag-add ng bagong Game Wiki:
        Buksan lang wiki.json, dagdagan ng entry!
        Automatic lalabas sa wiki.html, index.html, at search.
     ========================= */
  async function loadWikiGames() {
    try {
      const res  = await fetch(pathPrefix + 'wiki.json');
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Failed to load wiki.json:', e);
      return [];
    }
  }

  async function buildWikiGrids() {
    const wikis = await loadWikiGames();
    if (!wikis.length) return;

    // Index page — "Game Wiki" suggest section (gameWikiGrid)
    const indexGrid = document.getElementById('gameWikiGrid');
    if (indexGrid) {
      const shuffled = [...wikis].sort(() => Math.random() - 0.5);
      indexGrid.innerHTML = shuffled.slice(0, 6).map(g => `
        <a class="suggest-card" href="${pathPrefix}${g.url}">
          <img src="${pathPrefix}${g.image}" alt="${g.name}" loading="lazy">
          <div class="suggest-info">
            <h3>${g.name} Wiki</h3>
            <p>Guides • Fixes • Tips</p>
          </div>
        </a>
      `).join('');
    }

    // Wiki page — full game wiki grid (wikiGameGrid)
    const wikiGameGrid = document.getElementById('wikiGameGrid');
    if (wikiGameGrid) {
      const count = document.getElementById('wikiGameCount');
      if (count) count.textContent = `${wikis.length} Game${wikis.length !== 1 ? 's' : ''}`;
      wikiGameGrid.innerHTML = wikis.map(g => `
        <a class="game-wiki-card" href="${pathPrefix}${g.url}">
          <img class="game-wiki-img" src="${pathPrefix}${g.image}" alt="${g.name}" loading="lazy">
          <div class="game-wiki-info">
            <span class="game-wiki-tag">GAME WIKI</span>
            <h3>${g.name}</h3>
            <p>${g.description || 'Guides, codes, and tips for ' + g.name + '.'}</p>
            <span class="game-wiki-read">Read ➜</span>
          </div>
        </a>
      `).join('');
    }

    // Wiki search
    const wikiSearchInput = document.getElementById('wikiSearch');
    const wikiDropdown    = document.getElementById('wikiDropdown');

    if (wikiSearchInput && wikiDropdown) {
      wikiSearchInput.addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        if (!q) { wikiDropdown.style.display = 'none'; return; }
        const matches = wikis.filter(g => g.name.toLowerCase().includes(q));
        if (!matches.length) {
          wikiDropdown.innerHTML = `<div style="padding:14px 20px; color:rgba(255,255,255,0.5); font-size:14px;">No results found for "${q}"</div>`;
        } else {
          wikiDropdown.innerHTML = matches.map(g => `
            <a href="${pathPrefix}${g.url}" style="display:flex; align-items:center; gap:12px; padding:10px 16px; text-decoration:none; color:#fff; border-bottom:1px solid rgba(255,255,255,0.06); transition:background 0.15s;"
              onmouseover="this.style.background='rgba(255,255,255,0.08)'"
              onmouseout="this.style.background=''">
              <img src="${pathPrefix}${g.image}" alt="${g.name}" style="width:48px; height:48px; object-fit:cover; border-radius:10px; flex-shrink:0;" loading="lazy">
              <div>
                <div style="font-size:11px; font-weight:900; color:rgba(180,160,255,0.95); margin-bottom:3px;">GAME WIKI</div>
                <div style="font-size:14px; font-weight:700;">${g.name}</div>
              </div>
            </a>
          `).join('');
        }
        wikiDropdown.style.display = 'block';
      });

      document.addEventListener('click', function(e) {
        if (!wikiSearchInput.contains(e.target) && !wikiDropdown.contains(e.target)) {
          wikiDropdown.style.display = 'none';
        }
      });

      wikiSearchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { this.value = ''; wikiDropdown.style.display = 'none'; }
      });
    }
  }

  buildWikiGrids();

  /* =========================
     FAQ TOGGLE
     ========================= */
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;
      if (!answer) return;
      answer.classList.toggle("open");
      const icon = btn.querySelector("span");
      if (icon) icon.textContent = answer.classList.contains("open") ? "–" : "+";
    });
  });

  /* =========================
     VIEW MORE — CODES (Active & Expired)
     Shows 5 by default, expands on click
     ========================= */
  const CODES_INITIAL = 5;

  function initViewMore(listId, wrapId, btnId, countId, type) {
    const list  = document.getElementById(listId);
    const wrap  = document.getElementById(wrapId);
    const btn   = document.getElementById(btnId);
    const count = document.getElementById(countId);
    if (!list || !btn) return;

    const cards = Array.from(list.querySelectorAll('.code-card'));
    if (cards.length <= CODES_INITIAL) {
      if (wrap) wrap.style.display = 'none';
      return;
    }

    // Hide cards beyond initial count
    cards.forEach((card, i) => {
      card.style.display = i < CODES_INITIAL ? '' : 'none';
    });

    const hidden = cards.length - CODES_INITIAL;
    if (count) count.textContent = '(' + hidden + ' more)';
  }

  window.toggleCodes = function(type) {
    const listId  = type === 'active' ? 'activeList'          : 'expiredList';
    const wrapId  = type === 'active' ? 'activeViewMoreWrap'  : 'expiredViewMoreWrap';
    const btnId   = type === 'active' ? 'activeViewMoreBtn'   : 'expiredViewMoreBtn';
    const countId = type === 'active' ? 'activeHiddenCount'   : 'expiredHiddenCount';

    const list  = document.getElementById(listId);
    const btn   = document.getElementById(btnId);
    const count = document.getElementById(countId);
    if (!list || !btn) return;

    const cards    = Array.from(list.querySelectorAll('.code-card'));
    const expanded = btn.getAttribute('data-expanded') === 'true';

    if (expanded) {
      // Collapse back to 5
      cards.forEach((card, i) => {
        card.style.display = i < CODES_INITIAL ? '' : 'none';
      });
      const hidden = cards.length - CODES_INITIAL;
      if (count) count.textContent = '(' + hidden + ' more)';
      btn.innerHTML = (type === 'active' ? '▼ View More Active Codes ' : '▼ View More Expired Codes ')
        + '<span class="vm-count" id="' + countId + '">(' + hidden + ' more)</span>';
      btn.setAttribute('data-expanded', 'false');
      list.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Expand all
      cards.forEach(card => { card.style.display = ''; });
      if (count) count.textContent = '';
      btn.innerHTML = (type === 'active' ? '▲ View Less Active Codes' : '▲ View Less Expired Codes');
      btn.setAttribute('data-expanded', 'true');
    }
  };

  initViewMore('activeList',  'activeViewMoreWrap',  'activeViewMoreBtn',  'activeHiddenCount',  'active');
  initViewMore('expiredList', 'expiredViewMoreWrap', 'expiredViewMoreBtn', 'expiredHiddenCount', 'expired');

});