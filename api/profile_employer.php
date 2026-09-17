<?php
require "config.php";

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $email = $_GET["email"] ?? "";
    $stmt = $pdo->prepare("SELECT * FROM employers WHERE email = ?");
    $stmt->execute([$email]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) unset($row["password"]);
    echo json_encode($row ?: new stdClass());
} else {
    $data = readJsonBody();
    $stmt = $pdo->prepare("UPDATE employers SET contact_name=?, phone=?, address=?, company_name=?, industry=?, website=?, description=? WHERE email=?");
    $stmt->execute([
        $data["contactName"] ?? null, $data["phone"] ?? null, $data["address"] ?? null,
        $data["companyName"] ?? null, $data["industry"] ?? null, $data["website"] ?? null,
        $data["description"] ?? null, $data["email"]
    ]);
    echo json_encode(["success" => true]);
}
