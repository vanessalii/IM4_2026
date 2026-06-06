let aktuelleEinstellungen = {
  bedtime: 13,
  calmtime: 5,
  shuffle: 1,
  lightcolour_id: 5,
  soundtype_id: 7
};

let hatUngespeicherteAenderungen = false;

async function ladeEinstellungen() {
  try {
    const response = await fetch("/api/einstellungenGet.php", {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Geladene Einstellungen:", result);

    if (result.status !== "success") {
      console.error(result.message);
      aktualisiereAnzeige();
      return;
    }

    const daten = result.daten;

    aktuelleEinstellungen.bedtime = Number(daten.bedtime);
    aktuelleEinstellungen.calmtime = Number(daten.calmtime);
    aktuelleEinstellungen.shuffle = Number(daten.shuffle);
    aktuelleEinstellungen.lightcolour_id = Number(daten.lightcolour_id);

    if (daten.soundtype_id !== undefined && daten.soundtype_id !== null) {
      aktuelleEinstellungen.soundtype_id = Number(daten.soundtype_id);
    }

    hatUngespeicherteAenderungen = false;
    aktualisiereAnzeige();
    aktualisiereSpeicherStatus();

  } catch (error) {
    console.error("Fehler beim Laden der Einstellungen:", error);
    aktualisiereAnzeige();
  }
}

async function speichereEinstellungen() {
  const speichernStatus = document.getElementById("speichernStatus");
  const speichernButton = document.getElementById("einstellungenSpeichernButton");

  try {
    if (speichernStatus) {
      speichernStatus.textContent = "Einstellungen werden gespeichert...";
    }

    if (speichernButton) {
      speichernButton.disabled = true;
      speichernButton.textContent = "Speichern...";
    }

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
      if (speichernStatus) {
        speichernStatus.textContent = result.message || "Einstellungen konnten nicht gespeichert werden.";
      }
      return;
    }

    hatUngespeicherteAenderungen = false;
    aktualisiereSpeicherStatus();

  } catch (error) {
    console.error("Fehler beim Speichern:", error);

    if (speichernStatus) {
      speichernStatus.textContent = "Fehler beim Speichern der Einstellungen.";
    }
  } finally {
    if (speichernButton) {
      speichernButton.disabled = false;
      speichernButton.textContent = "Einstellungen speichern";
    }
  }
}

function markiereAlsUngespeichert() {
  hatUngespeicherteAenderungen = true;
  aktualisiereSpeicherStatus();
}

function aktualisiereSpeicherStatus() {
  const speichernStatus = document.getElementById("speichernStatus");

  if (!speichernStatus) {
    return;
  }

  if (hatUngespeicherteAenderungen) {
    speichernStatus.textContent = "Du hast ungespeicherte Änderungen.";
  } else {
    speichernStatus.textContent = "Alle Einstellungen sind gespeichert.";
  }
}

function aktualisiereAnzeige() {
  const bedtimeStatus = document.getElementById("bedtimeStatus");
  const bedtimeInput = document.getElementById("bedtimeInput");

  if (bedtimeStatus) {
    bedtimeStatus.textContent = `${aktuelleEinstellungen.bedtime}:00 Uhr`;
  }

  if (bedtimeInput) {
    bedtimeInput.value = aktuelleEinstellungen.bedtime;
  }

  const calmtimeStatus = document.getElementById("calmtimeStatus");

  if (calmtimeStatus) {
    calmtimeStatus.textContent = `${aktuelleEinstellungen.calmtime} Minuten`;
  }

  const shuffleStatus = document.getElementById("shuffleStatus");

  if (shuffleStatus) {
    shuffleStatus.textContent =
      aktuelleEinstellungen.shuffle === 1 ? "Ein" : "Aus";
  }

  const farbNamen = {
    1: "Gelb",
    2: "Grün",
    3: "Violett",
    4: "Pink",
    5: "Blau"
  };

  const lichtStatus = document.getElementById("lichtStatus");

  if (lichtStatus) {
    lichtStatus.textContent =
      farbNamen[aktuelleEinstellungen.lightcolour_id] || "-";
  }

  const soundNamen = {
    1: "voice_1",
    2: "voice_2",
    3: "voice_2",
    4: "story_1",
    5: "story_2",
    6: "story_3",
    7: "music_1",
    8: "music_2",
    9: "music_3"
  };

  const soundtypeStatus = document.getElementById("soundtypeStatus");

  if (soundtypeStatus) {
    soundtypeStatus.textContent =
      soundNamen[aktuelleEinstellungen.soundtype_id] || "-";
  }

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

  document.querySelectorAll(".soundtype-button").forEach((button) => {
    button.classList.toggle(
      "aktiv",
      Number(button.dataset.soundtype) === aktuelleEinstellungen.soundtype_id
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
    markiereAlsUngespeichert();
  });
}

document.querySelectorAll(".calmtime-button").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.calmtime = Number(button.dataset.calmtime);
    aktualisiereAnzeige();
    markiereAlsUngespeichert();
  });
});

document.querySelectorAll(".shuffle-button").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.shuffle = Number(button.dataset.shuffle);
    aktualisiereAnzeige();
    markiereAlsUngespeichert();
  });
});

document.querySelectorAll(".licht-farbe").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.lightcolour_id = Number(button.dataset.lightcolour);
    aktualisiereAnzeige();
    markiereAlsUngespeichert();
  });
});

document.querySelectorAll(".soundtype-button").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.soundtype_id = Number(button.dataset.soundtype);
    aktualisiereAnzeige();
    markiereAlsUngespeichert();
  });
});

const speichernButton = document.getElementById("einstellungenSpeichernButton");

if (speichernButton) {
  speichernButton.addEventListener("click", () => {
    speichereEinstellungen();
  });
}

ladeEinstellungen();