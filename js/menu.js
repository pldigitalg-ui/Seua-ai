document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("menuToggle");
  const overlay = document.getElementById("menuOverlay");
  if (!btn || !overlay) return;

  const toggle = () => document.body.classList.toggle("menu-open");
  const close  = () => document.body.classList.remove("menu-open");

  btn.addEventListener("pointerup", (e) => { e.preventDefault(); toggle(); });
  btn.addEventListener("click", (e) => { e.preventDefault(); toggle(); }); // fallback
  overlay.addEventListener("pointerup", close);
  overlay.addEventListener("click", close);
});
