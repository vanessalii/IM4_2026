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

    $serialnr = trim($data["serialnr"] ?? "");
    $userId = $_SESSION['user_id'];

    if ($serialnr === "") {
        throw new Exception("Seriennummer fehlt");
    }

    // Prüfen, ob dieser User bereits ein Gerät verbunden hat
    $check = $pdo->prepare("SELECT id FROM devices WHERE user_id = ?");
    $check->execute([$userId]);
    $existingDevice = $check->fetch(PDO::FETCH_ASSOC);

    if ($existingDevice) {
        // Seriennummer aktualisieren
        $sql = "
            UPDATE devices
            SET serialnr = ?
            WHERE user_id = ?
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$serialnr, $userId]);
    } else {
        // Neues Gerät verbinden
        $sql = "
            INSERT INTO devices
            (user_id, serialnr)
            VALUES (?, ?)
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $serialnr]);
    }

    // Prüfen, ob es bereits Einstellungen für diese Seriennummer gibt
    $checkSettings = $pdo->prepare("SELECT id FROM einstellungen WHERE serialnr = ?");
    $checkSettings->execute([$serialnr]);
    $settings = $checkSettings->fetch(PDO::FETCH_ASSOC);

    if (!$settings) {
        // Standard-Einstellungen für neues Gerät erstellen
        $insertSettings = $pdo->prepare("
            INSERT INTO einstellungen
            (serialnr, bedtime, calmtime, shuffle, lightcolour_id)
            VALUES (?, ?, ?, ?, ?)
        ");

        $insertSettings->execute([
            $serialnr,
            20,
            5,
            1,
            5
        ]);
    }

    echo json_encode([
        "status" => "success",
        "message" => "Gerät wurde verbunden",
        "serialnr" => $serialnr
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>