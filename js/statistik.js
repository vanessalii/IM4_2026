const kalenderTage = document.querySelectorAll(".kalender-tag");
const overlay = document.getElementById("tagOverlay");
const schliessenButton = document.querySelector(".overlay-schliessen");

kalenderTage.forEach((tag) => {
  tag.addEventListener("click", () => {
    overlay.classList.add("aktiv");
  });
});

schliessenButton.addEventListener("click", () => {
  overlay.classList.remove("aktiv");
});

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) {
    overlay.classList.remove("aktiv");
  }
});

