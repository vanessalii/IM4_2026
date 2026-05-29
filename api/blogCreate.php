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

    $title = trim($data["title"] ?? "");
    $category = trim($data["category"] ?? "");
    $content = trim($data["content"] ?? "");
    $userId = $_SESSION['user_id'];

    if ($title === "" || $category === "" || $content === "") {
        throw new Exception("Titel, Kategorie und Inhalt sind erforderlich");
    }

    $sql = "
        INSERT INTO blogposts 
        (user_id, title, category, content)
        VALUES (?, ?, ?, ?)
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $userId,
        $title,
        $category,
        $content
    ]);

    echo json_encode([
        "status" => "success",
        "message" => "Beitrag gespeichert",
        "id" => $pdo->lastInsertId()
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>