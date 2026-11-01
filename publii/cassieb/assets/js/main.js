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

    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", function (e) {
      if (!primaryNav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Sticky header shadow + back to top ---------- */
  var header = document.getElementById("header");
  var backToTop = document.getElementById("backToTop");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
    if (backToTop) backToTop.hidden = window.scrollY < 500;
  }

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
      ".resonate-list li",
      ".about-content > *",
      ".about-art",
      ".workthrough-list li",
      ".step",
      ".diff-card",
      ".specialty-card",
      ".faq-item",
      ".note-card",
      ".archive-card"
    ];

    document.querySelectorAll(revealTargets.join(",")).forEach(function (el) {
      el.classList.add("reveal");
    });

    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var success = document.getElementById("formSuccess");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* If no backend endpoint is configured, fall back to opening
       the visitor's email app with the message pre-filled. */
    var hasEndpoint = !!form.getAttribute("action");

    function setError(field, invalid) {
      field.classList.toggle("invalid", invalid);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;

      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var consent = form.querySelector("#consent");

      if (!name.value.trim()) { setError(name.closest(".form-field"), true); ok = false; }
      else setError(name.closest(".form-field"), false);

      if (!emailRe.test(email.value.trim())) { setError(email.closest(".form-field"), true); ok = false; }
      else setError(email.closest(".form-field"), false);

      if (!consent.checked) { setError(consent.closest(".form-field"), true); ok = false; }
      else setError(consent.closest(".form-field"), false);

      if (!ok) return;

      if (hasEndpoint) {
        /* Endpoint configured (e.g. Formspree) — send natively. */
        form.removeAttribute("novalidate");
        form.submit();
        success.hidden = false;
        return;
      }

      /* Mailto fallback */
      var to = form.getAttribute("data-email") || "";
      var subject = "Website inquiry from " + name.value.trim();
      var body =
        "Name: " + name.value.trim() +
        "\nEmail: " + email.value.trim() +
        "\nPhone: " + (form.querySelector("#phone").value.trim() || "-") +
        "\nService: " + (form.querySelector("#service").value || "Not specified") +
        "\n\nWhat's bringing me to therapy:\n" +
        (form.querySelector("#message").value.trim() || "-");
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      success.hidden = false;
    });

    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("input", function () {
        setError(input.closest(".form-field"), false);
      });
    });
  }
})();
