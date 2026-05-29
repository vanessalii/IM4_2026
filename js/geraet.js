const geraetForm = document.getElementById("geraetForm");
const serialnrInput = document.getElementById("serialnr");
const aktuelleSerialnr = document.getElementById("aktuelleSerialnr");

async function ladeGeraet() {
  try {
    const response = await fetch("/api/deviceGet.php", {
      credentials: "include"
    });

    const result = await response.json();
    console.log("Gerät:", result);

    if (result.status !== "success") {
      aktuelleSerialnr.textContent = "-";
      return;
    }

    if (result.serialnr) {
      aktuelleSerialnr.textContent = result.serialnr;
      serialnrInput.value = result.serialnr;
    } else {
      aktuelleSerialnr.textContent = "Noch kein Gerät verbunden";
    }

  } catch (error) {
    console.error("Fehler beim Laden des Geräts:", error);
    aktuelleSerialnr.textContent = "-";
  }
}

if (geraetForm) {
  geraetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const serialnr = serialnrInput.value.trim();

    if (serialnr === "") {
      alert("Bitte gib eine Seriennummer ein.");
      return;
    }

    try {
      const response = await fetch("/api/deviceUpdate.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serialnr: serialnr
        })
      });

      const result = await response.json();
      console.log("Gerät speichern:", result);

      if (result.status !== "success") {
        alert(result.message || "Gerät konnte nicht verbunden werden.");
        return;
      }

      aktuelleSerialnr.textContent = result.serialnr;
      alert("Gerät wurde verbunden.");

    } catch (error) {
      console.error("Fehler beim Speichern des Geräts:", error);
      alert("Beim Speichern ist ein Fehler passiert.");
    }
  });
}

ladeGeraet();