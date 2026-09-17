<?php
require "config.php";
$data = readJsonBody();

$stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
$stmt->execute([$data["id"]]);
echo json_encode(["success" => true]);
