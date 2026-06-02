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
    $stmt = $pdo->prepare("SELECT serialnr FROM devices WHERE user_id = ?");
    $stmt->execute([$userId]);
    $device = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$device || empty($device['serialnr'])) {
        throw new Exception("Keine Seriennummer für diesen User gefunden");
    }

    $serialnr = $device['serialnr'];

    // Einstellungen inkl. Lichtfarbe und Sound holen
    $sql = "
        SELECT 
            e.serialnr,
            e.bedtime,
            e.calmtime,
            e.shuffle,
            e.lightcolour_id,
            e.soundtype_id,

            lc.name AS light_name,
            lc.colour AS light_hex,

            st.typename AS soundtype
        FROM einstellungen e
        LEFT JOIN lightcolour lc
            ON e.lightcolour_id = lc.id
        LEFT JOIN soundtype st
            ON e.soundtype_id = st.id
        WHERE e.serialnr = ?
        LIMIT 1
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