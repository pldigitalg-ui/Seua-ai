document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("menuToggle");
  const overlay = document.getElementById("menuOverlay");
  if (!btn || !overlay) return;

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    document.body.classList.toggle("menu-open");
  });

  overlay.addEventListener("click", function () {
    document.body.classList.remove("menu-open");
  });
});
