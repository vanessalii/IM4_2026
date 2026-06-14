async function ladeHomeEinstellungen() {
  const schafHinweis = document.getElementById("homeSchafHinweis");

  try {
    const response = await fetch("/api/homeEinstellungen.php", {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Home Einstellungen 23:59:", result);

    if (result.status !== "success") {
      console.warn(result.message);

      if (schafHinweis) {
        schafHinweis.classList.add("aktiv");
      }

      return;
    }

    if (!result.daten) {
      if (schafHinweis) {
        schafHinweis.classList.add("aktiv");
      }

      setzeLeereEinstellungen();
      return;
    }

    if (schafHinweis) {
      schafHinweis.classList.remove("aktiv");
    }

    const daten = result.daten;

    const soundElement = document.getElementById("homeSound");
    const lightElement = document.getElementById("homeLight");

    if (!soundElement || !lightElement) {
      console.error("Element #homeSound oder #homeLight wurde nicht gefunden.");
      return;
    }

    soundElement.textContent = uebersetzeSound(daten.soundtype);

    const lichtKey = normalisiereLichtName(daten.light_name);
    lightElement.textContent = erstelleLichtText(lichtKey);

    setzeLichtBadge(lightElement, lichtKey);

  } catch (error) {
    console.error("Fehler beim Laden der Home-Einstellungen:", error);

    if (schafHinweis) {
      schafHinweis.classList.add("aktiv");
    }
  }
}

function setzeLeereEinstellungen() {
  const soundElement = document.getElementById("homeSound");
  const lightElement = document.getElementById("homeLight");

  if (soundElement) {
    soundElement.textContent = "Kein Sound";
  }

  if (lightElement) {
    lightElement.textContent = "Kein Licht";
    lightElement.className = "licht-badge";
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

function normalisiereLichtName(lightName) {
  return String(lightName || "").trim().toLowerCase();
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

function setzeLichtBadge(element, lightName) {
  element.className = "licht-badge";

  const lichtKlassen = {
    yellow: "gelb",
    gelb: "gelb",

    green: "gruen",
    grün: "gruen",
    gruen: "gruen",

    violet: "violett",
    violett: "violett",

    pink: "pink",

    blue: "blau",
    blau: "blau"
  };

  const klasse = lichtKlassen[lightName];

  if (klasse) {
    element.classList.add(klasse);
  }
}

ladeHomeEinstellungen();