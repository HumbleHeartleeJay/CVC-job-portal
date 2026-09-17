<?php
require "config.php";
$data = readJsonBody();

$stmt = $pdo->prepare("INSERT INTO jobs (employer_id, title, company, type, location, salary, description) VALUES (?,?,?,?,?,?,?)");
$stmt->execute([
    $data["employerId"], $data["title"], $data["company"], $data["type"],
    $data["location"], $data["salary"], $data["description"]
]);
echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
