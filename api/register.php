<?php
require "config.php";
$data = readJsonBody();

$role     = $data["role"] ?? "";
$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";
$name     = trim($data["name"] ?? "");

if (!$email || !$password || !$name || !in_array($role, ["student", "employee"])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing or invalid fields"]);
    exit;
}

$table   = $role === "student" ? "students" : "employers";
$nameCol = $role === "student" ? "full_name" : "contact_name";

try {
    $check = $pdo->prepare("SELECT id FROM $table WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(["error" => "An account with this email already exists"]);
        exit;
    }

    $hashed = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare("INSERT INTO $table (email, password, $nameCol) VALUES (?, ?, ?)");
    $stmt->execute([$email, $hashed, $name]);

    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}