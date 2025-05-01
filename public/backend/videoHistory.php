<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
file_put_contents('debug.log', print_r($data, true), FILE_APPEND);

if (!isset($data["videoName"]) || empty(trim($data["videoName"]))) {
    echo json_encode(["error" => "Error: videoName es requerido y no puede estar vacío"]);
    exit;
}

$videoName = $conn->real_escape_string(trim($data["videoName"]));
$datePlayed = date('Y-m-d H:i:s');

$sql = "INSERT INTO VideoKidsHistory (videoName, datePlayed) VALUES ('$videoName', '$datePlayed')";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["success" => true, "message" => "Registro guardado"]);
} else {
    echo json_encode(["error" => "Error SQL: " . $conn->error]);
}

$conn->close();
?>