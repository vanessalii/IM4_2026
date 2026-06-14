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

    // Seriennummer des eingeloggten Users holen
    $stmt = $pdo->prepare("
        SELECT serialnr 
        FROM devices 
        WHERE user_id = ?
        LIMIT 1
    ");

    $stmt->execute([$userId]);
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$device || empty($device['serialnr'])) {
        echo json_encode([
            "status" => "success",
            "message" => "Kein Schaf verbunden",
            "serialnr" => null,
            "date" => null,
            "settingsTime" => null,
            "anzahl" => 0,
            "daten" => [],
            "latestSettings" => null
        ]);
        exit;
    }

    $serialnr = $device['serialnr'];

    /*
      Letzte Nacht:

    */
    $gestern = date("Y-m-d", strtotime("-1 day"));
    $heute = date("Y-m-d");

    $startLetzteNacht = $gestern . " 12:00:00";
    $endeLetzteNacht = $heute . " 11:59:00";

    $settingsTime = $gestern . " 23:59:59";

    // Sensordaten der letzten Nacht laden
    $sqlEvents = "
        SELECT 
            id,
            `timestamp`
        FROM sensordaten
        WHERE serialnr = ?
        AND `timestamp` BETWEEN ? AND ?
        ORDER BY `timestamp` ASC
    ";

    $stmt = $pdo->prepare($sqlEvents);
    $stmt->execute([
        $serialnr,
        $startLetzteNacht,
        $endeLetzteNacht
    ]);

    $daten = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Einstellungen laden, die gestern um 23:59 Uhr aktiv waren
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
    $stmt->execute([
        $serialnr,
        $settingsTime
    ]);

    $latestSettings = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "serialnr" => $serialnr,
        "date" => $gestern,
        "startLetzteNacht" => $startLetzteNacht,
        "endeLetzteNacht" => $endeLetzteNacht,
        "settingsTime" => $settingsTime,
        "anzahl" => count($daten),
        "daten" => $daten,
        "latestSettings" => $latestSettings
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>