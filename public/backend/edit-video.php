<?php
// edit-video.php
// API para editar videos existentes en el catálogo

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

// Validar que se recibió el ID del video
if (!isset($input['id']) || empty(trim($input['id']))) {
    echo json_encode([
        'success' => false,
        'error' => 'El ID del video es requerido para editar'
    ]);
    exit;
}

$video_id = (int)$input['id'];

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

// Validar idioma
$allowed_languages = ['ES', 'EN'];
if (!in_array($language, $allowed_languages)) {
    echo json_encode([
        'success' => false,
        'error' => 'Idioma no válido. Use ES o EN'
    ]);
    exit;
}

// Validar valor de music
if ($music !== 0 && $music !== 1) {
    echo json_encode([
        'success' => false,
        'error' => 'El campo music debe ser 0 o 1'
    ]);
    exit;
}

// Verificar que el video existe
$check_sql = "SELECT id FROM VideoKidsCatalog WHERE id = ?";
$check_stmt = $conn->prepare($check_sql);

if (!$check_stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error al verificar video: ' . $conn->error
    ]);
    exit;
}

$check_stmt->bind_param("i", $video_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();
$check_stmt->close();

if ($check_result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'error' => "El video con ID $video_id no existe"
    ]);
    exit;
}

// Actualizar el video
$update_sql = "UPDATE VideoKidsCatalog SET 
                url = ?,
                cover = ?,
                collection = ?,
                language = ?,
                description = ?,
                tags = ?,
                music = ?,
                album = ?,
                ethan = ?
              WHERE id = ?";

$update_stmt = $conn->prepare($update_sql);

if (!$update_stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error al preparar la actualización: ' . $conn->error
    ]);
    exit;
}

// Vincular parámetros
$update_stmt->bind_param(
    "ssssssissi",
    $url,
    $cover,
    $collection,
    $language,
    $description,
    $tags,
    $music,
    $album,
    $ethan,
    $video_id
);

// Ejecutar la actualización
if ($update_stmt->execute()) {
    $affected_rows = $update_stmt->affected_rows;
    
    if ($affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Video actualizado exitosamente',
            'id' => $video_id,
            'affected_rows' => $affected_rows,
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
            'success' => true,
            'message' => 'Video encontrado pero sin cambios necesarios',
            'id' => $video_id,
            'affected_rows' => 0,
            'note' => 'Los datos enviados son idénticos a los existentes'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Error al actualizar el video: ' . $update_stmt->error
    ]);
}

// Cerrar conexión
if (isset($update_stmt)) {
    $update_stmt->close();
}
$conn->close();
?>