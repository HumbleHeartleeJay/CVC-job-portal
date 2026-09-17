<?php
require "config.php";
$studentEmail = $_GET["studentEmail"] ?? null;
$employerId   = $_GET["employerId"] ?? null;

if ($studentEmail) {
    $stmt = $pdo->prepare("SELECT * FROM applications WHERE student_email = ? ORDER BY applied_at DESC");
    $stmt->execute([$studentEmail]);
} elseif ($employerId) {
    $stmt = $pdo->prepare("SELECT a.* FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.employer_id = ? ORDER BY a.applied_at DESC");
    $stmt->execute([$employerId]);
} else {
    $stmt = $pdo->query("SELECT * FROM applications");
}
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
