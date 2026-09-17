<?php
require "config.php";
$data = readJsonBody();

$role     = $data["role"] ?? "";
$email    = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

$table   = $role === "student" ? "students" : "employers";
$nameCol = $role === "student" ? "full_name" : "contact_name";

$stmt = $pdo->prepare("SELECT * FROM $table WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user["password"])) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid email or password"]);
    exit;
}

unset($user["password"]);
echo json_encode(["success" => true, "user" => $user, "displayName" => $user[$nameCol]]);
