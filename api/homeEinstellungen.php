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
    $userId = $_SESSION['user_id'];

    // Seriennummer aus devices holen
    $stmt = $pdo->prepare("SELECT serialnr FROM devices WHERE user_id = ?");
    $stmt->execute([$userId]);
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$device || empty($device['serialnr'])) {
        throw new Exception("Keine Seriennummer für diesen User gefunden");
    }

    $serialnr = $device['serialnr'];

    // Einstellungen + Lichtfarbe holen
    $sql = "
        SELECT 
            e.serialnr,
            e.bedtime,
            e.calmtime,
            e.shuffle,
            e.lightcolour_id,
            lc.name AS lightcolour_name,
            lc.colour AS lightcolour_hex
        FROM einstellungen e
        JOIN lightcolour lc
            ON e.lightcolour_id = lc.id
        WHERE e.serialnr = ?
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$serialnr]);
    $einstellungen = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$einstellungen) {
        throw new Exception("Keine Einstellungen gefunden");
    }

    echo json_encode([
        "status" => "success",
        "daten" => $einstellungen
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>