async function ladeLetzteNacht() {
  try {
    const response = await fetch("/api/letzteNacht.php", {
      credentials: "include"
    });

    const result = await response.json();

    console.log("Letzte Nacht:", result);
    console.log("Einstellungen um 23:59 Uhr:", result.latestSettings);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const aufwachListe = document.getElementById("aufwachListe");
    const gesamtAufgewacht = document.getElementById("gesamtAufgewacht");

    if (aufwachListe) {
      aufwachListe.innerHTML = "";

      const daten = result.daten || [];

      if (daten.length === 0) {
        const div = document.createElement("div");
        div.classList.add("aufwach-eintrag");

        div.innerHTML = `
          <strong>-</strong>
          <span>Keine Aufwachereignisse</span>
        `;

        aufwachListe.appendChild(div);
      } else {
        daten.forEach((eintrag) => {
          const datum = new Date(eintrag.timestamp);

          const zeit = datum.toLocaleTimeString("de-CH", {
            hour: "2-digit",
            minute: "2-digit"
          });

          const div = document.createElement("div");
          div.classList.add("aufwach-eintrag");

          div.innerHTML = `
            <strong>${zeit} Uhr</strong>
            <span>Aufgewacht</span>
          `;

          aufwachListe.appendChild(div);
        });
      }
    }

    if (gesamtAufgewacht) {
      gesamtAufgewacht.textContent = `Gesamt: ${result.anzahl}x aufgewacht`;
    }

    zeigeEinstellungenLetzteNacht(result.latestSettings);

  } catch (error) {
    console.error("Fehler beim Laden der letzten Nacht:", error);
  }
}

function zeigeEinstellungenLetzteNacht(settings) {
  const soundElement =
    document.getElementById("homeSound") ||
    document.querySelector(".einstellung-box h3");

  const lichtElement =
    document.getElementById("homeLicht") ||
    document.querySelector(".einstellung-box span");

  if (!settings) {
    if (soundElement) {
      soundElement.textContent = "-";
    }

    if (lichtElement) {
      lichtElement.textContent = "Kein Licht";
    }

    return;
  }

  const soundText =
    settings.soundtype ||
    settings.typename ||
    settings.sound_name ||
    "-";

  const lichtName =
    settings.light_name ||
    settings.lightcolour ||
    settings.name ||
    "";

  const lichtNameNormalisiert = normalisiereLichtName(lichtName);
  const lichtText = erstelleLichtText(lichtNameNormalisiert);

  if (soundElement) {
    soundElement.textContent = soundText;
  }

  if (lichtElement) {
    lichtElement.textContent = lichtText;
    styleLichtElement(lichtElement, lichtNameNormalisiert);
  }
}

function normalisiereLichtName(lightName) {
  return String(lightName).trim().toLowerCase();
}

function erstelleLichtText(lightName) {
  if (lightName === "yellow" || lightName === "gelb") {
    return "Gelbes Licht";
  }

  if (lightName === "green" || lightName === "grün" || lightName === "gruen") {
    return "Grünes Licht";
  }

  if (lightName === "violet" || lightName === "violett") {
    return "Violettes Licht";
  }

  if (lightName === "pink") {
    return "Pinkes Licht";
  }

  if (lightName === "blue" || lightName === "blau") {
    return "Blaues Licht";
  }

  return "Kein Licht";
}

function styleLichtElement(element, lightName) {
  const farbe = normalisiereLichtName(lightName);

  const styles = {
    yellow: {
      color: "#fff7a8",
      background: "rgba(255, 235, 120, 0.28)"
    },
    gelb: {
      color: "#fff7a8",
      background: "rgba(255, 235, 120, 0.28)"
    },
    green: {
      color: "#b8ffd4",
      background: "rgba(90, 255, 160, 0.22)"
    },
    grün: {
      color: "#b8ffd4",
      background: "rgba(90, 255, 160, 0.22)"
    },
    gruen: {
      color: "#b8ffd4",
      background: "rgba(90, 255, 160, 0.22)"
    },
    violet: {
      color: "#d8b4ff",
      background: "rgba(127, 0, 255, 0.35)"
    },
    violett: {
      color: "#d8b4ff",
      background: "rgba(127, 0, 255, 0.35)"
    },
    pink: {
      color: "#ffc1ef",
      background: "rgba(255, 90, 210, 0.28)"
    },
    blue: {
      color: "#b8d8ff",
      background: "rgba(80, 150, 255, 0.28)"
    },
    blau: {
      color: "#b8d8ff",
      background: "rgba(80, 150, 255, 0.28)"
    }
  };

  const style = styles[farbe];

  if (!style) {
    element.style.color = "";
    element.style.background = "";
    return;
  }

  element.style.color = style.color;
  element.style.background = style.background;
  element.style.borderRadius = "16px";
  element.style.padding = "14px 20px";
  element.style.display = "block";
  element.style.textAlign = "center";
}

ladeLetzteNacht();