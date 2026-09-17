<?php
// ═══════════════════════════════════════════════
// Database connection — shared by every API file
// ═══════════════════════════════════════════════
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { exit; }

$host = "localhost";
$db   = "cvc_hire";
$user = "root";
$pass = "";        // default XAMPP MySQL password is blank

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $pdo->setAttribute(PDO::ATTR_STRINGIFY_FETCHES, false);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Helper: read JSON body sent via fetch()
function readJsonBody() {
    return json_decode(file_get_contents("php://input"), true) ?? [];
}
