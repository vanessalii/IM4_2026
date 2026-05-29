async function ladeLetzteNacht() {
  try {
    const response = await fetch("/api/letzteNacht.php", {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Letzte Nacht:", result);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const aufwachListe = document.getElementById("aufwachListe");
    const gesamtAufgewacht = document.getElementById("gesamtAufgewacht");

    aufwachListe.innerHTML = "";

    result.daten.forEach((eintrag) => {
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

    gesamtAufgewacht.textContent = `Gesamt: ${result.anzahl}x aufgewacht`;

  } catch (error) {
    console.error("Fehler beim Laden der letzten Nacht:", error);
  }
}

ladeLetzteNacht();