// Dapr docs theme toggle.
//
// Flips `data-bs-theme` on <html> between "light" and "dark" and persists the
// choice in localStorage under "dapr-theme". The initial theme (OS
// preference vs. stored choice) is set by an inline no-flash script in
// hooks/head-end.html, which runs before this bundle loads.
const root = document.documentElement;
function set(theme) {
  root.setAttribute("data-bs-theme", theme);
  try { localStorage.setItem("dapr-theme", theme); } catch (e) {}
}
const btn = document.getElementById("dapr-theme-toggle");
if (btn) btn.addEventListener("click", () => {
  set(root.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
});
