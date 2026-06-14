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

    // Seriennummer des eingeloggten Users aus devices holen
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
            "daten" => null
        ]);
        exit;
    }

    $serialnr = $device['serialnr'];

    /*
      Für die Home-Seite sollen nicht die aktuellen Einstellungen geladen werden,
      sondern die Einstellungen, die letzte Nacht um 23:59 Uhr aktiv waren.
    */
    $gestern = date("Y-m-d", strtotime("-1 day"));
    $settingsTime = $gestern . " 23:59:59";

    $sql = "
        SELECT 
            eh.serialnr,
            eh.bedtime,
            eh.calmtime,
            eh.shuffle,
            eh.lightcolour_id,
            eh.soundtype_id,
            eh.created_at,

            lc.name AS light_name,
            lc.colour AS light_hex,

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

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$serialnr, $settingsTime]);
    $einstellungen = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "serialnr" => $serialnr,
        "settingsTime" => $settingsTime,
        "daten" => $einstellungen
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>