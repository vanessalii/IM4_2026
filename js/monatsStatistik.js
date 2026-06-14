let ausgewaehltesDatum = new Date();
let schafVerbunden = false;

const monatNamen = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

async function ladeMonatsStatistik() {
  const year = ausgewaehltesDatum.getFullYear();
  const month = ausgewaehltesDatum.getMonth() + 1;

  const aktuellerMonat = document.getElementById("aktuellerMonat");

  if (aktuellerMonat) {
    aktuellerMonat.textContent = `${monatNamen[month - 1]} ${year}`;
  }

  await ladeMonatsDurchschnitt(year, month);
  await ladeMonatsKalender(year, month);
}

async function ladeMonatsDurchschnitt(year, month) {
  try {
    const response = await fetch(`/api/monatsDurchschnitt.php?year=${year}&month=${month}`, {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Monatsdurchschnitt:", result);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const monatsDurchschnitt = document.getElementById("monatsDurchschnitt");

    if (monatsDurchschnitt) {
      monatsDurchschnitt.textContent = `${result.average}x`;
    }

  } catch (error) {
    console.error("Fehler beim Laden des Monatsdurchschnitts:", error);
  }
}

async function ladeMonatsKalender(year, month) {
  try {
    const response = await fetch(`/api/monatsDiagramm.php?year=${year}&month=${month}`, {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Monatskalender:", result);

    const schafHinweis = document.getElementById("schafHinweis");

    if (result.status !== "success") {
      console.warn(result.message);

      schafVerbunden = false;

      if (schafHinweis) {
        schafHinweis.classList.add("aktiv");
      }

      zeichneMonatsKalender(year, month, []);
      return;
    }

    const daten = result.daten || [];

    // Schaf gilt als verbunden, wenn die API es sagt ODER wenn Daten vorhanden sind
    schafVerbunden = result.schafVerbunden === true || daten.length > 0;

    if (schafHinweis) {
      if (schafVerbunden) {
        schafHinweis.classList.remove("aktiv");
      } else {
        schafHinweis.classList.add("aktiv");
      }
    }

    zeichneMonatsKalender(year, month, daten);

  } catch (error) {
    console.error("Fehler beim Laden des Monatskalenders:", error);

    schafVerbunden = false;

    const schafHinweis = document.getElementById("schafHinweis");

    if (schafHinweis) {
      schafHinweis.classList.add("aktiv");
    }

    zeichneMonatsKalender(year, month, []);
  }
}

function zeichneMonatsKalender(year, month, datenbankDaten) {
  const kalender = document.getElementById("monatsKalender");

  if (!kalender) {
    console.error("Element #monatsKalender wurde nicht gefunden.");
    return;
  }

  kalender.innerHTML = "";

  const tageNamen = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  tageNamen.forEach((tag) => {
    const div = document.createElement("div");
    div.classList.add("kalender-tag-name");
    div.textContent = tag;
    kalender.appendChild(div);
  });

  const ersterTag = new Date(year, month - 1, 1);
  const letzterTag = new Date(year, month, 0).getDate();

  let startIndex = ersterTag.getDay();
  startIndex = startIndex === 0 ? 6 : startIndex - 1;

  for (let i = 0; i < startIndex; i++) {
    const leer = document.createElement("div");
    leer.classList.add("kalender-leer");
    kalender.appendChild(leer);
  }

  for (let tag = 1; tag <= letzterTag; tag++) {
    const eintrag = datenbankDaten.find((item) => {
      return Number(item.tag_nummer) === tag;
    });

    const anzahl = eintrag ? Number(eintrag.anzahl) : 0;
    const hatDaten = Boolean(eintrag);

    const button = document.createElement("button");
    button.type = "button";

    button.classList.add(
      "schlaf-tag",
      ermittleSchlafKlasse(anzahl, year, month, tag, hatDaten)
    );

    const datumString = `${year}-${String(month).padStart(2, "0")}-${String(tag).padStart(2, "0")}`;
    button.dataset.date = datumString;

    button.innerHTML = `
      <strong>${tag}</strong>
      <span>${hatDaten ? `${anzahl}x` : ""}</span>
    `;

    button.addEventListener("click", () => {
      if (!schafVerbunden && !hatDaten) {
        alert("Es ist noch kein Schaf mit diesem Account verbunden.");
        return;
      }

      ladeTagesDetails(datumString);
    });

    kalender.appendChild(button);
  }
}

function ermittleSchlafKlasse(anzahl, year, month, tag, hatDaten) {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const datum = new Date(year, month - 1, tag);
  datum.setHours(0, 0, 0, 0);

  const istVergangenheit = datum < heute;

  // Wenn kein Schaf verbunden ist und keine Daten vorhanden sind: neutral
  if (!schafVerbunden && !hatDaten) {
    return "schlaf-keine-daten";
  }

  // Wenn ein Schaf verbunden ist, aber für vergangene Tage keine Daten vorhanden sind: grün
  if (schafVerbunden && !hatDaten && istVergangenheit) {
    return "schlaf-keine-daten-vergangen";
  }

  // Zukünftige Tage ohne Daten bleiben neutral
  if (!hatDaten) {
    return "schlaf-keine-daten";
  }

  if (anzahl <= 1) {
    return "schlaf-hervorragend";
  }

  if (anzahl <= 3) {
    return "schlaf-gut";
  }

  if (anzahl <= 5) {
    return "schlaf-okay";
  }

  return "schlaf-schlecht";
}

async function ladeTagesDetails(date) {
  try {
    const response = await fetch(`/api/tagesDetails.php?date=${date}`, {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Tagesdetails:", result);

    if (result.status !== "success") {
      alert(result.message || "Tagesdetails konnten nicht geladen werden.");
      return;
    }

    zeigeTagesOverlay(result);

  } catch (error) {
    console.error("Fehler beim Laden der Tagesdetails:", error);
    alert("Fehler beim Laden der Tagesdetails.");
  }
}

function zeigeTagesOverlay(data) {
  const overlay = document.getElementById("tagOverlay");

  if (!overlay) {
    console.error("Overlay #tagOverlay wurde nicht gefunden.");
    return;
  }

  const overlayTitel = document.getElementById("overlayTitel");
  const overlayBewertung = document.getElementById("overlayBewertung");
  const overlayGesamt = document.getElementById("overlayGesamt");
  const ereignisseContainer = document.getElementById("overlayEreignisse");

  if (overlayTitel) {
    overlayTitel.textContent = `Details zum ${formatiereDatumDeutsch(data.date)}`;
  }

  if (overlayBewertung) {
    overlayBewertung.textContent = data.bewertung;
  }

  if (overlayGesamt) {
    overlayGesamt.textContent = `${data.gesamt}x aufgewacht`;
  }

  if (ereignisseContainer) {
    ereignisseContainer.innerHTML = "";

    if (!data.ereignisse || data.ereignisse.length === 0) {
      const div = document.createElement("div");
      div.classList.add("overlay-event");
      div.textContent = "Keine Aufwachereignisse an diesem Tag.";
      ereignisseContainer.appendChild(div);
    } else {
      data.ereignisse.forEach((ereignis) => {
        const div = document.createElement("div");
        div.classList.add("overlay-event");

        div.textContent =
          `${formatiereUhrzeit(ereignis.timestamp)} Uhr — Aufwachereignis erkannt`;

        ereignisseContainer.appendChild(div);
      });
    }
  }

  zeigeEinstellungenHistory(data);

  overlay.classList.add("aktiv");
  document.body.classList.add("overlay-offen");
}

function zeigeEinstellungenHistory(data) {
  const latestBox = document.getElementById("historyLatestSettings");
  const changesBox = document.getElementById("historyChanges");

  if (!latestBox || !changesBox) {
    console.error("History-Elemente wurden nicht gefunden.");
    return;
  }

  const latest = data.latestSettings;

  if (!latest) {
    latestBox.innerHTML = `
      <div class="history-empty">
        Keine gespeicherten Einstellungen für diesen Tag gefunden.
      </div>
    `;
  } else {
    latestBox.innerHTML = `
      <div class="history-settings-grid">
        <div class="history-setting-row">
          <span>Licht</span>
          <strong>${uebersetzeLicht(latest.light_name)}</strong>
        </div>

        <div class="history-setting-row">
          <span>Sound</span>
          <strong>${latest.soundtype || "-"}</strong>
        </div>

        <div class="history-setting-row">
          <span>Beruhigungsdauer</span>
          <strong>${latest.calmtime ? `${latest.calmtime} Minuten` : "-"}</strong>
        </div>
      </div>
    `;
  }

  const changes = data.settingsChanges || [];

  if (changes.length === 0) {
    changesBox.innerHTML = `
      <div class="history-empty">
        An diesem Tag wurden keine Einstellungen geändert.
      </div>
    `;
    return;
  }

  changesBox.innerHTML = "";

  changes.forEach((change, index) => {
    const vorherigeEinstellung = index > 0 ? changes[index - 1] : null;
    const unterschiede = ermittleGeaenderteWerte(vorherigeEinstellung, change);

    if (unterschiede.length === 0) {
      return;
    }

    const item = document.createElement("div");
    item.classList.add("history-change-item");

    item.innerHTML = `
      <div class="history-change-time">
        ${formatiereUhrzeit(change.created_at)} Uhr
      </div>

      <div class="history-change-content">
        ${unterschiede.join("")}
      </div>
    `;

    changesBox.appendChild(item);
  });

  if (changesBox.innerHTML.trim() === "") {
    changesBox.innerHTML = `
      <div class="history-empty">
        Keine sichtbaren Änderungen gefunden.
      </div>
    `;
  }
}

function ermittleGeaenderteWerte(vorher, aktuell) {
  const unterschiede = [];

  if (!vorher) {
    unterschiede.push(`
      <div class="history-change-value">
        <span>Licht</span>
        <strong>${uebersetzeLicht(aktuell.light_name)}</strong>
      </div>
    `);

    unterschiede.push(`
      <div class="history-change-value">
        <span>Beruhigungsdauer</span>
        <strong>${aktuell.calmtime} Minuten</strong>
      </div>
    `);

    unterschiede.push(`
      <div class="history-change-value">
        <span>Sound</span>
        <strong>${aktuell.soundtype || "-"}</strong>
      </div>
    `);

    return unterschiede;
  }

  if (Number(vorher.lightcolour_id) !== Number(aktuell.lightcolour_id)) {
    unterschiede.push(`
      <div class="history-change-value">
        <span>Licht</span>
        <strong>${uebersetzeLicht(aktuell.light_name)}</strong>
      </div>
    `);
  }

  if (Number(vorher.calmtime) !== Number(aktuell.calmtime)) {
    unterschiede.push(`
      <div class="history-change-value">
        <span>Beruhigungsdauer</span>
        <strong>${aktuell.calmtime} Minuten</strong>
      </div>
    `);
  }

  if (Number(vorher.soundtype_id) !== Number(aktuell.soundtype_id)) {
    unterschiede.push(`
      <div class="history-change-value">
        <span>Sound</span>
        <strong>${aktuell.soundtype || "-"}</strong>
      </div>
    `);
  }

  return unterschiede;
}

function formatiereUhrzeit(timestamp) {
  const datum = new Date(timestamp);

  return datum.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatiereDatumDeutsch(dateString) {
  const datum = new Date(`${dateString}T00:00:00`);

  return datum.toLocaleDateString("de-CH", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function uebersetzeLicht(lightName) {
  const farben = {
    yellow: "Gelb",
    green: "Grün",
    violet: "Violett",
    pink: "Pink",
    blue: "Blau"
  };

  return farben[lightName] || lightName || "-";
}

const monatZurueckButton = document.getElementById("monatZurueck");
const monatWeiterButton = document.getElementById("monatWeiter");

if (monatZurueckButton) {
  monatZurueckButton.addEventListener("click", () => {
    ausgewaehltesDatum.setMonth(ausgewaehltesDatum.getMonth() - 1);
    ladeMonatsStatistik();
  });
}

if (monatWeiterButton) {
  monatWeiterButton.addEventListener("click", () => {
    ausgewaehltesDatum.setMonth(ausgewaehltesDatum.getMonth() + 1);
    ladeMonatsStatistik();
  });
}

const tagOverlayClose = document.getElementById("tagOverlayClose");
const tagOverlay = document.getElementById("tagOverlay");

if (tagOverlayClose && tagOverlay) {
  tagOverlayClose.addEventListener("click", () => {
    tagOverlay.classList.remove("aktiv");
    document.body.classList.remove("overlay-offen");
  });
}

if (tagOverlay) {
  tagOverlay.addEventListener("click", (event) => {
    if (event.target.id === "tagOverlay") {
      tagOverlay.classList.remove("aktiv");
      document.body.classList.remove("overlay-offen");
    }
  });
}

ladeMonatsStatistik();