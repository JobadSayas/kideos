<?php
// get-collections.php
// API para obtener todas las colecciones únicas de la base de datos

// Incluir conexión a la base de datos
include 'conexion.php';

// Configurar headers para JSON y CORS (CRUCIAL para evitar problemas CORS)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400'); // Cache preflight por 24 horas

// Manejar preflight request (OPTIONS) - IMPORTANTE para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir método GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido. Use GET'
    ]);
    exit;
}

// Opcional: puedes agregar parámetros de filtro si los necesitas en el futuro
// Por ejemplo: ?language=ES o ?music=true
$language = isset($_GET['language']) ? $_GET['language'] : null;
$music = isset($_GET['music']) ? $_GET['music'] : null;

// Construir consulta con prepared statements
$sql = "SELECT DISTINCT collection FROM VideoKidsCatalog WHERE collection IS NOT NULL AND collection != ''";
$types = "";
$params = [];

// Filtrar por language si se proporciona
if ($language !== null) {
    $allowed_languages = ['ES', 'EN', 'all'];
    if (!in_array($language, $allowed_languages)) {
        echo json_encode(['error' => 'Parámetro language no válido. Use ES, EN o all']);
        exit;
    }
    
    if ($language !== 'all') {
        $sql .= " AND language = ?";
        $types .= "s";
        $params[] = $language;
    }
}

// Filtrar por music si se proporciona
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

// Ordenar alfabéticamente
$sql .= " ORDER BY collection ASC";

// Preparar y ejecutar consulta
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error al preparar la consulta: ' . $conn->error
    ]);
    exit;
}

if ($params) {
    $stmt->bind_param($types, ...$params);
}

if (!$stmt->execute()) {
    echo json_encode([
        'success' => false,
        'error' => 'Error en la ejecución: ' . $stmt->error
    ]);
    exit;
}

$result = $stmt->get_result();

// Preparar array para colecciones
$collections = [];
$count = 0;

while ($row = $result->fetch_assoc()) {
    // Agregar al array
    $collections[] = $row['collection'];
    $count++;
}

// Crear respuesta JSON
$response = [
    'success' => true,
    'count' => $count,
    'timestamp' => time(), // Para cache en el frontend
    'collections' => $collections
];

// Agregar información de filtros si se usaron
if ($language !== null || $music !== null) {
    $response['filters'] = [
        'language' => $language !== null ? $language : 'all',
        'music' => $music !== null ? (bool)$music_bool : 'all'
    ];
}

// Devolver JSON
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// Cerrar conexión
$stmt->close();
$conn->close();
?>