<?php
require "config.php";
$data  = readJsonBody();
$email = $data["studentEmail"];
$jobId = $data["jobId"];

$check = $pdo->prepare("SELECT id FROM saved_jobs WHERE student_email = ? AND job_id = ?");
$check->execute([$email, $jobId]);

if ($check->fetch()) {
    $del = $pdo->prepare("DELETE FROM saved_jobs WHERE student_email = ? AND job_id = ?");
    $del->execute([$email, $jobId]);
    echo json_encode(["saved" => false]);
} else {
    $ins = $pdo->prepare("INSERT INTO saved_jobs (student_email, job_id) VALUES (?, ?)");
    $ins->execute([$email, $jobId]);
    echo json_encode(["saved" => true]);
}
