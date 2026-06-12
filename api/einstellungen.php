<?php
/*****************************************************
 * API-Endpunkt zum Abrufen der individuellen
 * Einstellungen eines Plüschtiers. Die Daten
 * werden anhand der serialnr aus der Datenbank
 * geladen und als JSON zurückgegeben.
 *****************************************************/

// ==========================================
// 1. Datenbank-Verbindung laden
// ==========================================

require_once("../system/config.php");


// ==========================================
// 2. Antwort als JSON definieren
// ==========================================

header('Content-Type: application/json');


// ==========================================
// 3. Fehler abfangen
// ==========================================

try {

    // ==========================================
    // 4. serialnr aus URL-Parameter auslesen
    // ==========================================

    if (!isset($_GET['serialnr'])) {
        throw new Exception('serialnr parameter is missing');
    }

    $serialnr = $_GET['serialnr'];

    
    // ==========================================
    // 5. SQL-Abfrage schreiben
    // Holt Einstellungen + Farbnamen + Soundtyp
    // ==========================================

    $sql = "

    SELECT

        e.serialnr,
        e.bedtime,
        e.calmtime,
        e.shuffle,

        lc.colour AS lightcolour

    FROM einstellungen e

    JOIN lightcolour lc
    ON e.lightcolour_id = lc.id


    WHERE e.serialnr = ?

    ";


    // ==========================================
    // 6. SQL vorbereiten
    // ==========================================

    $stmt = $pdo->prepare($sql);


    // ==========================================
    // 7. SQL ausführen
    // ==========================================

    $stmt->execute([$serialnr]);


    // ==========================================
    // 8. Daten aus der Datenbank holen
    // ==========================================

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ==========================================
    // 9. Daten als JSON ausgeben
    // ==========================================

    echo json_encode($results);


} catch (Exception $e) {

    // ==========================================
    // 10. Fehler anzeigen
    // ==========================================

    echo json_encode([
        'error' => $e->getMessage()
    ]);

}

?>