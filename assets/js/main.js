/* ====================================================
   Cassie B Therapy — Publii theme interactions
   ==================================================== */
(function () {
  "use strict";

  /* ---------- Current year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var primaryNav = document.getElementById("primaryNav");

  function closeNav() {
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* close on link click */
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    /* close on outside click */
    document.addEventListener("click", function (e) {
      if (!primaryNav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    /* close on Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
    if (backToTop) backToTop.hidden = window.scrollY < 500;
  }

  /* ---------- Back to top ---------- */
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  if ("IntersectionObserver" in window) {
    var revealTargets = [
      ".about-content > *",
      ".about-art",
      ".workthrough-list li",
      ".step",
      ".specialty-card",
      ".book-tile",
      ".nutsbolts-card",
      ".faq-item"
    ];

    document.querySelectorAll(revealTargets.join(",")).forEach(function (el) {
      el.classList.add("reveal");
    });

    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            /* slight stagger within a group */
            setTimeout(function () { entry.target.classList.add("in"); }, 0);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }
})();
