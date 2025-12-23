<?php
// new-video.php
// API para crear nuevos videos en el catálogo

// Incluir conexión a la base de datos
include 'conexion.php';

// 1. PRIMERO MANEJAR CORS (ANTES DE CUALQUIER OUTPUT)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400'); // Cache preflight por 24 horas

// 2. Manejar preflight request (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. Configurar headers para JSON
header('Content-Type: application/json; charset=utf-8');

// Permitir solo método POST (después de manejar OPTIONS)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido. Use POST'
    ]);
    exit;
}

// Leer y decodificar el JSON recibido
$input = json_decode(file_get_contents('php://input'), true);

// Verificar si se recibió JSON válido
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'JSON inválido: ' . json_last_error_msg()
    ]);
    exit;
}

// Validar campos obligatorios
$required_fields = ['url', 'cover', 'collection'];
foreach ($required_fields as $field) {
    if (empty(trim($input[$field] ?? ''))) {
        echo json_encode([
            'success' => false,
            'error' => "El campo '$field' es obligatorio"
        ]);
        exit;
    }
}

// Preparar y sanitizar datos
$url = trim($input['url']);
$cover = trim($input['cover']);
$collection = trim($input['collection']);
$language = isset($input['language']) ? trim($input['language']) : 'ES';
$description = isset($input['description']) ? trim($input['description']) : '';
$tags = isset($input['tags']) ? trim($input['tags']) : '';
$music = isset($input['music']) ? (int)$input['music'] : 0;
$album = isset($input['album']) ? trim($input['album']) : '';
$ethan = isset($input['ethan']) ? trim($input['ethan']) : '';

// Validar idioma (solo ES o EN)
$allowed_languages = ['ES', 'EN'];
if (!in_array($language, $allowed_languages)) {
    echo json_encode([
        'success' => false,
        'error' => 'Idioma no válido. Use ES o EN'
    ]);
    exit;
}

// Validar valor de music (debe ser 0 o 1)
if ($music !== 0 && $music !== 1) {
    echo json_encode([
        'success' => false,
        'error' => 'El campo music debe ser 0 o 1'
    ]);
    exit;
}

// Preparar la consulta SQL para insertar
$sql = "INSERT INTO VideoKidsCatalog 
        (url, cover, collection, language, description, tags, music, album, ethan) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error al preparar la consulta: ' . $conn->error
    ]);
    exit;
}

// Vincular parámetros
$stmt->bind_param(
    "ssssssiss",  // Tipos: s=string, i=integer
    $url,
    $cover,
    $collection,
    $language,
    $description,
    $tags,
    $music,
    $album,
    $ethan
);

// Ejecutar la inserción
if ($stmt->execute()) {
    // Obtener el ID del nuevo registro insertado
    $new_id = $stmt->insert_id;
    
    echo json_encode([
        'success' => true,
        'message' => 'Video creado exitosamente',
        'id' => $new_id,
        'data' => [
            'url' => $url,
            'cover' => $cover,
            'collection' => $collection,
            'language' => $language,
            'description' => $description,
            'tags' => $tags,
            'music' => (bool)$music,
            'album' => $album,
            'ethan' => $ethan
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Error al insertar en la base de datos: ' . $stmt->error
    ]);
}

// Cerrar statement y conexión
$stmt->close();
$conn->close();
?>