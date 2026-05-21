const auswahlButtons = document.querySelectorAll(".auswahl-button");

auswahlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const karte = button.closest(".personalisierung-karte");
    const buttons = karte.querySelectorAll(".auswahl-button");
    const status = karte.querySelector(".status-text strong");

    buttons.forEach((btn) => btn.classList.remove("aktiv"));

    button.classList.add("aktiv");
    status.textContent = button.textContent;
  });
});

const lichtButtons = document.querySelectorAll(".licht-farbe");

lichtButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const karte = button.closest(".personalisierung-karte");
    const buttons = karte.querySelectorAll(".licht-farbe");
    const status = karte.querySelector(".status-text strong");

    buttons.forEach((btn) => btn.classList.remove("aktiv"));

    button.classList.add("aktiv");
    status.textContent = button.dataset.farbe;
  });
});