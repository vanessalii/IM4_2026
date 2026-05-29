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

  } catch (error) {
    console.error("Fehler beim Laden des Wochencharts:", error);
  }
}

function erstelleLetzte7TageLabels() {
  const tage = [];

  const kurzTage = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  for (let i = 6; i >= 0; i--) {
    const datum = new Date();
    datum.setDate(datum.getDate() - i);

    tage.push(kurzTage[datum.getDay()]);
  }

  return tage;
}

function erstelleLetzte7TageWerte(datenbankDaten) {
  const werte = [];

  for (let i = 6; i >= 0; i--) {
    const datum = new Date();
    datum.setDate(datum.getDate() - i);

    const datumString = datum.toISOString().split("T")[0];

    const eintrag = datenbankDaten.find((item) => {
      return item.tag === datumString;
    });

    if (eintrag) {
      werte.push(Number(eintrag.anzahl));
    } else {
      werte.push(0);
    }
  }

  return werte;
}

ladeWochenChart();