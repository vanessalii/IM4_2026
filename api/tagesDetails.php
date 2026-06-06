<?php

session_start();
header('Content-Type: application/json');

require_once("../system/config.php");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Nicht eingeloggt"
    ]);
    exit;
}

try {
    // ==========================================
    // 1. Datum aus URL lesen
    // Beispiel: /api/tagesDetails.php?date=2026-05-21
    // ==========================================

    if (!isset($_GET['date'])) {
        throw new Exception("Kein Datum übergeben");
    }

    $date = $_GET['date'];

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        throw new Exception("Ungültiges Datumsformat");
    }

    $userId = $_SESSION['user_id'];

    // ==========================================
    // 2. Seriennummer des eingeloggten Users holen
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT serialnr 
        FROM devices 
        WHERE user_id = ?
        LIMIT 1
    ");

    $stmt->execute([$userId]);
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$device || empty($device['serialnr'])) {
        throw new Exception("Keine Seriennummer für diesen User gefunden");
    }

    $serialnr = $device['serialnr'];

    // ==========================================
    // 3. Sensordaten für diesen Tag holen
    // Eure sensordaten-Tabelle hat:
    // id, timestamp, serialnr
    // ==========================================

    $sqlEvents = "
        SELECT 
            id,
            timestamp
        FROM sensordaten
        WHERE serialnr = ?
        AND DATE(timestamp) = ?
        ORDER BY timestamp ASC
    ";

    $stmt = $pdo->prepare($sqlEvents);
    $stmt->execute([$serialnr, $date]);
    $ereignisse = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $gesamt = count($ereignisse);

    // ==========================================
    // 4. Letzte gültige Einstellung bis Ende des Tages holen
    // Das ist die Einstellung, die um 23:59 Uhr aktiv war.
    // ==========================================

    $endOfDay = $date . " 23:59:59";

    $sqlLatestSettings = "
        SELECT 
            eh.bedtime,
            eh.calmtime,
            eh.shuffle,
            eh.lightcolour_id,
            eh.soundtype_id,
            eh.created_at,
            lc.name AS light_name,
            lc.colour AS light_colour,
            st.typename AS soundtype
        FROM einstellungen_history eh
        LEFT JOIN lightcolour lc
            ON eh.lightcolour_id = lc.id
        LEFT JOIN soundtype st
            ON eh.soundtype_id = st.id
        WHERE eh.serialnr = ?
        AND eh.created_at <= ?
        ORDER BY eh.created_at DESC
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sqlLatestSettings);
    $stmt->execute([$serialnr, $endOfDay]);
    $latestSettings = $stmt->fetch(PDO::FETCH_ASSOC);

    // ==========================================
    // 5. Alle Einstellungsänderungen an diesem Tag holen
    // ==========================================

    $sqlSettingsChanges = "
        SELECT 
            eh.bedtime,
            eh.calmtime,
            eh.shuffle,
            eh.lightcolour_id,
            eh.soundtype_id,
            eh.created_at,
            lc.name AS light_name,
            lc.colour AS light_colour,
            st.typename AS soundtype
        FROM einstellungen_history eh
        LEFT JOIN lightcolour lc
            ON eh.lightcolour_id = lc.id
        LEFT JOIN soundtype st
            ON eh.soundtype_id = st.id
        WHERE eh.serialnr = ?
        AND DATE(eh.created_at) = ?
        ORDER BY eh.created_at ASC
    ";

    $stmt = $pdo->prepare($sqlSettingsChanges);
    $stmt->execute([$serialnr, $date]);
    $settingsChanges = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ==========================================
    // 6. Antwort als JSON ausgeben
    // ==========================================

    echo json_encode([
        "status" => "success",
        "date" => $date,
        "serialnr" => $serialnr,
        "gesamt" => $gesamt,
        "bewertung" => bewertungBerechnen($gesamt),
        "ereignisse" => $ereignisse,
        "latestSettings" => $latestSettings,
        "settingsChanges" => $settingsChanges
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

// ==========================================
// Bewertung anhand der Anzahl Aufwachereignisse
// ==========================================

function bewertungBerechnen($anzahl) {
    if ($anzahl <= 1) {
        return "Hervorragend";
    }

    if ($anzahl <= 3) {
        return "Gut";
    }

    if ($anzahl <= 5) {
        return "Okay";
    }

    return "Schlecht";
}

?>