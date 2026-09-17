<?php
require "config.php";

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $email = $_GET["email"] ?? "";
    $stmt = $pdo->prepare("SELECT * FROM students WHERE email = ?");
    $stmt->execute([$email]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) unset($row["password"]);
    echo json_encode($row ?: new stdClass());
} else {
    $data = readJsonBody();
    $stmt = $pdo->prepare("UPDATE students SET last_name=?, first_name=?, mi=?, birthdate=?, age=?, phone=?, address=?, skills=?, course=?, school=?, bio=? WHERE email=?");
    $stmt->execute([
        $data["lastName"]  ?? null, $data["firstName"] ?? null, $data["mi"] ?? null,
        $data["birthdate"] ?: null, $data["age"] ?: null,
        $data["phone"] ?? null, $data["address"] ?? null, $data["skills"] ?? null,
        $data["course"] ?? null, $data["school"] ?? null, $data["bio"] ?? null,
        $data["email"]
    ]);
    echo json_encode(["success" => true]);
}
