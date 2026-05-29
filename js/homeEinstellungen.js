async function ladeHomeEinstellungen() {
  try {
    const response = await fetch("/api/homeEinstellungen.php", {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Home Einstellungen:", result);

    if (result.status !== "success") {
      console.error(result.message);
      return;
    }

    const daten = result.daten;
    const lightElement = document.getElementById("homeLight");

    if (!lightElement) {
      console.error("Element #homeLight wurde nicht gefunden.");
      return;
    }

    const farbNamen = {
      yellow: "Gelbes Licht",
      green: "Grünes Licht",
      violet: "Violettes Licht",
      pink: "Pinkes Licht",
      blue: "Blaues Licht"
    };

    const lightName = daten.lightcolour_name;
    lightElement.textContent = farbNamen[lightName] || `${lightName} Licht`;

  } catch (error) {
    console.error("Fehler beim Laden der Home-Einstellungen:", error);
  }
}

ladeHomeEinstellungen();