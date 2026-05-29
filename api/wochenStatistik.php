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

    /*
      Aufwachereignisse der letzten 7 Tage zählen.
      Eure Tabelle sensordaten hat die Spalte timestamp.
    */
   $sql = "
    SELECT 
        DATE(timestamp) AS tag,
        COUNT(*) AS anzahl
    FROM sensordaten
    WHERE serialnr = ?
    AND DATE(timestamp) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    AND DATE(timestamp) <= CURDATE()
    GROUP BY DATE(timestamp)
    ORDER BY tag ASC
";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$serialnr]);
    $daten = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "serialnr" => $serialnr,
        "daten" => $daten
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>