/**
 * IRONWORKS FITNESS — 랜딩 페이지 인터랙션
 * 포트폴리오용 목업이므로 예약 데이터는 전송/저장하지 않습니다.
 */
(function () {
  "use strict";

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 헤더 스크롤 상태 ---------- */
  const header = $("#site-header");

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------- 모바일 메뉴 ---------- */
  const nav = $("#primary-nav");
  const navToggle = $(".nav-toggle");

  const setNavOpen = (open) => {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  };

  navToggle.addEventListener("click", () => {
    setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  $$("a", nav).forEach((link) => link.addEventListener("click", () => setNavOpen(false)));

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  // 데스크톱 폭으로 넓어지면 모바일 메뉴 상태를 초기화한다
  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
    if (event.matches) setNavOpen(false);
  });

  /* ---------- 스크롤 스파이 ---------- */
  const navLinks = $$(".nav__link");
  const spySections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && spySections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    spySections.forEach((section) => spy.observe(section));
  }

  /* ---------- 등장 애니메이션 ---------- */
  const revealItems = $$(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    // 같은 그리드 안의 카드는 순서대로 살짝 지연시켜 표시한다
    revealItems.forEach((item) => {
      const siblings = Array.from(item.parentElement.children).filter((el) =>
        el.classList.contains("reveal")
      );
      const index = siblings.indexOf(item);
      if (index > 0) item.style.transitionDelay = Math.min(index * 70, 350) + "ms";
      revealObserver.observe(item);
    });
  }

  /* ---------- 히어로 카운트업 ---------- */
  const counters = $$("[data-count-to]");

  const runCounter = (el) => {
    const target = Number(el.dataset.countTo);
    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString("ko-KR");
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ko-KR");
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- 이미지 폴백 ---------- */
  // 오프라인이나 CDN 차단 환경에서도 레이아웃이 깨지지 않도록 처리
  $$(".trainer-card__photo img").forEach((img) => {
    const markBroken = () => img.classList.add("is-broken");
    img.addEventListener("error", markBroken);
    if (img.complete && img.naturalWidth === 0) markBroken();
  });

  const heroImg = $("[data-fallback-hero]");
  if (heroImg) {
    const hideHero = () => {
      heroImg.style.display = "none";
    };
    heroImg.addEventListener("error", hideHero);
    if (heroImg.complete && heroImg.naturalWidth === 0) hideHero();
  }

  /* ---------- 가격표 탭 ---------- */
  const tabs = $$(".pricing-tabs__btn");

  const activateTab = (tab) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      $("#" + item.getAttribute("aria-controls")).hidden = !selected;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      const next = tabs[(index + step + tabs.length) % tabs.length];
      activateTab(next);
      next.focus();
    });
  });

  /* ---------- 예약 폼 ---------- */
  const form = $("#booking-form");
  const submitBtn = $("#submit-btn");
  const dateInput = $("#date");
  const phoneInput = $("#phone");
  const trainerSelect = $("#trainer");
  const messageInput = $("#message");
  const messageCount = $("#message-count");

  const toDateValue = (date) => {
    const offset = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return offset.toISOString().slice(0, 10);
  };

  const today = new Date();
  dateInput.min = toDateValue(today);
  dateInput.max = toDateValue(new Date(today.getTime() + 90 * 86400000));

  // 연락처 자동 하이픈 (010-1234-5678)
  phoneInput.addEventListener("input", () => {
    const digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;

    if (digits.length > 7) {
      formatted = digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
    } else if (digits.length > 3) {
      formatted = digits.slice(0, 3) + "-" + digits.slice(3);
    }

    phoneInput.value = formatted;
  });

  messageInput.addEventListener("input", () => {
    messageCount.textContent = String(messageInput.value.length);
  });

  const validators = {
    name() {
      const value = $("#name").value.trim();
      if (!value) return "이름을 입력해 주세요.";
      if (value.length < 2) return "이름을 2자 이상 입력해 주세요.";
      return "";
    },
    phone() {
      const value = phoneInput.value.trim();
      if (!value) return "연락처를 입력해 주세요.";
      if (!/^01[016789]-\d{3,4}-\d{4}$/.test(value)) {
        return "010-1234-5678 형식으로 입력해 주세요.";
      }
      return "";
    },
    date() {
      const value = dateInput.value;
      if (!value) return "희망 날짜를 선택해 주세요.";
      if (value < dateInput.min) return "오늘 이후 날짜를 선택해 주세요.";
      if (value > dateInput.max) return "3개월 이내 날짜로 선택해 주세요.";
      return "";
    },
    time() {
      return $("#time").value ? "" : "희망 시간대를 선택해 주세요.";
    },
    goal() {
      return $('input[name="goal"]:checked') ? "" : "운동 목적을 하나 선택해 주세요.";
    },
    agree() {
      return $("#agree").checked ? "" : "개인정보 수집 및 이용에 동의해 주세요.";
    },
  };

  const errorTargets = {
    name: "#name",
    phone: "#phone",
    date: "#date",
    time: "#time",
    goal: '.chips input[name="goal"]',
    agree: "#agree",
  };

  const showError = (key, message) => {
    $("#" + key + "-error").textContent = message;
    const field = $(errorTargets[key]);
    if (field) {
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
  };

  const validateField = (key) => {
    const message = validators[key]();
    showError(key, message);
    return !message;
  };

  // 값을 고친 직후 바로 오류 문구가 사라지도록 연결
  Object.keys(validators).forEach((key) => {
    const selector = key === "goal" ? '.chips input[name="goal"]' : "#" + key;
    $$(selector).forEach((field) => {
      const eventName = field.type === "text" || field.type === "tel" ? "blur" : "change";
      field.addEventListener(eventName, () => validateField(key));
      if (eventName === "blur") {
        field.addEventListener("input", () => {
          if ($("#" + key + "-error").textContent) validateField(key);
        });
      }
    });
  });

  /* ---------- 완료 모달 ---------- */
  const modal = $("#success-modal");
  const modalSummary = $("#modal-summary");
  let lastFocused = null;

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("is-locked");
    if (lastFocused) lastFocused.focus();
  };

  const openModal = (summary) => {
    modalSummary.innerHTML = "";
    summary.forEach(([label, value]) => {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      row.append(dt, dd);
      modalSummary.append(row);
    });

    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("is-locked");
    $(".modal__dialog .btn").focus();
  };

  $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      return;
    }

    if (event.key !== "Tab") return;

    // 모달 안에서 포커스가 순환하도록 제한
    const focusables = $$(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      modal
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- 제출 (목업) ---------- */
  const formatDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][
      new Date(year, month - 1, day).getDay()
    ];
    return `${year}년 ${month}월 ${day}일 (${weekday})`;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const keys = Object.keys(validators);
    const invalidKeys = keys.filter((key) => !validateField(key));

    if (invalidKeys.length) {
      const firstInvalid = $(errorTargets[invalidKeys[0]]);
      if (firstInvalid) {
        firstInvalid.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
        });
        firstInvalid.focus({ preventScroll: true });
      }
      return;
    }

    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;
    $(".btn__label", submitBtn).textContent = "접수 중...";

    // 서버 전송 없이 네트워크 지연만 재현해 제출 UX를 보여준다
    window.setTimeout(() => {
      const summary = [
        ["이름", $("#name").value.trim()],
        ["연락처", phoneInput.value],
        ["희망 트레이너", trainerSelect.value || "센터 배정"],
        ["희망 일시", `${formatDate(dateInput.value)} · ${$("#time").value}`],
        ["운동 목적", $('input[name="goal"]:checked').value],
      ];

      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
      $(".btn__label", submitBtn).textContent = "무료 체험 PT 예약하기";

      form.reset();
      messageCount.textContent = "0";
      openModal(summary);
    }, 900);
  });

  /* ---------- 카드 버튼 → 폼 연동 ---------- */
  const focusBooking = (field) => {
    $("#booking").scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.setTimeout(() => field.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 500);
  };

  $$("[data-trainer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      trainerSelect.value = btn.dataset.trainer;
      focusBooking(dateInput);
    });
  });

  $$("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      const note = `${plan} 상담을 희망합니다.`;
      messageInput.value = messageInput.value.includes(note)
        ? messageInput.value
        : (messageInput.value ? messageInput.value.trim() + "\n" : "") + note;
      messageCount.textContent = String(messageInput.value.length);
      focusBooking($("#name"));
    });
  });
})();
