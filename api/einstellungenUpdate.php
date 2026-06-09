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
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        throw new Exception("Keine Daten empfangen");
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

    $bedtime = 21;
    $calmtime = $data["calmtime"] ?? 5;
    $shuffle = 0;
    $lightcolour_id = $data["lightcolour_id"] ?? 5;
    $soundtype_id = $data["soundtype_id"] ?? 7;

    // Aktuelle Einstellungen aktualisieren
    $sql = "
        UPDATE einstellungen
        SET 
            bedtime = ?,
            calmtime = ?,
            shuffle = ?,
            lightcolour_id = ?,
            soundtype_id = ?
        WHERE serialnr = ?
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $bedtime,
        $calmtime,
        $shuffle,
        $lightcolour_id,
        $soundtype_id,
        $serialnr
    ]);

    // Einstellung zusätzlich im Verlauf speichern
    $historySql = "
        INSERT INTO einstellungen_history
        (serialnr, bedtime, calmtime, shuffle, lightcolour_id, soundtype_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ";

    $historyStmt = $pdo->prepare($historySql);
    $historyStmt->execute([
        $serialnr,
        $bedtime,
        $calmtime,
        $shuffle,
        $lightcolour_id,
        $soundtype_id
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Einstellungen gespeichert",
        "serialnr" => $serialnr,
        "bedtime" => $bedtime,
        "calmtime" => $calmtime,
        "shuffle" => $shuffle,
        "lightcolour_id" => $lightcolour_id,
        "soundtype_id" => $soundtype_id
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>