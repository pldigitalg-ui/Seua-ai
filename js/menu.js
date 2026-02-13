(function () {
  const btn = document.getElementById("menuToggle");
  const menu = document.getElementById("siteMenu");
  const overlay = document.getElementById("menuOverlay");
  if (!btn || !menu || !overlay) return;

  function openMenu() {
    document.body.classList.add("corpo-menu-abrir");
  }

  function closeMenu() {
    document.body.classList.remove("corpo-menu-abrir");
  }

  function toggleMenu() {
    document.body.classList.contains("corpo-menu-abrir") ? closeMenu() : openMenu();
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  overlay.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // clicou em qualquer link do menu = fecha
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
})();

