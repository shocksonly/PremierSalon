(function () {
  // Live WYSIWYG previews: instead of hand-built mockups, this loads the
  // real site page (same HTML/CSS/JS the visitor sees) into an iframe and
  // feeds it the in-progress edits via the __SITE_DATA__ / __PREVIEW_MODE__
  // hooks already built into js/render.js. Uses only the React helpers the
  // Decap bundle exposes itself (createClass/h) — no separate React is
  // loaded, which is what caused the earlier React #525 crash.

  function fetchJSON(url) {
    return fetch(url)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }

  function resolveImage(getAsset, value) {
    if (!value) return value;
    try {
      var asset = getAsset(value);
      return asset ? asset.toString() : value;
    } catch (e) {
      return value;
    }
  }

  // Applies live (possibly unsaved) image field values from the entry being
  // edited, resolving them through Decap's asset store so newly-picked
  // images show up before they're saved. Only done for top-level single
  // image fields — getAsset can't reliably resolve nested-folder paths for
  // images inside list widgets (it drops subfolders), so those keep using
  // the raw saved path, same as the live site does.
  function resolveImages(fileKey, obj, getAsset) {
    if (!obj) return obj;
    var out = Object.assign({}, obj);
    if (fileKey === "site" && out.logo) {
      out.logo = resolveImage(getAsset, out.logo);
    }
    if (fileKey === "home") {
      if (out.heroPhoto) out.heroPhoto = resolveImage(getAsset, out.heroPhoto);
      if (out.shelfPhoto) out.shelfPhoto = resolveImage(getAsset, out.shelfPhoto);
    }
    return out;
  }

  function toSiteData(raw) {
    var team = raw.team || {};
    var gallery = raw.gallery || {};
    return {
      home: raw.home || {},
      contact: raw.contact || {},
      team: team.stylists || [],
      teamIntro: team.intro || "",
      site: raw.site || {},
      gallery: gallery.photos || [],
      about: raw.about || {},
      services: raw.services || {},
      theme: raw.theme || {},
    };
  }

  function createSitePreview(pagePath, fileKey) {
    return createClass({
      handleIframeLoad: function () {
        var self = this;
        Promise.all([
          fetchJSON("/content/home.json"),
          fetchJSON("/content/contact.json"),
          fetchJSON("/content/team.json"),
          fetchJSON("/content/site.json"),
          fetchJSON("/content/gallery.json"),
          fetchJSON("/content/about.json"),
          fetchJSON("/content/services.json"),
          fetchJSON("/content/theme.json"),
        ]).then(function (r) {
          self.rawSiblings = {
            home: r[0], contact: r[1], team: r[2], site: r[3],
            gallery: r[4], about: r[5], services: r[6], theme: r[7],
          };
          self.refresh();
        });
      },
      componentDidUpdate: function () {
        this.refresh();
      },
      refresh: function () {
        if (!this.rawSiblings || !this.iframe) return;
        var win = this.iframe.contentWindow;
        if (!win) return;
        var entryData = this.props.entry.get("data") ? this.props.entry.get("data").toJS() : {};
        var raw = Object.assign({}, this.rawSiblings);
        raw[fileKey] = resolveImages(fileKey, entryData, this.props.getAsset);
        try {
          win.__SITE_DATA__ = toSiteData(raw);
          win.__PREVIEW_MODE__ = true;
          if (typeof win.__renderSite === "function") win.__renderSite();
        } catch (e) {
          console.error("[preview] failed to render live preview:", e);
        }
      },
      render: function () {
        var self = this;
        return h("iframe", {
          key: pagePath,
          src: pagePath,
          title: "Preview",
          onLoad: this.handleIframeLoad,
          ref: function (el) { self.iframe = el; },
          style: { width: "100%", height: "100%", border: "none", background: "#fff" },
        });
      },
    });
  }

  CMS.registerPreviewTemplate("site", createSitePreview("/index.html", "site"));
  CMS.registerPreviewTemplate("home", createSitePreview("/index.html", "home"));
  CMS.registerPreviewTemplate("contact", createSitePreview("/index.html", "contact"));
  CMS.registerPreviewTemplate("theme", createSitePreview("/index.html", "theme"));
  CMS.registerPreviewTemplate("about", createSitePreview("/about.html", "about"));
  CMS.registerPreviewTemplate("services", createSitePreview("/services.html", "services"));
  CMS.registerPreviewTemplate("gallery", createSitePreview("/gallery.html", "gallery"));
  CMS.registerPreviewTemplate("team", createSitePreview("/team.html", "team"));
})();
