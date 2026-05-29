const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
  logoutButton.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/logout.php", {
        method: "GET",
        credentials: "include"
      });

      const result = await response.json();

      if (result.status === "success") {
        window.location.href = "/login.html";
      } else {
        alert("Abmelden fehlgeschlagen. Bitte versuche es erneut.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Beim Abmelden ist ein Fehler passiert.");
    }
  });
}