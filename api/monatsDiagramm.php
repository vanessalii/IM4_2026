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

    $year = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y'));
    $month = isset($_GET['month']) ? intval($_GET['month']) : intval(date('m'));

    if ($month < 1 || $month > 12) {
        throw new Exception("Ungültiger Monat");
    }

    // Seriennummer aus devices holen
    $stmt = $pdo->prepare("SELECT serialnr FROM devices WHERE user_id = ?");
    $stmt->execute([$userId]);
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$device || empty($device['serialnr'])) {
        throw new Exception("Keine Seriennummer für diesen User gefunden");
    }

    $serialnr = $device['serialnr'];

    // Start und Ende des ausgewählten Monats
    $startDate = sprintf("%04d-%02d-01", $year, $month);
    $endDate = date("Y-m-t", strtotime($startDate));

    $sql = "
        SELECT 
            DATE(timestamp) AS tag,
            DAY(timestamp) AS tag_nummer,
            COUNT(*) AS anzahl
        FROM sensordaten
        WHERE serialnr = ?
        AND DATE(timestamp) >= ?
        AND DATE(timestamp) <= ?
        GROUP BY DATE(timestamp), DAY(timestamp)
        ORDER BY DATE(timestamp) ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$serialnr, $startDate, $endDate]);
    $daten = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "serialnr" => $serialnr,
        "year" => $year,
        "month" => $month,
        "startDate" => $startDate,
        "endDate" => $endDate,
        "daten" => $daten
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>