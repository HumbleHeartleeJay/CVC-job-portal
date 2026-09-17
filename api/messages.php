<?php
require "config.php";

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $jobId = $_GET["jobId"] ?? 0;
    $email = $_GET["studentEmail"] ?? "";
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE job_id = ? AND student_email = ? ORDER BY created_at ASC");
    $stmt->execute([$jobId, $email]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    $data = readJsonBody();
    $stmt = $pdo->prepare("INSERT INTO messages (job_id, student_email, sender, message) VALUES (?,?,?,?)");
    $stmt->execute([$data["jobId"], $data["studentEmail"], $data["sender"], $data["message"]]);
    echo json_encode(["success" => true]);
}
