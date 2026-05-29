<?php

session_start();
header('Content-Type: application/json');

require_once("../system/config.php");

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized"
    ]);
    exit;
}

try {
    $userId = $_SESSION['user_id'];

    // Seriennummer des eingeloggten Users holen
    $stmt = $pdo->prepare("SELECT serialnr FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || empty($user['serialnr'])) {
        throw new Exception("Keine Seriennummer für diesen User gefunden");
    }

    $serialnr = $user['serialnr'];

    /*
      Letzte Nacht:
      von gestern 18:00 Uhr bis heute 12:00 Uhr
      Das könnt ihr später anpassen.
    */
   $sql = "
    SELECT 
        id,
        timestamp
    FROM sensordaten
    WHERE serialnr = ?
    AND DATE(timestamp) = CURDATE()
    ORDER BY timestamp ASC
";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$serialnr]);
    $daten = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "serialnr" => $serialnr,
        "anzahl" => count($daten),
        "daten" => $daten
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>