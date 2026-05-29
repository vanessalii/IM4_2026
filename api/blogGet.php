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
    $sql = "
        SELECT 
            b.id,
            b.user_id,
            b.title,
            b.category,
            b.content,
            b.created_at,
            u.Firstname,
            u.Lastname
        FROM blogposts b
        LEFT JOIN users u
            ON b.user_id = u.id
        ORDER BY b.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "posts" => $posts
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>