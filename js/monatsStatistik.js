let ausgewaehltesDatum = new Date();
let monatsChart = null;

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

  document.getElementById("aktuellerMonat").textContent =
    `${monatNamen[month - 1]} ${year}`;

  await ladeMonatsDurchschnitt(year, month);
  await ladeMonatsDiagramm(year, month);
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

    document.getElementById("monatsDurchschnitt").textContent =
      `${result.average}x`;

  } catch (error) {
    console.error("Fehler beim Laden des Monatsdurchschnitts:", error);
  }
}

async function ladeMonatsDiagramm(year, month) {
  try {
    const response = await fetch(`/api/monatsDiagramm.php?year=${year}&month=${month}`, {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Monatsdiagramm:", result);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    zeichneMonatsKalender(year, month, result.daten);

  } catch (error) {
    console.error("Fehler beim Laden des Monatsdiagramms:", error);
  }
}

function erstelleTageImMonat(year, month) {
  const letzterTag = new Date(year, month, 0).getDate();
  const tage = [];

  for (let tag = 1; tag <= letzterTag; tag++) {
    tage.push(tag);
  }

  return tage;
}

function erstelleMonatsWerte(labels, datenbankDaten) {
  return labels.map((tag) => {
    const eintrag = datenbankDaten.find((item) => {
      return Number(item.tag_nummer) === tag;
    });

    return eintrag ? Number(eintrag.anzahl) : 0;
  });
}

function zeichneMonatsChart(labels, werte) {
  const canvas = document.getElementById("monatsChart");

  if (!canvas) {
    console.error("Canvas #monatsChart wurde nicht gefunden.");
    return;
  }

  if (monatsChart) {
    monatsChart.destroy();
  }

  monatsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Aufgewacht",
          data: werte,
          backgroundColor: "rgba(130, 90, 255, 0.85)",
          borderColor: "rgba(160, 100, 255, 1)",
          borderWidth: 1,
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return `Tag ${context[0].label}`;
            },
            label: function (context) {
              return `${context.raw}x aufgewacht`;
            }
          }
        }
      },

      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: "#c7c1df",
            font: {
              size: 14,
              weight: "bold"
            },
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: 8,
          ticks: {
            stepSize: 1,
            color: "#c7c1df",
            font: {
              size: 14,
              weight: "bold"
            }
          },
          grid: {
            color: "rgba(255, 255, 255, 0.12)"
          }
        }
      }
    }
  });
}

document.getElementById("monatZurueck").addEventListener("click", () => {
  ausgewaehltesDatum.setMonth(ausgewaehltesDatum.getMonth() - 1);
  ladeMonatsStatistik();
});

document.getElementById("monatWeiter").addEventListener("click", () => {
  ausgewaehltesDatum.setMonth(ausgewaehltesDatum.getMonth() + 1);
  ladeMonatsStatistik();
});

ladeMonatsStatistik();

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

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("schlaf-tag", ermittleSchlafKlasse(anzahl));

    const datumString = `${year}-${String(month).padStart(2, "0")}-${String(tag).padStart(2, "0")}`;

button.dataset.date = datumString;

button.innerHTML = `
  <strong>${tag}</strong>
  <span>${anzahl}x</span>
`;

button.addEventListener("click", () => {
  ladeTagesDetails(datumString);
});

kalender.appendChild(button);
  }
}

function ermittleSchlafKlasse(anzahl) {
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

  document.getElementById("overlayTitel").textContent =
    `Details zum ${formatiereDatumDeutsch(data.date)}`;

  document.getElementById("overlayBewertung").textContent =
    data.bewertung;

  document.getElementById("overlayGesamt").textContent =
    `${data.gesamt}x aufgewacht`;

  const ereignisseContainer = document.getElementById("overlayEreignisse");
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

  const settings = data.settings || {};

  document.getElementById("overlayLicht").textContent =
    uebersetzeLicht(settings.light_name);

  document.getElementById("overlayCalmtime").textContent =
    settings.calmtime
      ? `${settings.calmtime} Minute${Number(settings.calmtime) === 1 ? "" : "n"}`
      : "-";

  document.getElementById("overlayShuffle").textContent =
    Number(settings.shuffle) === 1 ? "Ein" : "Aus";

  document.getElementById("overlayBedtime").textContent =
    settings.bedtime ? settings.bedtime : "-";

  overlay.classList.add("aktiv");
}

function beschreibeEreignis(move, noise) {
  const bewegung = Number(move);
  const geraeusch = Number(noise);

  if (bewegung === 1 && geraeusch === 1) {
    return "Bewegung + Geräusch erkannt";
  }

  if (bewegung === 1) {
    return "Bewegung erkannt";
  }

  if (geraeusch === 1) {
    return "Geräusch erkannt";
  }

  return "Aufwachereignis erkannt";
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

document.getElementById("tagOverlayClose").addEventListener("click", () => {
  document.getElementById("tagOverlay").classList.remove("aktiv");
});

document.getElementById("tagOverlay").addEventListener("click", (event) => {
  if (event.target.id === "tagOverlay") {
    document.getElementById("tagOverlay").classList.remove("aktiv");
  }
});