let aktuelleEinstellungen = {
  bedtime: 13,
  calmtime: 5,
  shuffle: 1,
  lightcolour_id: 3
};

async function ladeEinstellungen() {
  try {
    const response = await fetch("/api/einstellungenGet.php", {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Geladene Einstellungen:", result);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const daten = result.daten;

    aktuelleEinstellungen.bedtime = Number(daten.bedtime);
    aktuelleEinstellungen.calmtime = Number(daten.calmtime);
    aktuelleEinstellungen.shuffle = Number(daten.shuffle);
    aktuelleEinstellungen.lightcolour_id = Number(daten.lightcolour_id);

    aktualisiereAnzeige();

  } catch (error) {
    console.error("Fehler beim Laden der Einstellungen:", error);
  }
}

async function speichereEinstellungen() {
  try {
    const response = await fetch("/api/einstellungenUpdate.php", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(aktuelleEinstellungen)
    });

    const result = await response.json();
    console.log("Gespeichert:", result);

    if (result.status !== "success") {
  console.error("Fehler vom Server:", result);
  alert(result.message || "Einstellungen konnten nicht gespeichert werden.");
}

  } catch (error) {
    console.error("Fehler beim Speichern:", error);
    alert("Fehler beim Speichern der Einstellungen.");
  }
}

function aktualisiereAnzeige() {
  document.getElementById("bedtimeStatus").textContent =
  `${aktuelleEinstellungen.bedtime}:00 Uhr`;

if (bedtimeInput) {
  bedtimeInput.value = aktuelleEinstellungen.bedtime;
}
  document.getElementById("calmtimeStatus").textContent = `${aktuelleEinstellungen.calmtime} Minute${aktuelleEinstellungen.calmtime === 1 ? "" : "n"}`;
  document.getElementById("shuffleStatus").textContent = aktuelleEinstellungen.shuffle === 1 ? "Ein" : "Aus";

const farbNamen = {
  1: "Gelb",
  2: "Grün",
  3: "Violett",
  4: "Pink",
  5: "Blau"
};

  document.getElementById("lichtStatus").textContent = farbNamen[aktuelleEinstellungen.lightcolour_id];



  document.querySelectorAll(".calmtime-button").forEach((button) => {
    button.classList.toggle(
      "aktiv",
      Number(button.dataset.calmtime) === aktuelleEinstellungen.calmtime
    );
  });

  document.querySelectorAll(".shuffle-button").forEach((button) => {
    button.classList.toggle(
      "aktiv",
      Number(button.dataset.shuffle) === aktuelleEinstellungen.shuffle
    );
  });

  document.querySelectorAll(".licht-farbe").forEach((button) => {
    button.classList.toggle(
      "aktiv",
      Number(button.dataset.lightcolour) === aktuelleEinstellungen.lightcolour_id
    );
  });
}

const bedtimeInput = document.getElementById("bedtimeInput");
const bedtimeSaveButton = document.getElementById("bedtimeSaveButton");

if (bedtimeSaveButton && bedtimeInput) {
  bedtimeSaveButton.addEventListener("click", () => {
    const wert = Number(bedtimeInput.value);

    if (!Number.isInteger(wert) || wert < 0 || wert > 23) {
      alert("Bitte gib eine Stunde zwischen 0 und 23 ein.");
      return;
    }

    aktuelleEinstellungen.bedtime = wert;

    aktualisiereAnzeige();
    speichereEinstellungen();
  });
}

document.querySelectorAll(".calmtime-button").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.calmtime = Number(button.dataset.calmtime);
    aktualisiereAnzeige();
    speichereEinstellungen();
  });
});

document.querySelectorAll(".shuffle-button").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.shuffle = Number(button.dataset.shuffle);
    aktualisiereAnzeige();
    speichereEinstellungen();
  });
});

document.querySelectorAll(".licht-farbe").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.lightcolour_id = Number(button.dataset.lightcolour);
    aktualisiereAnzeige();
    speichereEinstellungen();
  });
});

ladeEinstellungen();