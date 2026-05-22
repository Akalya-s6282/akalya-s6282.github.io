document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const sections = document.querySelectorAll(".section");
  const mainContent = document.querySelector(".main-content");
  const topNav = document.getElementById("topNav");
  const hamburger = document.getElementById("hamburger");
  const navOverlay = document.getElementById("navOverlay");
  const mobileNavClose = document.getElementById("mobileNavClose");
  const mobileBreakpoint = window.matchMedia("(max-width: 768px)");

  // Slider
  // Data source (change to an external raw URL if you host projects elsewhere)
  const DATA_URL = "data/projects.json";

  // Project Modal elements (used after rendering)
  const projectModal = document.getElementById("projectModal");
  const modalImg = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDescription");
  const modalGithub = document.getElementById("modalGithub");
  const closeProjectModal = projectModal.querySelector(".close");

  // Utility: escape text for insertion into HTML
  const escapeHtml = str => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  // Fetch projects and render slider + grid dynamically
  async function loadProjects() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`Failed to load ${DATA_URL}: ${res.status}`);
      const projects = await res.json();

      const sliderEl = document.querySelector(".slider");
      const gridEl = document.querySelector(".project-grid");

      // Render slides
      sliderEl.innerHTML = projects
        .map(
          p => `
        <div class="slide" data-title="${escapeHtml(p.title)}" data-description="${escapeHtml(
            p.description
          )}" data-github="${escapeHtml(p.link)}">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" />
          <h3>${escapeHtml(p.title)}</h3>
        </div>`
        )
        .join("");

      // Render grid
      gridEl.innerHTML = projects
        .map(
          p => `
        <div class="grid-item" data-title="${escapeHtml(p.title)}" data-description="${escapeHtml(
            p.description
          )}" data-link="${escapeHtml(p.link)}">
          <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" />
          <p>${escapeHtml(p.title)}</p>
        </div>`
        )
        .join("");

      // After rendering, wire up slider and modal behavior
      const slides = document.querySelectorAll(".slide");
      const slider = document.querySelector(".slider");
      const nextBtn = document.querySelector(".next");
      const prevBtn = document.querySelector(".prev");

      let index = 0;
      let autoSlideInterval;

      const showSlide = i => {
        index = (i + slides.length) % slides.length;
        slider.style.transform = `translateX(-${index * 100}%)`;
      };

      const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => showSlide(index + 1), 4000);
      };
      const stopAutoSlide = () => clearInterval(autoSlideInterval);
      const resetAutoSlide = () => {
        stopAutoSlide();
        startAutoSlide();
      };

      nextBtn.addEventListener("click", () => {
        showSlide(index + 1);
        resetAutoSlide();
      });
      prevBtn.addEventListener("click", () => {
        showSlide(index - 1);
        resetAutoSlide();
      });
      startAutoSlide();

      const openProjectModal = item => {
        stopAutoSlide();
        projectModal.style.display = "block";
        modalImg.src = item.querySelector("img").src;
        modalTitle.textContent = item.dataset.title;
        modalDesc.textContent = item.dataset.description;
        modalGithub.href = item.dataset.github || item.dataset.link;
      };

      const closeProjectHandler = () => {
        projectModal.style.display = "none";
        startAutoSlide();
      };

      slides.forEach(slide => slide.addEventListener("click", () => openProjectModal(slide)));

      const gridItems = document.querySelectorAll(".grid-item");
      gridItems.forEach(item => item.addEventListener("click", () => openProjectModal(item)));

      closeProjectModal.addEventListener("click", closeProjectHandler);
      window.addEventListener("click", e => {
        if (e.target === projectModal) closeProjectHandler();
      });
    } catch (err) {
      // Fail gracefully — leave existing markup if present
      console.error("Failed to load projects:", err);
    }
  }

  // Start loading projects
  loadProjects();

  // Certificates Modal
  const certModal = document.getElementById("certificatePreview");
  const certTitle = document.getElementById("previewCertTitle");
  const certIssuer = document.getElementById("previewCertIssuer");
  const certLink = document.getElementById("previewCertLink");
  const certIframe = document.getElementById("previewCertIframe");
  const closeCertModal = document.getElementById("closeCertificatePreview");
  const certCards = document.querySelectorAll(".certificate-card");

  // Theme Toggle
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const setThemeIcon = isDark => {
    themeIcon.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  };

  // --- Hamburger Menu ---
  const closeMobileNav = () => {
    topNav.classList.remove("show");
    hamburger.classList.remove("active");
    navOverlay?.classList.remove("show");
    document.body.classList.remove("nav-open");
  };

  hamburger.addEventListener("click", () => {
    const isOpen = topNav.classList.toggle("show");
    hamburger.classList.toggle("active", isOpen);
    navOverlay?.classList.toggle("show", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
  });

  document.querySelectorAll(".top-nav a").forEach(link => {
    link.addEventListener("click", () => {
      closeMobileNav();
    });
  });

  mobileNavClose?.addEventListener("click", closeMobileNav);
  navOverlay?.addEventListener("click", closeMobileNav);

  // --- NAV VISIBILITY LOGIC ---
  const updateNavVisibility = () => {
    if (mobileBreakpoint.matches) {
      topNav.style.display = "flex";
      return;
    }

    topNav.style.display = "";

    const fromTop = mainContent.scrollTop;
    const activeSection = [...sections].find(
      section =>
        section.offsetTop <= fromTop + 100 &&
        section.offsetTop + section.offsetHeight > fromTop
    );

    topNav.style.display = activeSection?.id === "landing" ? "none" : "flex";
  };

  let ticking = false;
  mainContent.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateNavVisibility();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateNavVisibility();

  mobileBreakpoint.addEventListener("change", () => {
    closeMobileNav();
    updateNavVisibility();
  });


  // --- CERTIFICATES MODAL ---
  certCards.forEach(card => {
    card.querySelector(".view-btn").addEventListener("click", e => {
      e.preventDefault();
      const fileId = card.dataset.fileId;
      certTitle.textContent = card.dataset.title;
      certIssuer.textContent = card.dataset.issuer;
      certIframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
      certLink.href = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      certModal.style.display = "block";
      certModal.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  closeCertModal.addEventListener("click", () => { certModal.style.display = "none"; });

  // --- CONTACT FORM ---
  document.getElementById("contactForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;

    const body =
      "Dear Akalya,%0D%0A%0D%0A" +
      encodeURIComponent(message) +
      "%0D%0A%0D%0ARegards,%0D%0A" +
      encodeURIComponent(name) +
      "%0D%0A" +
      encodeURIComponent(email);

    const mailtoLink = `mailto:akalya6282@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailtoLink;
  });

  // --- THEME TOGGLE (Sun/Moon) ---
  if (localStorage.getItem("dark-mode") === "true") {
    document.body.classList.add("dark-mode");
  }
  setThemeIcon(document.body.classList.contains("dark-mode"));

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    setThemeIcon(isDark);
    localStorage.setItem("dark-mode", isDark);
  });
});


