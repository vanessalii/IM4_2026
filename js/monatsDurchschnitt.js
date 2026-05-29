let ausgewaehltesDatum = new Date();

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

async function ladeMonatsDurchschnitt() {
  const year = ausgewaehltesDatum.getFullYear();
  const month = ausgewaehltesDatum.getMonth() + 1;

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

    document.getElementById("aktuellerMonat").textContent =
      `${monatNamen[month - 1]} ${year}`;

    document.getElementById("monatsDurchschnitt").textContent =
      `${result.average}x`;

  } catch (error) {
    console.error("Fehler beim Laden des Monatsdurchschnitts:", error);
  }
}

document.getElementById("monatZurueck").addEventListener("click", () => {
  ausgewaehltesDatum.setMonth(ausgewaehltesDatum.getMonth() - 1);
  ladeMonatsDurchschnitt();
});

document.getElementById("monatWeiter").addEventListener("click", () => {
  ausgewaehltesDatum.setMonth(ausgewaehltesDatum.getMonth() + 1);
  ladeMonatsDurchschnitt();
});

ladeMonatsDurchschnitt();