// profil.js

async function loadProfile() {
  try {
    const response = await fetch("/api/Profil.php", {
      credentials: "include",
    });

    const result = await response.json();
    console.log("Profile data:", result);

    const vorname = result.vorname || "";
    const nachname = result.nachname || "";

    document.querySelector("#vorname").value = vorname;
    document.querySelector("#nachname").value = nachname;

    // Wichtig: Namen auch beim Laden speichern
    const vollerName = `${vorname} ${nachname}`.trim();

    if (vollerName) {
      localStorage.setItem("profilName", vollerName);
      console.log("Gespeicherter Profilname:", vollerName);
    }

  } catch (error) {
    console.error("Failed to load profile:", error);
    alert("Failed to load profile data.");
  }
}

loadProfile();

document
  .getElementById("ProfilForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const vorname = document.getElementById("vorname").value.trim();
    const nachname = document.getElementById("nachname").value.trim();

    try {
      const response = await fetch("/api/profilUpdate.php", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vorname, nachname }),
      });

      const result = await response.text();
      console.log("Update response:", result);

      const vollerName = `${vorname} ${nachname}`.trim();

      if (vollerName) {
        localStorage.setItem("profilName", vollerName);
        console.log("Gespeicherter Profilname:", vollerName);
      }

      alert("Profil wurde gespeichert.");

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });