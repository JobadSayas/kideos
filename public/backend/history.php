<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: text/html; charset=utf-8');

include 'conexion.php';

if (!isset($conn)) {
    die("Error: No se pudo conectar a la base de datos");
}

// Consulta modificada para formatear la hora sin segundos
$sql = "SELECT id, videoName, DATE_FORMAT(datePlayed, '%Y-%m-%d %H:%i') as formattedDate FROM VideoKidsHistory ORDER BY id DESC";
$result = $conn->query($sql);

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registros de VideoKids</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Registros de VideoKids</h1>
            
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-green-600">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre del Video</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha y Hora</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <?php
                            if ($result->num_rows > 0) {
                                while($row = $result->fetch_assoc()) {
                                    echo '<tr class="hover:bg-gray-50">';
                                    echo '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">'.htmlspecialchars($row['id']).'</td>';
                                    echo '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">'.htmlspecialchars($row['videoName']).'</td>';
                                    echo '<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">'.htmlspecialchars($row['formattedDate']).'</td>';
                                    echo '</tr>';
                                }
                            } else {
                                echo '<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No hay registros encontrados</td></tr>';
                            }
                            ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</body>
</html>

<?php
$conn->close();
?>