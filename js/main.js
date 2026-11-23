const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-nav");

if (menuButton && navigation) {
  document.documentElement.classList.add("has-menu");

  function setMenu(open) {
    navigation.toggleAttribute("data-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.querySelector(".menu-label").textContent = open ? "Close" : "Menu";
  }

  menuButton.addEventListener("click", () => setMenu(!navigation.hasAttribute("data-open")));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.hasAttribute("data-open")) {
      setMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) setMenu(false);
  });
  document.querySelector(".site-header").addEventListener("focusout", (event) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setMenu(false);
  });
  window.matchMedia("(max-width: 52rem)").addEventListener("change", () => setMenu(false));
  window.addEventListener("pageshow", () => setMenu(false));
}
