<?php
header('Content-Type: application/json');

// Accept only GET and POST
$method = $_SERVER['REQUEST_METHOD'];

// === Handle POST ===
if ($method === 'POST') {
    $rawInput = file_get_contents("php://input");

    if (empty($rawInput)) {
        http_response_code(400);
        echo json_encode(["error" => "Empty request body"]);
        exit;
    }

    $input = json_decode($rawInput, true);

    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON format"]);
        exit;
    }

    // Required fields
    $required = ['username', 'address', 'region', 'city', 'country'];
    foreach ($required as $key) {
        if (!isset($input[$key]) || trim($input[$key]) === '') {
            http_response_code(400);
            echo json_encode(["error" => "Missing or empty field: $key"]);
            exit;
        }
    }

    // ✅ Connect to DB only after validation
    $conn = new mysqli(
        "dbserver.in.cs.ucy.ac.cy",
        "student",
        "gtNgMF8pZyZq6l53",
        "epl425"
    );

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed"]);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO requests (username, address, region, city, country, timestamp)
         VALUES (?, ?, ?, ?, ?, ?)"
    );

    $timestamp = time();
    $stmt->bind_param(// 🚫 All other methods are silently ignored — no 405 returned
        // This is intentional based on your request
        "sssssi",
        $input['username'],
        $input['address'],
        $input['region'],
        $input['city'],
        $input['country'],
        $timestamp
    );

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["message" => "Created"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Insert failed"]);
    }

    $stmt->close();
    $conn->close();
}

// === Handle GET ===
elseif ($method === 'GET') {
    if (!isset($_GET['username']) || trim($_GET['username']) === '') {
        http_response_code(400);
        echo json_encode(["error" => "Missing username parameter"]);
        exit;
    }

    $conn = new mysqli(
        "dbserver.in.cs.ucy.ac.cy",
        "student",
        "gtNgMF8pZyZq6l53",
        "epl425"
    );

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Database connection failed"]);
        exit;
    }

    $username = $conn->real_escape_string($_GET['username']);
    $query = "SELECT address, region, city, country, timestamp
              FROM requests WHERE username='$username'
              ORDER BY timestamp DESC LIMIT 5";

    $result = $conn->query($query);
    if (!$result) {
        http_response_code(500);
        echo json_encode(["error" => "Database query failed"]);
        $conn->close();
        exit;
    }

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    http_response_code(200);
    echo json_encode(["data" => $data]);
    $conn->close();
}

