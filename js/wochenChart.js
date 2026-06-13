async function ladeWochenChart() {
  try {
    const response = await fetch("/api/wochenStatistik.php", {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Wochenstatistik:", result);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const labels = erstelleLetzte7TageLabels();
    const werte = erstelleLetzte7TageWerte(result.daten);

    const ctx = document.getElementById("wochenChart");

    if (!ctx) {
      console.error("Canvas #wochenChart wurde nicht gefunden.");
      return;
    }

    new Chart(ctx, {
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
            borderRadius: 14,
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
                size: 16,
                weight: "bold"
              }
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 60,
            ticks: {
              stepSize: 4,
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

  } catch (error) {
    console.error("Fehler beim Laden des Wochencharts:", error);
  }
}

function erstelleLetzte7TageLabels() {
  return ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
}

function erstelleLetzte7TageWerte(datenbankDaten) {
  const werte = [];

  // Demo-Woche: Montag, 8. Juni 2026 bis Sonntag, 14. Juni 2026
  const startDatum = new Date(2026, 5, 8); 
  // Wichtig: Monat 5 = Juni, weil JavaScript Monate bei 0 startet

  for (let i = 0; i < 7; i++) {
    const datum = new Date(startDatum);
    datum.setDate(startDatum.getDate() + i);

    const datumString = formatiereDatumLokal(datum);

    const eintrag = datenbankDaten.find((item) => {
      return item.tag === datumString;
    });

    werte.push(eintrag ? Number(eintrag.anzahl) : 0);
  }

  return werte;
}

function formatiereDatumLokal(datum) {
  const jahr = datum.getFullYear();
  const monat = String(datum.getMonth() + 1).padStart(2, "0");
  const tag = String(datum.getDate()).padStart(2, "0");

  return `${jahr}-${monat}-${tag}`;
}

ladeWochenChart();