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
    if (!isset($_GET['date'])) {
        throw new Exception("Kein Datum übergeben");
    }

    $date = $_GET['date'];

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        throw new Exception("Ungültiges Datumsformat");
    }

    $userId = $_SESSION['user_id'];

    // Seriennummer aus devices holen
    $stmt = $pdo->prepare("SELECT serialnr FROM devices WHERE user_id = ?");
    $stmt->execute([$userId]);
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$device || empty($device['serialnr'])) {
        throw new Exception("Keine Seriennummer für diesen User gefunden");
    }

    $serialnr = $device['serialnr'];

    // Sensordaten für diesen Tag holen
    // Eure Tabelle sensordaten hat nur: id, timestamp, serialnr
    $sql = "
        SELECT 
            id,
            timestamp
        FROM sensordaten
        WHERE serialnr = ?
        AND DATE(timestamp) = ?
        ORDER BY timestamp ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$serialnr, $date]);
    $ereignisse = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $gesamt = count($ereignisse);

    // Aktive Einstellungen holen
    // Eure Tabelle einstellungen hat: bedtime, calmtime, shuffle, lightcolour_id
    $sqlSettings = "
        SELECT 
            e.bedtime,
            e.calmtime,
            e.shuffle,
            e.lightcolour_id,
            lc.name AS light_name,
            lc.colour AS light_colour
        FROM einstellungen e
        LEFT JOIN lightcolour lc
            ON e.lightcolour_id = lc.id
        WHERE e.serialnr = ?
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sqlSettings);
    $stmt->execute([$serialnr]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "date" => $date,
        "serialnr" => $serialnr,
        "gesamt" => $gesamt,
        "bewertung" => bewertungBerechnen($gesamt),
        "ereignisse" => $ereignisse,
        "settings" => $settings
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

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