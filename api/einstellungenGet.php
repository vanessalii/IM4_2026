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

    // Seriennummer aus der Tabelle devices holen
    $stmt = $pdo->prepare("SELECT serialnr FROM devices WHERE user_id = ?");
    $stmt->execute([$userId]);
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$device || empty($device['serialnr'])) {
        throw new Exception("Keine Seriennummer für diesen User gefunden");
    }

    $serialnr = $device['serialnr'];

    $stmt = $pdo->prepare("
        SELECT 
            serialnr,
            bedtime,
            calmtime,
            shuffle,
            lightcolour_id
        FROM einstellungen
        WHERE serialnr = ?
    ");

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