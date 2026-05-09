document.addEventListener("DOMContentLoaded", () => {
  let s = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    t = 3;

  function d(e) {
    return (Date.now() - new Date(e).getTime()) / 864e5 <= t
  }

  let c = (location.pathname.split("/").pop() || "").toLowerCase();
  let m = 2 <= window.location.pathname.split("/").filter(Boolean).length ? "../" : "";

  async function g() {
    try {
      return await (await fetch(m + "games.json?v=" + Date.now(), {
        cache: "no-store"
      })).json()
    } catch (e) {
      return console.warn("Failed to load games.json:", e), []
    }
  }

  async function e() {
    let l = document.querySelector(".games-row");
    if (l) {
      var e = await g();
      if (e.length) {
        e = [...e].sort((e, t) => {
          e = new Date(e.lastupdate).getTime() || 0;
          return (new Date(t.lastupdate).getTime() || 0) - e
        });
        let o = Number(l.getAttribute("data-max")) || 16;
        l.innerHTML = "", e.forEach((e, t) => {
          var a = d(e.lastupdate),
            n = (n = e.lastupdate, n = new Date(n), "(" + s[n.getMonth()] + " " + n.getDate() + " " + n.getFullYear() + ")"),
            i = document.createElement("a");
          i.className = "game-link", i.href = e.url, i.style.display = t < o ? "" : "none", i.innerHTML = `
<div class="game-card"
data-name="${e.name.toLowerCase()}"
data-lastupdate="${e.lastupdate}"
data-tooltip="${e.tooltip||""}">
${a?'<span class="game-new-badge" style="display:inline-flex;">NEW</span>':""}
<img src="${e.image}" class="game-thumb" alt="${e.name}" loading="lazy">
<div class="game-info">
<h3>${e.name}</h3>
<p><span>Code</span> Release!</p>
<p class="game-date-display">${n}</p>
</div>
</div>
`, l.appendChild(i)
        })
      }
    }
  }
  "index.html" !== c && "index" !== c && "" !== c || e(), document.querySelectorAll(".code-card").forEach(t => {
    let a = t.querySelector(".copy-btn");
    if (a && !(a.disabled || a.classList.contains("expired-btn") || t.classList.contains("expired"))) {
      a.dataset.originalLabel || (a.dataset.originalLabel = a.textContent.trim());
      a.addEventListener("click", async () => {
        var e = (e = t.getAttribute("data-code")) && e.trim() ? e.trim() : (e = t.querySelector(".code-text")) ? e.textContent.replace(/\bNEW\b/g, "").trim() : "";
        if (e) try {
          await navigator.clipboard.writeText(e), a.classList.add("copied"), a.textContent = "Copied ✓", setTimeout(() => {
            a.classList.remove("copied"), a.textContent = a.dataset.originalLabel
          }, 2e3)
        } catch (e) {
          a.textContent = "Failed", setTimeout(() => a.textContent = a.dataset.originalLabel, 1500)
        }
      })
    }
  });

  let i = document.getElementById("globalSearch"),
    o = document.getElementById("searchSuggestions");

  function l() {
    o && (o.classList.remove("show"), o.innerHTML = "")
  }
  (async () => {
    let a = await g();

    function n(e) {
      let t = (e || "").toLowerCase().trim();
      return t ? a.filter(e => e.name.toLowerCase().includes(t)) : []
    }
    i && o && (window.clearGlobalSearch = function() {
      i && (i.value = "", i.focus(), l())
    }, i.addEventListener("input", function() {
      var e = n(this.value);
      e.length ? (e = e, o && (o.innerHTML = "", e.slice(0, 6).forEach(e => {
        var t = document.createElement("div");
        t.className = "suggestion-item", t.innerHTML = `
<img class="suggestion-thumb" src="${m}${e.image}" alt="${e.name}" loading="lazy">
<div class="suggestion-text">
<div class="suggestion-title">${e.name}</div>
<div class="suggestion-sub">Click to open codes</div>
</div>
<div class="suggestion-pill">Open</div>
`, t.addEventListener("click", () => {
          window.location.href = m + e.url
        }), o.appendChild(t)
      }), o.classList.add("show"))) : l()
    }), i.addEventListener("keydown", function(e) {
      var t;
      "Enter" === e.key && (e.preventDefault(), (t = n(this.value)).length) && (window.location.href = m + t[0].url), "Escape" === e.key && l()
    }), document.addEventListener("click", function(e) {
      var t = i.closest(".search-shell"),
        t = i.closest(".header-search") || t;
      t && !t.contains(e.target) && l()
    }))
  })();

  // ── DROPDOWN SETUP FUNCTION ──
  function setupDropdown(dropdownId, btnId) {
    var drop = document.getElementById(dropdownId);
    var btn = document.getElementById(btnId);
    if (drop && btn) {
      let isOpen = !1;
      btn.addEventListener("click", e => {
        e.preventDefault(), isOpen = !isOpen, drop.classList.toggle("open", isOpen)
      });
      drop.addEventListener("mouseenter", () => {
        isOpen || drop.classList.add("open")
      });
      drop.addEventListener("mouseleave", () => {
        isOpen || drop.classList.remove("open")
      });
      document.addEventListener("click", e => {
        drop.contains(e.target) || (isOpen = !1, drop.classList.remove("open"))
      })
    }
  }

  // ── Initialize ALL Dropdowns ──
  setupDropdown("codesDropdown", "codesBtn");
  setupDropdown("guidesDropdown", "guidesBtn");
  setupDropdown("tipsDropdown", "tipsBtn");
  setupDropdown("tutorialDropdown", "tutorialBtn");
  
  // ✅ ADDED: More Dropdown (Game Calculator & Roblox Outfit)
  setupDropdown("moreDropdown", "moreBtn");

  // ── More Grid (with rewards) ──
  (async () => {
    let a = document.getElementById("moreGrid");
    if (a) {
      var e = await g();
      let t = (location.pathname.split("/").pop() || "").toLowerCase();
      var n = [...e.filter(e => e.url.toLowerCase() !== t)];
      for (let e = n.length - 1; 0 < e; e--) {
        var i = Math.floor(Math.random() * (e + 1));
        [n[e], n[i]] = [n[i], n[e]]
      }
      a.innerHTML = "", n.slice(0, 6).forEach(e => {
        var t = document.createElement("a");
        t.className = "more-card", t.href = m + e.url, t.innerHTML = `
<img src="${m}${e.image}" alt="${e.name}" loading="lazy">
<div class="more-info">
  <h3>${e.name} Codes</h3>
  <p style="font-size:11px;color:rgba(255,255,255,0.45);margin:2px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">${e.rewards || "Free Rewards"}</p>
</div>
`, a.appendChild(t)
      })
    }
  })(), (async () => {
    var e = document.getElementById("suggestGrid"),
      a = document.getElementById("moreFromGrid");
    if (e || a) {
      var n = await g();
      let t = (location.pathname.split("/").pop() || "").toLowerCase();
      var n = n.filter(e => e.url.toLowerCase() !== t),
        n = (n.sort((e, t) => new Date(t.lastupdate).getTime() - new Date(e.lastupdate).getTime()), n.slice(0, 30)),
        i = [...n];
      for (let e = i.length - 1; 0 < e; e--) {
        var o = Math.floor(Math.random() * (e + 1));
        [i[e], i[o]] = [i[o], i[e]]
      }
      n = (a, e) => {
        a && (a.innerHTML = "", e.forEach(e => {
          var t = document.createElement("a");
          t.className = "suggest-card", t.href = m + e.url, t.innerHTML = `
<img src="${m}${e.image}" alt="${e.name}" loading="lazy">
<div class="suggest-info">
<h3>${e.name} Codes</h3>
<p>${e.rewards||"Free Rewards"}</p>
</div>
`, a.appendChild(t)
        }))
      };
      n(e, i.slice(0, 6)), n(a, i.slice(6, 12))
    }
  })(), (async () => {
    let l = document.getElementById("alphaSections"),
      n = document.getElementById("alphaNav"),
      s = document.getElementById("loadMoreBtn");
    if (l && n && s) {
      var e = await g();
      var e = e.map(e => {
        let t = "Code Release!";
        ("gamecode.html" === c || "gamecode" === c) && (a = e.activeCodes || 0, t = 1 === a ? "1 Active Code" : a + " Active Codes");
        var a = (e.name[0] || "#").toUpperCase(),
          a = /^[A-Z]$/.test(a) ? a : "#";
        return {
          ...e,
          desc: t,
          letter: a
        }
      }),
        t = (e.sort((e, t) => e.letter !== t.letter ? e.letter.localeCompare(t.letter) : e.name.localeCompare(t.name)), ["#"].concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")));
      let i = {},
        o = (t.forEach(e => i[e] = []), e.forEach(e => {
          i[e.letter] || (i[e.letter] = []), i[e.letter].push(e)
        }), n.innerHTML = "", t.forEach(e => {
          var t = i[e] && 0 < i[e].length,
            a = document.createElement("a");
          a.className = "alpha-link" + (t ? "" : " disabled"), a.href = t ? "#sec-" + e : "#", a.textContent = e, n.appendChild(a)
        }), l.innerHTML = "", []),
        a = (t.forEach(e => {
          if (i[e] && i[e].length) {
            var t = document.createElement("section");
            t.className = "alpha-section", t.id = "sec-" + e, t.innerHTML = `<div class="alpha-head">${e}</div><div class="alpha-grid"></div>`;
            let n = t.querySelector(".alpha-grid");
            i[e].forEach(e => {
              var t = d(e.lastupdate),
                a = document.createElement("a");
              a.className = "game-link", a.href = m + e.url, a.innerHTML = `
<div class="game-card">
${t?'<span class="game-new-badge" style="display:inline-flex;">NEW</span>':""}
<img src="${m}${e.image}" class="game-thumb" alt="${e.name}" loading="lazy">
<div class="game-info">
<h3>${e.name}</h3>
<p>${e.desc}</p>
</div>
</div>
`, n.appendChild(a), o.push(a)
            }), l.appendChild(t)
          }
        }), 0);

      function r() {
        var e, t = Math.min(a + 20, o.length);
        for (let e = a; e < t; e++) o[e].style.display = "";
        a = t, (e = o.length - a) <= 0 ? (s.textContent = "No more games", s.disabled = !0) : (s.textContent = `View More (${e} left)`, s.disabled = !1), l.querySelectorAll(".alpha-section").forEach(e => {
          var t = Array.from(e.querySelectorAll(".game-link")).some(e => "none" !== e.style.display);
          e.style.display = t ? "" : "none"
        })
      }
      o.forEach(e => e.style.display = "none"), (s.onclick = r)()
    }
  })(), (async () => {
    let n = await (async () => {
      try {
        return await (await fetch(m + "wiki.json")).json()
      } catch (e) {
        return console.warn("Failed to load wiki.json:", e), []
      }
    })();
    if (n.length) {
      var e, i = document.getElementById("gameWikiGrid"),
        i = (i && (e = [...n].sort(() => Math.random() - .5), i.innerHTML = e.slice(0, 6).map(e => `
<a class="suggest-card" href="${m}${e.url}">
<img src="${m}${e.image}" alt="${e.name}" loading="lazy">
<div class="suggest-info">
<h3>${e.name} Wiki</h3>
<p>Guides • Fixes • Tips</p>
</div>
</a>
`).join("")), document.getElementById("wikiGameGrid"));
      i && ((e = document.getElementById("wikiGameCount")) && (e.textContent = n.length + " Game" + (1 !== n.length ? "s" : "")), i.innerHTML = n.map(e => `
<a class="game-wiki-card" href="${m}${e.url}">
<img class="game-wiki-img" src="${m}${e.image}" alt="${e.name}" loading="lazy">
<div class="game-wiki-info">
<span class="game-wiki-tag">GAME WIKI</span>
<h3>${e.name}</h3>
<p>${e.description||"Guides, codes, and tips for "+e.name+"."}</p>
<span class="game-wiki-read">Read ➜</span>
</div>
</a>
`).join(""));
      let t = document.getElementById("wikiSearch"),
        a = document.getElementById("wikiDropdown");
      t && a && (t.addEventListener("input", function() {
        let t = this.value.toLowerCase().trim();
        var e;
        t ? ((e = n.filter(e => e.name.toLowerCase().includes(t))).length ? a.innerHTML = e.map(e => `
<a href="${m}${e.url}" style="display:flex; align-items:center; gap:12px; padding:10px 16px; text-decoration:none; color:#fff; border-bottom:1px solid rgba(255,255,255,0.06); transition:background 0.15s;"
onmouseover="this.style.background='rgba(255,255,255,0.08)'"
onmouseout="this.style.background=''">
<img src="${m}${e.image}" alt="${e.name}" style="width:48px; height:48px; object-fit:cover; border-radius:10px; flex-shrink:0;" loading="lazy">
<div>
<div style="font-size:11px; font-weight:900; color:rgba(180,160,255,0.95); margin-bottom:3px;">GAME WIKI</div>
<div style="font-size:14px; font-weight:700;">${e.name}</div>
</div>
</a>
`).join(""): a.innerHTML = `<div style="padding:14px 20px; color:rgba(255,255,255,0.5); font-size:14px;">No results found for "${t}"</div>`, a.style.display = "block") : a.style.display = "none"
      }), document.addEventListener("click", function(e) {
        t.contains(e.target) || a.contains(e.target) || (a.style.display = "none")
      }), t.addEventListener("keydown", function(e) {
        "Escape" === e.key && (this.value = "", a.style.display = "none")
      }))
    }
  })(), document.querySelectorAll(".faq-question").forEach(a => {
    a.addEventListener("click", () => {
      var e, t = a.nextElementSibling;
      t && (t.classList.toggle("open"), e = a.querySelector("span")) && (e.textContent = t.classList.contains("open") ? "–" : "+")
    })
  });

  function r(e, t, a, n) {
    var e = document.getElementById(e),
      t = document.getElementById(t),
      a = document.getElementById(a),
      n = document.getElementById(n);
    e && a && ((a = Array.from(e.querySelectorAll(".code-card"))).length <= 5 ? t && (t.style.display = "none") : (a.forEach((e, t) => {
      e.style.display = t < 5 ? "" : "none"
    }), e = a.length - 5, n && (n.textContent = "(" + e + " more)")))
  }
  window.toggleCodes = function(e) {
    var t, a, n = "active" === e ? "activeViewMoreBtn" : "expiredViewMoreBtn",
      i = "active" === e ? "activeHiddenCount" : "expiredHiddenCount",
      o = document.getElementById("active" === e ? "activeList" : "expiredList"),
      n = document.getElementById(n),
      l = document.getElementById(i);
    o && n && (t = Array.from(o.querySelectorAll(".code-card")), "true" === n.getAttribute("data-expanded") ? (t.forEach((e, t) => {
      e.style.display = t < 5 ? "" : "none"
    }), a = t.length - 5, l && (l.textContent = "(" + a + " more)"), n.innerHTML = ("active" === e ? "▼ View More Active Codes " : "▼ View More Expired Codes ") + '<span class="vm-count" id="' + i + '">(' + a + " more)</span>", n.setAttribute("data-expanded", "false"), o.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })) : (t.forEach(e => {
      e.style.display = ""
    }), l && (l.textContent = ""), n.innerHTML = "active" === e ? "▲ View Less Active Codes" : "▲ View Less Expired Codes", n.setAttribute("data-expanded", "true")))
  }, r("activeList", "activeViewMoreWrap", "activeViewMoreBtn", "activeHiddenCount"), r("expiredList", "expiredViewMoreWrap", "expiredViewMoreBtn", "expiredHiddenCount")
});