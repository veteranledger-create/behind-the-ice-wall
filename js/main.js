(function () {
  "use strict";

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ---------------- Theme (light/dark) ---------------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");

  function applyTheme(mode) {
    if (mode === "dark") {
      root.classList.add("dark");
      if (themeToggle) themeToggle.setAttribute("aria-pressed", "true");
    } else {
      root.classList.remove("dark");
      if (themeToggle) themeToggle.setAttribute("aria-pressed", "false");
    }
  }

  var storedTheme = null;
  try { storedTheme = localStorage.getItem("bitw-theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(storedTheme ? storedTheme : (prefersDark ? "dark" : "light"));

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.classList.contains("dark") ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("bitw-theme", next); } catch (e) {}
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------- Subtle hero parallax ---------------- */
  var heroImage = document.querySelector("[data-parallax]");
  if (heroImage && !prefersReducedMotion()) {
    var ticking = false;
    function updateParallax() {
      var rect = heroImage.getBoundingClientRect();
      var progress = 1 - Math.max(0, Math.min(1, rect.top / window.innerHeight));
      var shift = progress * 22; // px, kept small and tasteful
      heroImage.style.transform = "translateY(" + shift + "px)";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  /* ---------------- Illustrations gallery (horizontal swipe) ---------------- */
  document.querySelectorAll(".gallery").forEach(function (gallery) {
    var track = gallery.querySelector("[data-gallery-track]");
    var prevBtn = gallery.querySelector("[data-gallery-prev]");
    var nextBtn = gallery.querySelector("[data-gallery-next]");
    if (!track) return;

    function step() {
      var item = track.querySelector(".figure");
      return item ? item.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    }
    function scrollBy(dir) {
      track.scrollBy({ left: dir * step(), behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
    function updateButtons() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= max;
    }
    if (prevBtn) prevBtn.addEventListener("click", function () { scrollBy(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollBy(1); });
    track.addEventListener("scroll", function () {
      window.requestAnimationFrame(updateButtons);
    }, { passive: true });
    updateButtons();
  });

  /* ---------------- Sticky mobile buy bar ---------------- */
  // Shown only on phone widths (CSS handles that); appears once the hero has
  // scrolled out of view, and hides again once the dedicated Buy section is
  // visible so it never competes with that section's own CTA.
  var stickyCta = document.getElementById("stickyCta");
  var heroSection = document.querySelector(".section--hero");
  var buySection = document.getElementById("buy");
  if (stickyCta && heroSection && buySection && "IntersectionObserver" in window) {
    var pastHero = false;
    var atBuy = false;
    function updateStickyCta() {
      stickyCta.classList.toggle("is-visible", pastHero && !atBuy);
    }
    var heroObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
          updateStickyCta();
        });
      },
      { threshold: 0 }
    );
    heroObserver.observe(heroSection);
    var buyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          atBuy = entry.isIntersecting;
          updateStickyCta();
        });
      },
      { threshold: 0.15 }
    );
    buyObserver.observe(buySection);
  }

  /* ---------------- Chapters accordion ---------------- */
  document.querySelectorAll(".accordion").forEach(function (accordion) {
    accordion.addEventListener("click", function (e) {
      var trigger = e.target.closest(".accordion-trigger");
      if (!trigger || !accordion.contains(trigger)) return;
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (!panel) return;
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      var nowExpanded = !expanded;
      trigger.setAttribute("aria-expanded", String(nowExpanded));
      // max-height:0 + overflow:hidden hides the panel visually, but some
      // assistive tech will still expose clipped content — aria-hidden makes
      // the collapsed state unambiguous for screen readers too.
      panel.setAttribute("aria-hidden", String(!nowExpanded));
      panel.style.maxHeight = expanded ? "0px" : panel.scrollHeight + "px";
    });
  });

  /* ---------------- Smooth in-page navigation ---------------- */
  // Handles the fixed header covering the target section on jump.
  var headerEl = document.querySelector(".site-header");
  function headerOffset() {
    return (headerEl ? headerEl.getBoundingClientRect().height : 0) + 12;
  }
  function scrollToId(id) {
    var target = document.getElementById(id);
    if (!target) return false;
    var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    window.scrollTo({ top: Math.max(0, y), behavior: prefersReducedMotion() ? "auto" : "smooth" });
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    return true;
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    if (!id || !document.getElementById(id)) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToId(id);
      try { if (window.history && history.pushState) history.pushState(null, "", "#" + id); } catch (err) {}
    });
  });
})();
