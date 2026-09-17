<?php
require "config.php";
$data = readJsonBody();

$stmt = $pdo->prepare("UPDATE jobs SET description = ?, salary = ? WHERE id = ?");
$stmt->execute([$data["description"], $data["salary"], $data["id"]]);
echo json_encode(["success" => true]);
