<?php
$host = "145.223.107.87";
$user = "u580438992_apps";
$pw = "YsyE5091B*";
$db = "u580438992_apps";

// Crear conexión con MySQLi
$conn = new mysqli($host, $user, $pw, $db);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}
?>
