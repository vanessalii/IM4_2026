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

    // Start und Ende des Monats
    $startDate = sprintf("%04d-%02d-01", $year, $month);
    $endDate = date("Y-m-t", strtotime($startDate));

    // Wenn aktueller Monat gewählt ist, nur bis heute zählen
    $currentYear = intval(date('Y'));
    $currentMonth = intval(date('m'));

    if ($year === $currentYear && $month === $currentMonth) {
        $endDate = date('Y-m-d');
    }

    // Anzahl Tage im Zeitraum berechnen
    $start = new DateTime($startDate);
    $end = new DateTime($endDate);
    $daysInRange = $start->diff($end)->days + 1;

    // Alle Aufwachereignisse im gewählten Monat zählen
    $sql = "
        SELECT COUNT(*) AS total
        FROM sensordaten
        WHERE serialnr = ?
        AND DATE(timestamp) >= ?
        AND DATE(timestamp) <= ?
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$serialnr, $startDate, $endDate]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    $total = intval($result['total']);
    $average = $daysInRange > 0 ? round($total / $daysInRange, 1) : 0;

    echo json_encode([
        "status" => "success",
        "serialnr" => $serialnr,
        "year" => $year,
        "month" => $month,
        "startDate" => $startDate,
        "endDate" => $endDate,
        "days" => $daysInRange,
        "total" => $total,
        "average" => $average
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>