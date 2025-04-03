<?php
header("Content-Type: application/json");
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/auth_error.log');

// Connect to database
$conn = new mysqli(
    "dbserver.in.cs.ucy.ac.cy",
    "student",
    "gtNgMF8pZyZq6l53",
    "epl425"
);

if ($conn->connect_error) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Read JSON input
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !isset($data['action'])) {
    echo json_encode(["error" => "Invalid input or action missing"]);
    exit;
}

$action = $data['action'];

// ===================
// REGISTER
// ===================
if ($action === 'register') {
    $user = $data['username'];
    $display = $data['display_name'];
    $email = $data['email'];
    $pass = password_hash($data['password'], PASSWORD_DEFAULT);

    // Check for existing username
    $check = $conn->prepare("SELECT id FROM registered_users WHERE user_name = ?");
    $check->bind_param("s", $user);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(["error" => "Username already exists."]);
        exit;
    }

    // Check for existing email
    $checkEmail = $conn->prepare("SELECT id FROM registered_users WHERE email = ?");
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $checkEmail->store_result();

    if ($checkEmail->num_rows > 0) {
        echo json_encode(["error" => "An account with this email already exists."]);
        exit;
    }

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO registered_users (user_name, display_name, password, email) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $user, $display, $pass, $email);

    if ($stmt->execute()) {
        echo json_encode(["message" => "✅ Registration successful."]);
    } else {
        echo json_encode(["error" => "Registration failed."]);
    }

    $stmt->close();
}

// ===================
// LOGIN
// ===================
elseif ($action === 'login') {
    $user = $data['username'];
    $pass = $data['password'];

    // Fetch password and display name
    $stmt = $conn->prepare("SELECT password, display_name FROM registered_users WHERE user_name = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($hashed_pass, $display_name);
        $stmt->fetch();
        if (password_verify($pass, $hashed_pass)) {
            echo json_encode([
                "message" => "✅ Login successful.",
                "display_name" => $display_name
            ]);
        } else {
            echo json_encode(["error" => "❌ Invalid username or password."]);
        }
    } else {
        echo json_encode(["error" => "❌ Invalid username or password."]);
    }

    $stmt->close();
}

// ===================
// UNKNOWN ACTION
// ===================
else {
    echo json_encode(["error" => "Invalid action"]);
}

$conn->close();
?>
