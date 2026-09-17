<?php
// Public company info lookup by employer id — used by students browsing jobs
require "config.php";
$id = $_GET["id"] ?? 0;

$stmt = $pdo->prepare("SELECT company_name, industry, website, description, contact_name, phone, address FROM employers WHERE id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($row ?: new stdClass());
