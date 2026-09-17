<?php
require "config.php";
$data = readJsonBody();

$stmt = $pdo->prepare("INSERT IGNORE INTO applications (job_id, student_email, student_name) VALUES (?,?,?)");
$stmt->execute([$data["jobId"], $data["studentEmail"], $data["studentName"]]);
echo json_encode(["success" => true]);
