<?php
require "config.php";
$email = $_GET["studentEmail"] ?? "";
$stmt = $pdo->prepare("SELECT job_id FROM saved_jobs WHERE student_email = ?");
$stmt->execute([$email]);
echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
