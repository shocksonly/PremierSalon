(function () {
  var PREFIX = window.__SITE_PREFIX__ || "";

  var PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"></path></svg>';
  var USER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"></path></svg>';
  var ARROW_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';
  var CAL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>';
  var IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>';

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function loadData(cb) {
    if (window.__SITE_DATA__) { cb(window.__SITE_DATA__); return; }
    Promise.all([
      fetch(PREFIX + "content/home.json").then(function (r) { return r.json(); }).catch(function () { return {}; }),
      fetch(PREFIX + "content/contact.json").then(function (r) { return r.json(); }).catch(function () { return {}; }),
      fetch(PREFIX + "content/team.json").then(function (r) { return r.json(); }).catch(function () { return { stylists: [] }; }),
      fetch(PREFIX + "content/site.json").then(function (r) { return r.json(); }).catch(function () { return {}; }),
      fetch(PREFIX + "content/gallery.json").then(function (r) { return r.json(); }).catch(function () { return { photos: [] }; }),
      fetch(PREFIX + "content/about.json").then(function (r) { return r.json(); }).catch(function () { return {}; }),
      fetch(PREFIX + "content/services.json").then(function (r) { return r.json(); }).catch(function () { return {}; }),
      fetch(PREFIX + "content/theme.json").then(function (r) { return r.json(); }).catch(function () { return {}; })
    ]).then(function (results) {
      cb({
        home: results[0] || {},
        contact: results[1] || {},
        team: (results[2] && results[2].stylists) || [],
        teamIntro: (results[2] && results[2].intro) || "",
        teamIntroColor: (results[2] && results[2].introColor) || "",
        site: results[3] || {},
        gallery: (results[4] && results[4].photos) || [],
        about: results[5] || {},
        services: results[6] || {},
        theme: results[7] || {}
      });
    });
  }

  function linkIcon(label) {
    var l = (label || "").toLowerCase();
    if (l.indexOf("book") !== -1 || l.indexOf("calendar") !== -1) return CAL_ICON;
    if (l.indexOf("insta") !== -1) return IG_ICON;
    return ARROW_ICON;
  }

  function profileHref(prefix, slug) {
    if (window.__PREVIEW_MODE__) return "#/stylists/profile?slug=" + encodeURIComponent(slug);
    return prefix + "stylists/profile.html?slug=" + encodeURIComponent(slug);
  }

  function colorStyle(c) {
    return c ? ' style="color:' + esc(c) + '"' : '';
  }

  function teamCardHtml(s, prefix) {
    var photo = s.photo
      ? '<div class="team-photo"><img src="' + esc(prefix + s.photo) + '" alt="' + esc(s.name) + '"></div>'
      : '<div class="team-photo placeholder">' + USER_ICON + '</div>';
    return (
      '<div class="team-card">' + photo +
      '<div class="team-info">' +
      '<p class="name"' + colorStyle(s.nameColor) + '>' + esc(s.name) + '</p>' +
      '<p class="role"' + colorStyle(s.roleColor) + '>' + esc(s.role) + '</p>' +
      '<p class="specialty"' + colorStyle(s.specialtyColor) + '>' + esc(s.specialty) + '</p>' +
      '<a class="phone" href="tel:' + esc(s.phoneTel) + '"' + colorStyle(s.phoneColor) + '>' + PHONE_ICON + esc(s.phone) + '</a>' +
      '<p class="avail">Contact for hours &amp; availability</p>' +
      '<a class="view-profile" href="' + profileHref(prefix, s.slug) + '">View profile ' + ARROW_ICON + '</a>' +
      '</div></div>'
    );
  }

  function renderTeamGrid(data) {
    document.querySelectorAll('[data-mount="team-grid"]').forEach(function (el) {
      var prefix = el.getAttribute("data-prefix") || "";
      el.innerHTML = data.team.map(function (s) { return teamCardHtml(s, prefix); }).join("");
    });
  }

  function renderHero(data) {
    var t = document.getElementById("hero-title");
    var s = document.getElementById("hero-subtitle");
    if (t && data.home.heroTitle) t.textContent = data.home.heroTitle;
    if (t) t.style.color = data.home.heroTitleColor || "";
    if (s && data.home.heroSubtitle) s.textContent = data.home.heroSubtitle;
    if (s) s.style.color = data.home.heroSubtitleColor || "";
    document.querySelectorAll('[data-bind="hero-photo"]').forEach(function (el) {
      if (data.home.heroPhoto) el.setAttribute("src", PREFIX + data.home.heroPhoto);
    });
    document.querySelectorAll('[data-bind="shelf-photo"]').forEach(function (el) {
      if (data.home.shelfPhoto) el.setAttribute("src", PREFIX + data.home.shelfPhoto);
    });
    document.querySelectorAll('[data-bind="hero-primary-label"]').forEach(function (el) {
      if (data.home.heroPrimaryLabel) el.textContent = data.home.heroPrimaryLabel;
    });
    document.querySelectorAll('[data-bind="hero-secondary-label"]').forEach(function (el) {
      if (data.home.heroSecondaryLabel) el.textContent = data.home.heroSecondaryLabel;
    });
  }

  function renderSiteChrome(data) {
    var site = data.site || {};
    document.querySelectorAll('[data-bind="logo-src"]').forEach(function (el) {
      if (site.logo) el.setAttribute("src", el.getAttribute("data-prefix") + site.logo);
    });
    document.querySelectorAll('[data-bind="book-btn-label"]').forEach(function (el) {
      if (site.bookButtonLabel) el.textContent = site.bookButtonLabel;
      el.style.color = site.bookButtonLabelColor || "";
    });
  }

  function renderGallery(data) {
    document.querySelectorAll('[data-mount="gallery-grid"]').forEach(function (el) {
      var prefix = el.getAttribute("data-prefix") || "";
      el.innerHTML = (data.gallery || []).map(function (p) {
        return '<div class="gallery-item"><img src="' + esc(prefix + p.image) + '" alt="Premier Salon client work" loading="lazy"></div>';
      }).join("");
    });
  }

  function renderTestimonials(data) {
    var el = document.getElementById("testimonials-grid");
    if (!el || !data.home.testimonials) return;
    el.innerHTML = data.home.testimonials.map(function (t) {
      return (
        '<div class="testimonial-card"><p class="stars">★★★★★</p>' +
        '<p class="quote"' + colorStyle(t.quoteColor) + '>"' + esc(t.quote) + '"</p>' +
        '<p class="who"' + colorStyle(t.whoColor) + '>— ' + esc(t.who) + '</p></div>'
      );
    }).join("");
  }

  function renderSpecialtyLines(data) {
    var line = data.home.specialtyLine;
    if (!line) return;
    ["about-specialty-line", "services-specialty-line"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.textContent = line;
        el.style.color = data.home.specialtyLineColor || "";
      }
    });
  }

  function renderContact(data) {
    var c = data.contact || {};
    document.querySelectorAll("[data-bind='address']").forEach(function (el) { el.textContent = c.address || ""; el.style.color = c.addressColor || ""; });
    document.querySelectorAll("[data-bind='phone-text']").forEach(function (el) { el.textContent = c.phone || ""; el.style.color = c.phoneColor || ""; });
    document.querySelectorAll("[data-bind='phone-href']").forEach(function (el) { el.setAttribute("href", "tel:" + (c.phoneTel || "")); });
    document.querySelectorAll("[data-bind='email-text']").forEach(function (el) { el.textContent = c.email || ""; el.style.color = c.emailColor || ""; });
    document.querySelectorAll("[data-bind='email-href']").forEach(function (el) { el.setAttribute("href", "mailto:" + (c.email || "")); });
    document.querySelectorAll("[data-bind='weekday-hours']").forEach(function (el) { el.textContent = c.weekdayHours || ""; el.style.color = c.weekdayHoursColor || ""; });
    document.querySelectorAll("[data-bind='weekend-note']").forEach(function (el) { el.textContent = c.weekendNote || ""; el.style.color = c.weekendNoteColor || ""; });
    document.querySelectorAll("[data-bind='weekend-detail']").forEach(function (el) { el.textContent = c.weekendDetail || ""; el.style.color = c.weekendDetailColor || ""; });
    document.querySelectorAll("[data-bind='nav-book-href']").forEach(function (el) {
      // leave as-is; nav books to team page, not phone
    });
    var map = document.getElementById("hours-map-iframe");
    if (map && c.address) {
      map.src = "https://www.google.com/maps?q=" + encodeURIComponent(c.address) + "&output=embed";
    }
  }

  function renderAboutPage(data) {
    var a = data.about || {};
    document.querySelectorAll('[data-bind="about-intro"]').forEach(function (el) {
      if (a.intro) el.textContent = a.intro;
      el.style.color = a.introColor || "";
    });
    document.querySelectorAll('[data-bind="about-paragraph-1"]').forEach(function (el) {
      if (a.paragraph1) el.textContent = a.paragraph1;
      el.style.color = a.paragraph1Color || "";
    });
    document.querySelectorAll('[data-bind="about-paragraph-2"]').forEach(function (el) {
      if (a.paragraph2) el.textContent = a.paragraph2;
      el.style.color = a.paragraph2Color || "";
    });
    document.querySelectorAll('[data-bind="about-closing"]').forEach(function (el) {
      if (!a.closing) return;
      el.innerHTML = "";
      var parts = a.closing.split("team page");
      el.appendChild(document.createTextNode(parts[0]));
      if (parts.length > 1) {
        var link = document.createElement("a");
        link.href = "team.html";
        link.style.color = "var(--gold)";
        link.style.textDecoration = "underline";
        link.textContent = "team page";
        el.appendChild(link);
        el.appendChild(document.createTextNode(parts[1]));
      }
      el.style.color = a.closingColor || "";
    });
  }

  function renderServicesPage(data) {
    var s = data.services || {};
    document.querySelectorAll('[data-bind="services-pricing-intro"]').forEach(function (el) {
      if (s.pricingIntro) el.textContent = s.pricingIntro;
      el.style.color = s.pricingIntroColor || "";
    });
    document.querySelectorAll('[data-bind="services-mens-title"]').forEach(function (el) {
      if (s.mensTitle) el.textContent = s.mensTitle;
      el.style.color = s.mensTitleColor || "";
    });
    document.querySelectorAll('[data-bind="services-womens-title"]').forEach(function (el) {
      if (s.womensTitle) el.textContent = s.womensTitle;
      el.style.color = s.womensTitleColor || "";
    });
    document.querySelectorAll('[data-bind="services-footer-note"]').forEach(function (el) {
      if (s.footerNote) {
        el.innerHTML = "";
        var parts = s.footerNote.split("team page");
        el.appendChild(document.createTextNode(parts[0]));
        if (parts.length > 1) {
          var link = document.createElement("a");
          link.href = "team.html";
          link.style.color = "var(--gold)";
          link.textContent = "team page";
          el.appendChild(link);
          el.appendChild(document.createTextNode(parts[1]));
        }
      }
      el.style.color = s.footerNoteColor || "";
    });
    function renderList(mountName, items) {
      document.querySelectorAll('[data-mount="' + mountName + '"]').forEach(function (el) {
        el.innerHTML = (items || []).map(function (item) {
          var desc = item.desc ? '<span class="desc"' + colorStyle(item.descColor) + '>' + esc(item.desc) + '</span>' : '';
          return '<li><span class="name"' + colorStyle(item.nameColor) + '>' + esc(item.name) + '</span>' + desc + '</li>';
        }).join("");
      });
    }
    renderList("services-mens-list", s.mensServices);
    renderList("services-womens-list", s.womensServices);
  }

  function renderTeamIntro(data) {
    document.querySelectorAll('[data-bind="team-intro-text"]').forEach(function (el) {
      if (data.teamIntro) el.textContent = data.teamIntro;
      el.style.color = data.teamIntroColor || "";
    });
  }

  function renderTheme(data) {
    var t = data.theme || {};
    var root = document.documentElement.style;
    if (t.accentColor) { root.setProperty("--gold", t.accentColor); root.setProperty("--gold-light", t.accentColor); }
    if (t.darkBackground) root.setProperty("--black", t.darkBackground);
    if (t.lightBackground) root.setProperty("--white", t.lightBackground);
    if (t.textColor) root.setProperty("--text-color", t.textColor);
    if (t.secondaryTextColor) root.setProperty("--text-secondary", t.secondaryTextColor);
    if (t.lightSectionTextColor) root.setProperty("--light-text", t.lightSectionTextColor);
  }

  function renderProfile(data) {
    var wrap = document.getElementById("profile-root");
    if (!wrap) return;
    var query = window.__PREVIEW_MODE__ ? (window.__PREVIEW_QUERY__ || "") : window.location.search.replace(/^\?/, "");
    var params = new URLSearchParams(query);
    var slug = params.get("slug");
    var s = data.team.find(function (x) { return x.slug === slug; }) || data.team[0];
    if (!s) return;
    document.title = s.name + " — " + s.role + " — Premier Salon";
    var photoEl = document.getElementById("profile-photo");
    photoEl.innerHTML = s.photo
      ? '<img src="../' + esc(s.photo) + '" alt="' + esc(s.name) + '">'
      : USER_ICON;
    photoEl.className = s.photo ? "profile-photo" : "profile-photo placeholder";
    var roleEl = document.getElementById("profile-role");
    roleEl.textContent = s.role;
    roleEl.style.color = s.roleColor || "";
    var nameEl = document.getElementById("profile-name");
    nameEl.textContent = s.name;
    nameEl.style.color = s.nameColor || "";
    var specialtyEl = document.getElementById("profile-specialty");
    specialtyEl.textContent = s.specialty;
    specialtyEl.style.color = s.specialtyColor || "";
    var bioEl = document.getElementById("profile-bio");
    bioEl.textContent = s.bio;
    bioEl.style.color = s.bioColor || "";
    var phoneLink = document.getElementById("profile-phone");
    phoneLink.href = "tel:" + s.phoneTel;
    phoneLink.innerHTML = PHONE_ICON + esc(s.phone);
    phoneLink.style.color = s.phoneColor || "";
    var linksEl = document.getElementById("profile-links");
    linksEl.innerHTML = (s.links || []).filter(function (l) { return l.url && l.url !== "#"; }).map(function (l) {
      return '<a class="link-pill" href="' + esc(l.url) + '" target="_blank" rel="noopener"' + colorStyle(l.labelColor) + '>' + linkIcon(l.label) + esc(l.label) + '</a>';
    }).join("");
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function run() {
    setupMobileMenu();
    loadData(function (data) {
      renderTheme(data);
      renderTeamGrid(data);
      renderHero(data);
      renderTestimonials(data);
      renderSpecialtyLines(data);
      renderContact(data);
      renderProfile(data);
      renderSiteChrome(data);
      renderGallery(data);
      renderAboutPage(data);
      renderServicesPage(data);
      renderTeamIntro(data);
    });
  }

  window.__renderSite = run;

  if (document.readyState !== "loading") run();
  else document.addEventListener("DOMContentLoaded", run);
})();
