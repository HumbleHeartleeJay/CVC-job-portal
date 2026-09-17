<?php
require "config.php";
$employerId = $_GET["employerId"] ?? null;

if ($employerId) {
    $stmt = $pdo->prepare("SELECT * FROM jobs WHERE employer_id = ? ORDER BY created_at DESC");
    $stmt->execute([$employerId]);
} else {
    $stmt = $pdo->query("SELECT * FROM jobs ORDER BY created_at DESC");
}
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
