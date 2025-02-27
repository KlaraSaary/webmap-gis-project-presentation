<?php
/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Exception\HttpNotFoundException;
use Slim\Factory\AppFactory;


// Create a new Slim app instance
require __DIR__ . '/vendor/autoload.php';

$app = AppFactory::create();

$app->options('/{routes:.+}', function ($response) {
    return $response;
});

$app->add(function (Request $request, RequestHandler $handler) {
    return $handler->handle($request);
 });

// Log errors to a file
function logToFile($message) {
    $logFile = __DIR__ . '/debug.log';
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - " . $message . PHP_EOL, FILE_APPEND);
}

// Middleware to log requests
$app->add(function (Request $request, RequestHandler $handler) {
    $uri = $request->getUri();
    // logToFile("Requested URL: " . $uri);
    return $handler->handle($request);;
});

// Middleware to set CORS headers
$app->add(function (Request $request, RequestHandler $handler) {
    $response = $handler->handle($request);
    $response = $response->withHeader('Access-Control-Allow-Origin', 'self')
                         ->withHeader('Access-Control-Allow-Headers', 'Content-Type')
                         ->withHeader('Access-Control-Allow-Methods', 'GET, POST');
    return $response;
});

$app->add(function (Request $request, RequestHandler $handler) {
    $response = $handler->handle($request);
    $response = $response->withHeader('Content-Security-Policy', "")
                         ->withHeader('default-src', "'self'")
                         ->withHeader('style-src', "'self' 'nonce-init-style-random' https://unpkg.com/leaflet%401.9.4/dist/leaflet.css https://cdn.jsdelivr.net/npm/leaflet-draw-toolbar/dist/ https://cdn.jsdelivr.net/npm/leaflet-toolbar/dist/ https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/ https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css https://cdn.jsdelivr.net/npm/leaflet-sidebar-v2@3.2/css/leaflet-sidebar.min.css")
                         ->withHeader('script-src', "'self' https://cdn.jsdelivr.net/npm/dbgeo%401.1.0/ https://cdn.jsdelivr.net/npm/@ngageoint/simple-features-wkb-js@1.1/ https://cdn.jsdelivr.net/npm/@ngageoint/simple-features-geojson-js@1.1/ https://unpkg.com/leaflet%401.9.4/dist/leaflet.js https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/ https://cdn.jsdelivr.net/npm/leaflet-draw-toolbar/dist/ https://cdn.jsdelivr.net/npm/leaflet-toolbar/dist/ https://cdn.jsdelivr.net/npm/leaflet-sidebar-v2@3.2/js/leaflet-sidebar.min.js https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.11.0/proj4-src.min.js")
                         ->withHeader('img-src', "'self'  *.tile.openstreetmap.org/ https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/ https://cdn.jsdelivr.net/npm/leaflet-draw-toolbar/dist/ https://cdn.jsdelivr.net/npm/leaflet-toolbar/dist/ https://unpkg.com/leaflet@1.9.4/ data:")
                         ->withHeader('worker-src', "'self'");
    return $response;
});



// Define route to serve index.html
$app->get('/', function (Request $request, Response $response) {
    // Read the contents of index.html
    //logToFile('Serving index.html');
    $htmlContent = file_get_contents(__DIR__ . '/index.html');
    
    // Write the contents to the response body
    $response->getBody()->write($htmlContent);
    
    // Return the response
    return $response;
});


$app->get('/fileListAndData', function (Request $request, Response $response, $args) {
    try {
        // Extract and sanitize directory from query parameters
        $directory = filter_input(INPUT_GET, 'directory', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        if (!$directory) {
            throw new Exception('Invalid directory parameter');
        }
        // Construct full directory path
        $directoryPath = __DIR__ . '/' . $directory;

        // Check if directory exists
        if (!is_dir($directoryPath)) {
            throw new Exception('Directory not found');
        }

        // Fetch the file list
        $files = scandir($directoryPath);
        if ($files === false) {
            throw new Exception('Failed to read directory');
        }
        $fileData = [];

        // Process each file to read its content
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {  
                $filePath = $directoryPath . '/' . $file;
                $data = file_get_contents($filePath);

                // Get the file's MIME type
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $filePath);
                finfo_close($finfo);

                // Check the file extension for .json or .geojson
                $fileExtension = pathinfo($filePath, PATHINFO_EXTENSION);

                // If the file is a JSON file, set the MIME type to application/json
                if ($fileExtension === 'json' || $fileExtension === 'geojson') {
                    $mimeType = 'application/json'; // Set MIME type to application/json
                }

                // If the file is a JSON file, decode it
                if ($mimeType === 'application/json') {
                    $data = json_decode($data);
                }
                // If the file is an image, encode it as base64
                elseif (substr($mimeType, 0, 6) === 'image/') {
                    $data = base64_encode($data);
                }
                $fileData[] = ['name' => $file, 'data' => $data, 'mimeType' => $mimeType];
            }
        }

        // Return JSON response
        $response->getBody()->write(json_encode(['files' => $fileData]));
        return $response
            ->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        // Log error and return error response
        // logToFile('Error reading directory: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withStatus(500)
            ->withHeader('Content-Type', 'application/json');
    }
});


$app->get('/fileList', function (Request $request, Response $response, $args) {
    try {
        // Extract and sanitize directory from query parameters
        $directory = filter_input(INPUT_GET, 'directory', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        if (!$directory) {
            throw new Exception('Invalid directory parameter');
        }
        // Construct full directory path
        $directoryPath = __DIR__ . '/' . $directory;

        // Check if directory exists
        if (!is_dir($directoryPath)) {
            throw new Exception('Directory not found');
        }

        // Read files in directory
        $files = scandir($directoryPath);
        $fileData = [];

        // Call recursive function to scan directory and subdirectories
        scanDirectory($directoryPath, $directory, $fileData);

        // Return JSON response
        $response->getBody()->write(json_encode(['files' => $fileData]));
        return $response
            ->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        // Log error and return error response
        // logToFile('Error reading directory: ' . $e->getMessage());
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withStatus(500)
            ->withHeader('Content-Type', 'application/json');
    }
});

function scanDirectory($directoryPath, $relativePath, &$fileData) {
    // Read files in directory
    $files = scandir($directoryPath);
    // logToFile('Scanning directory: ' . $directoryPath, $files);
    // Process each file to read its content
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {  
            $filePath = $directoryPath . '/' . $file;
            $relativeFilePath = $relativePath . '/' . $file;

            if (is_dir($filePath)) {
                // If the file is a directory, scan it recursively
                scanDirectory($filePath, $relativeFilePath, $fileData);
            } else {
                // Get the file's MIME type
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $filePath);
                finfo_close($finfo);

                // Check the file extension for .json or .geojson
                $fileExtension = pathinfo($filePath, PATHINFO_EXTENSION);

                // If the file is a JSON file, set the MIME type to application/json
                if ($fileExtension === 'json' || $fileExtension === 'geojson') {
                    $mimeType = 'application/json'; // Set MIME type to application/json
                }

                $fileData[] = ['name' => $file, 'mimeType' => $mimeType, 'path' => $relativeFilePath];
            }
        }
    }
}

$app->get('/projectDescription', function (Request $request, Response $response, $args) {
    try {
        // Extract and sanitize project from query parameters
        $project = filter_input(INPUT_GET, 'project', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        if (!$project) {
            throw new Exception('Invalid project parameter');
        }

        // Construct full project path
        $projectPath = __DIR__ . '/data/html-description/' . $project . '.html';

        // Check if project exists
        if (!is_file($projectPath)) {
            throw new Exception('Project file not found');
        }

        // Read project description
        $description = file_get_contents($projectPath);

        // Create a new DOMDocument
        $doc = new DOMDocument();

        // Load the HTML
        @$doc->loadHTML($description);

        // Get the content inside the body tag
        $bodyContent = '';
        $body = $doc->getElementsByTagName('body')->item(0);
        if ($body !== null) {
            foreach ($body->childNodes as $child) {
                $bodyContent .= $doc->saveHTML($child);
            }
        }

        $response->getBody()->write($bodyContent);
        return $response
            ->withHeader('Content-Type', 'text/html');

    } catch (Exception $e) {
        // Log error and return error response
        error_log('Error reading project description: ' . $e->getMessage());
        return $response->withStatus(500)
            ->withHeader('Content-Type', 'application/json')
            ->getBody()
            ->write(json_encode(['error' => $e->getMessage()]));
    }
});

$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
    throw new HttpNotFoundException($request);
});
// Run the Slim application
$app->run();
?>

