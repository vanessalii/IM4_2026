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

    $postId = intval($data["id"] ?? 0);
    $userId = $_SESSION['user_id'];

    if ($postId <= 0) {
        throw new Exception("Ungültige Beitrags-ID");
    }

    $sql = "
        DELETE FROM blogposts
        WHERE id = ?
        AND user_id = ?
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$postId, $userId]);

    if ($stmt->rowCount() === 0) {
        throw new Exception("Beitrag wurde nicht gefunden oder gehört nicht zu diesem User");
    }

    echo json_encode([
        "status" => "success",
        "message" => "Beitrag gelöscht"
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>