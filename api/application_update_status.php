<?php
require "config.php";
$data = readJsonBody();

$stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE job_id = ? AND student_email = ?");
$stmt->execute([$data["status"], $data["jobId"], $data["studentEmail"]]);
echo json_encode(["success" => true]);
