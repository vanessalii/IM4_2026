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

    const soundElement = document.getElementById("homeSound");
    const lightElement = document.getElementById("homeLight");

    if (!soundElement || !lightElement) {
      console.error("Element #homeSound oder #homeLight wurde nicht gefunden.");
      return;
    }

    soundElement.textContent = uebersetzeSound(daten.soundtype);

    const lichtName = uebersetzeLicht(daten.light_name);
const lichtText = `${lichtName}es Licht`;

lightElement.textContent = lichtText;
setzeLichtBadge(lightElement, daten.light_name);

  } catch (error) {
    console.error("Fehler beim Laden der Home-Einstellungen:", error);
  }
}

function uebersetzeSound(soundtype) {
  const soundNamen = {
    voice_1: "voice 1",
    voice_2: "voice 2",
    story_1: "story 1",
    story_2: "story 2",
    story_3: "story 3",
    music_1: "music 1",
    music_2: "music 2",
    music_3: "music 3"
  };

  return soundNamen[soundtype] || soundtype || "Kein Sound";
}

function uebersetzeLicht(lightName) {
  const lichtNamen = {
    yellow: "Gelb",
    green: "Grün",
    violet: "Violett",
    pink: "Pink",
    blue: "Blau"
  };

  return lichtNamen[lightName] || lightName || "Unbekannt";
}

function setzeLichtBadge(element, lightName) {
  element.className = "licht-badge";

  const lichtKlassen = {
    yellow: "gelb",
    green: "gruen",
    violet: "violett",
    pink: "pink",
    blue: "blau"
  };

  const klasse = lichtKlassen[lightName];

  if (klasse) {
    element.classList.add(klasse);
  }
}

ladeHomeEinstellungen();