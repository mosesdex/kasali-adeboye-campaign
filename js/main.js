/* Omoba Kasali Adeboye — campaign site interactions */
(function () {
  "use strict";

  /* ---------- sticky nav + progress bar + back-to-top ---------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("navProgress");
  var toTop = document.getElementById("toTop");
  var onScroll = function () {
    var y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    if (toTop) toTop.classList.toggle("is-visible", y > window.innerHeight * 1.5);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0 });
    });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");

  var scrim = document.createElement("div");
  scrim.className = "nav__scrim";
  scrim.setAttribute("aria-hidden", "true");
  document.body.appendChild(scrim);

  function closeMenu() {
    links.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  }

  burger.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
  });

  scrim.addEventListener("click", closeMenu);

  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- active nav link ---------- */
  var sections = ["about", "jinx", "agenda", "movement", "team", "contact"];
  var navAnchors = Array.prototype.slice.call(links.querySelectorAll("a"));

  var sectionSpy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sectionSpy.observe(el);
  });

  /* ---------- reveal on scroll ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var pending = Array.prototype.slice.call(revealEls);

    var show = function (el, delay) {
      var idx = pending.indexOf(el);
      if (idx === -1) return;
      pending.splice(idx, 1);
      if (delay) {
        setTimeout(function () { el.classList.add("is-visible"); }, delay);
      } else {
        el.classList.add("is-visible");
      }
      revealObserver.unobserve(el);
    };

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          show(el, Math.min((el.dataset.revealIndex || 0) * 60, 240));
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    /* stagger siblings that reveal together */
    var groups = {};
    revealEls.forEach(function (el) {
      var key = el.parentElement ? Array.prototype.indexOf.call(document.querySelectorAll("*"), el.parentElement) : 0;
      groups[key] = (groups[key] || 0);
      el.dataset.revealIndex = groups[key]++;
      revealObserver.observe(el);
    });

    /* Fallback: IntersectionObserver can lag after anchor jumps or in
       throttled/background tabs — sweep anything already in view. */
    var sweepScheduled = false;
    var sweep = function () {
      sweepScheduled = false;
      for (var i = pending.length - 1; i >= 0; i--) {
        var rect = pending[i].getBoundingClientRect();
        if (rect.top < window.innerHeight - 20 && rect.bottom > 0) {
          show(pending[i], 0);
        }
      }
    };
    var scheduleSweep = function () {
      if (sweepScheduled) return;
      sweepScheduled = true;
      setTimeout(sweep, 120);
    };
    window.addEventListener("scroll", scheduleSweep, { passive: true });
    window.addEventListener("resize", scheduleSweep, { passive: true });
    window.addEventListener("hashchange", scheduleSweep);
    setTimeout(sweep, 400);
  }

  /* ---------- hero video: pause when off-screen, save data ---------- */
  var heroVideos = document.querySelectorAll(".hero__video");
  var hero = document.querySelector(".hero");

  if (hero && "IntersectionObserver" in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        heroVideos.forEach(function (v) {
          if (entry.isIntersecting) {
            if (v.offsetParent !== null) { v.play().catch(function () {}); }
          } else {
            v.pause();
          }
        });
      });
    }, { threshold: 0.05 });
    heroObserver.observe(hero);
  }

  if (reduceMotion) {
    heroVideos.forEach(function (v) {
      v.removeAttribute("autoplay");
      v.pause();
    });
  }

  /* ---------- stat count-up ---------- */
  var counters = document.querySelectorAll("[data-countup]");
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    var formatNum = function (value, format) {
      return format === "comma" ? value.toLocaleString("en-NG") : String(value);
    };
    var runCount = function (el) {
      var target = parseInt(el.dataset.countup, 10);
      var format = el.dataset.format;
      var start = null;
      var duration = 1400;
      var step = function (ts) {
        if (!start) start = ts;
        var t = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = formatNum(Math.round(target * eased), format);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- gallery lightbox ---------- */
  var galleryImgs = Array.prototype.slice.call(document.querySelectorAll(".gallery__item img"));
  if (galleryImgs.length) {
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Photo viewer");
    lightbox.innerHTML =
      '<img alt="">' +
      '<button class="lightbox__btn lightbox__close" aria-label="Close photo viewer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
      '<button class="lightbox__btn lightbox__prev" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<button class="lightbox__btn lightbox__next" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '<span class="lightbox__count" aria-hidden="true"></span>';
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector("img");
    var lbCount = lightbox.querySelector(".lightbox__count");
    var current = 0;
    var lastFocus = null;

    var showAt = function (i) {
      current = (i + galleryImgs.length) % galleryImgs.length;
      lbImg.src = galleryImgs[current].src;
      lbImg.alt = galleryImgs[current].alt;
      lbCount.textContent = (current + 1) + " / " + galleryImgs.length;
    };
    var openLb = function (i) {
      lastFocus = document.activeElement;
      showAt(i);
      lightbox.classList.add("is-open");
      document.body.classList.add("menu-open");
      lightbox.querySelector(".lightbox__close").focus();
    };
    var closeLb = function () {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      if (lastFocus) lastFocus.focus();
    };

    galleryImgs.forEach(function (img, i) {
      img.closest(".gallery__item").addEventListener("click", function () { openLb(i); });
    });
    lightbox.querySelector(".lightbox__close").addEventListener("click", closeLb);
    lightbox.querySelector(".lightbox__prev").addEventListener("click", function () { showAt(current - 1); });
    lightbox.querySelector(".lightbox__next").addEventListener("click", function () { showAt(current + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showAt(current - 1);
      if (e.key === "ArrowRight") showAt(current + 1);
    });
  }

  /* ---------- movement clips: pause others when one plays ---------- */
  var clips = Array.prototype.slice.call(document.querySelectorAll(".clip video"));
  clips.forEach(function (video) {
    video.addEventListener("play", function () {
      clips.forEach(function (other) {
        if (other !== video) other.pause();
      });
    });
  });

  /* ---------- volunteer form (front-end only) ---------- */
  var form = document.getElementById("joinForm");
  if (form) {
    var note = document.getElementById("formNote");

    function setError(input, message) {
      var errorEl = input.closest(".field").querySelector(".field__error");
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (errorEl) errorEl.textContent = message || "";
    }

    function validateField(input) {
      var value = input.value.trim();
      if (input.id === "fName" && value.length < 2) {
        setError(input, "Please enter your full name.");
        return false;
      }
      if (input.id === "fPhone" && !/^[+0-9][0-9 \-()]{6,}$/.test(value)) {
        setError(input, "Please enter a valid phone number, e.g. 0803 000 0000.");
        return false;
      }
      setError(input, "");
      return true;
    }

    ["fName", "fPhone"].forEach(function (id) {
      var input = document.getElementById(id);
      input.addEventListener("blur", function () { validateField(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fName");
      var phone = document.getElementById("fPhone");
      var okName = validateField(name);
      var okPhone = validateField(phone);

      if (!okName || !okPhone) {
        (okName ? phone : name).focus();
        return;
      }

      /* No backend yet — store locally and confirm. Campaign can wire this
         to Formspree / Google Forms / WhatsApp later. */
      try {
        var entries = JSON.parse(localStorage.getItem("kasali_volunteers") || "[]");
        entries.push({
          name: name.value.trim(),
          phone: phone.value.trim(),
          ward: document.getElementById("fWard").value,
          message: document.getElementById("fMsg").value.trim(),
          at: new Date().toISOString()
        });
        localStorage.setItem("kasali_volunteers", JSON.stringify(entries));
      } catch (err) { /* storage unavailable — still confirm */ }

      form.reset();
      note.textContent = "Thank you! You are counted. The campaign team will reach out to you.";
      note.classList.add("is-success");
    });
  }
})();
