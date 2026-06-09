let aktuelleEinstellungen = {
  calmtime: 5,
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

    aktuelleEinstellungen.calmtime = Number(daten.calmtime);
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

  const calmtimeStatus = document.getElementById("calmtimeStatus");

  if (calmtimeStatus) {
    calmtimeStatus.textContent = `${aktuelleEinstellungen.calmtime} Minuten`;
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

document.querySelectorAll(".calmtime-button").forEach((button) => {
  button.addEventListener("click", () => {
    aktuelleEinstellungen.calmtime = Number(button.dataset.calmtime);
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