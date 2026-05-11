// profil.js
async function loadProfile() {
  try {
    const response = await fetch("/api/Profil.php", {
      credentials: "include",
    });

    const result = await response.json();
    console.log("Profile data:", result);

  } catch (error) {
    console.error("Failed to load profile:", error);
    alert("Failed to load profile data.");
  }
}




loadProfile ();




document
  .getElementById("ProfilForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const vorname = document.getElementById("Vorname").value.trim();
    const nachname = document.getElementById("Nachname").value.trim();

    try {
      const response = await fetch("api/profilUpdate.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vorname, nachname }),
      });
      const result = await response.text();
        console.log("Update response:", result);

      /*
      if (result.status === "success") {
        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
      } else {
        alert(result.message || "Registration failed.");
      } */
     
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });
