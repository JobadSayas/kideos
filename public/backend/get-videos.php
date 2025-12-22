<?php
// Incluir conexión a la base de datos
include 'conexion.php';

// Configurar headers para JSON
header('Content-Type: application/json; charset=utf-8');

// Obtener parámetros de la URL
$language = isset($_GET['language']) ? $_GET['language'] : 'all';
$music = isset($_GET['music']) ? $_GET['music'] : null;

// Validar parámetros
$allowed_languages = ['ES', 'EN', 'all'];
if (!in_array($language, $allowed_languages)) {
    echo json_encode(['error' => 'Parámetro language no válido. Use ES, EN o all']);
    exit;
}

// Construir consulta con prepared statements
$sql = "SELECT id, url, cover, collection, language, title, description, tags, music, album, ethan FROM VideoKidsCatalog WHERE 1=1";
$types = "";
$params = [];

// Filtrar por language
if ($language !== 'all') {
    $sql .= " AND language = ?";
    $types .= "s";
    $params[] = $language;
}

// Filtrar por music
if ($music !== null) {
    // Validar valor de music
    if (!in_array(strtolower($music), ['true', 'false', '1', '0'])) {
        echo json_encode(['error' => 'Parámetro music no válido. Use true, false, 1 o 0']);
        exit;
    }
    
    $sql .= " AND music = ?";
    $types .= "i";
    $music_bool = (strtolower($music) === 'true' || $music === '1') ? 1 : 0;
    $params[] = $music_bool;
}

// Ordenar
$sql .= " ORDER BY collection, id";

// Preparar y ejecutar consulta
$stmt = $conn->prepare($sql);

if ($params) {
    $stmt->bind_param($types, ...$params);
}

if (!$stmt->execute()) {
    echo json_encode(['error' => 'Error en la ejecución: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();

// Preparar array para resultados
$videos = [];
$count = 0;

while ($row = $result->fetch_assoc()) {
    // Convertir el valor de music a booleano para JSON
    $row['music'] = (bool)$row['music'];
    
    // Agregar al array
    $videos[] = $row;
    $count++;
}

// Crear respuesta JSON
$response = [
    'success' => true,
    'count' => $count,
    'filters' => [
        'language' => $language,
        'music' => $music !== null ? (bool)$music_bool : 'all'
    ],
    'videos' => $videos
];

// Devolver JSON
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// Cerrar conexión
$stmt->close();
$conn->close();
?>