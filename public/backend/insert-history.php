<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurar zona horaria a CST (Central Time)
date_default_timezone_set('America/Chicago');

// Configurar headers para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include 'conexion.php';

if (!isset($conn)) {
    echo json_encode(["error" => "Error de conexión a la base de datos"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

// Debug: Registrar lo que llega
file_put_contents('debug.log', date('[Y-m-d H:i] ').print_r($data, true), FILE_APPEND);

if (!isset($data["videoName"]) || empty(trim($data["videoName"]))) {
    echo json_encode([
        "error" => "Error: videoName es requerido y no puede estar vacío",
        "received_data" => $data // Para debugging
    ]);
    exit;
}

$videoName = $conn->real_escape_string(trim($data["videoName"]));
$datePlayed = date('Y-m-d H:i:00'); // Ahora usa la zona horaria CST

// Versión mejorada con prepared statements para mayor seguridad
$sql = "INSERT INTO VideoKidsHistory (videoName, datePlayed) VALUES (?, ?)";
$stmt = $conn->prepare($sql);

if ($stmt === false) {
    echo json_encode([
        "error" => "Error al preparar la consulta: " . $conn->error,
        "timezone" => date_default_timezone_get(),
        "current_time" => $datePlayed
    ]);
    exit;
}

$stmt->bind_param("ss", $videoName, $datePlayed);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Registro guardado correctamente",
        "data" => [
            "videoName" => $videoName,
            "datePlayed" => $datePlayed,
            "timezone" => "CST (America/Chicago)"
        ]
    ]);
} else {
    echo json_encode([
        "error" => "Error al ejecutar la consulta: " . $stmt->error,
        "sql_error" => $conn->error
    ]);
}

$stmt->close();
$conn->close();
?>