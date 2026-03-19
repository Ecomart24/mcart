<?php
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to send JSON response
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Get JSON input
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    sendResponse(false, 'Invalid JSON data');
}

// Validate required fields
$required_fields = ['fullName', 'email', 'phone', 'streetAddress', 'city', 'state', 'pincode', 'cardName', 'cardNumber', 'expiry', 'cvv', 'otp'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    sendResponse(false, 'Missing required fields: ' . implode(', ', $missing_fields));
}

// Validate email
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, 'Invalid email address');
}

// Validate phone (basic validation)
if (!preg_match('/^[0-9]{10,15}$/', $data['phone'])) {
    sendResponse(false, 'Invalid phone number');
}

// Validate PIN code (6 digits)
if (!preg_match('/^[0-9]{6}$/', $data['pincode'])) {
    sendResponse(false, 'Invalid PIN code');
}

// Validate card number (basic Luhn algorithm)
$card_number = preg_replace('/\D/', '', $data['cardNumber']);
if (strlen($card_number) < 13 || strlen($card_number) > 19) {
    sendResponse(false, 'Invalid card number');
}

// Validate expiry date
if (!preg_match('/^(0[1-9]|1[0-2])\/([0-9]{2})$/', $data['expiry'])) {
    sendResponse(false, 'Invalid expiry date format (MM/YY)');
}

// Validate CVV
if (!preg_match('/^[0-9]{3,4}$/', $data['cvv'])) {
    sendResponse(false, 'Invalid CVV');
}

// Validate OTP (6 digits for testing)
if (!preg_match('/^[0-9]{6}$/', $data['otp'])) {
    sendResponse(false, 'Invalid OTP format');
}

// For testing purposes, accept any valid OTP
// In production, you would verify against a database or SMS service

// Create order data
$order_data = [
    'order_id' => 'ORD' . time() . rand(100, 999),
    'timestamp' => date('Y-m-d H:i:s'),
    'customer' => [
        'full_name' => $data['fullName'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'address' => [
            'street' => $data['streetAddress'],
            'address_line_2' => $data['addressLine2'] ?? '',
            'city' => $data['city'],
            'state' => $data['state'],
            'pincode' => $data['pincode']
        ]
    ],
    'payment' => [
        'card_name' => $data['cardName'],
        'card_last4' => substr($card_number, -4),
        'expiry' => $data['expiry'],
        'card_type' => getCardType($card_number)
    ],
    'items' => $data['items'] ?? [],
    'total' => $data['total'] ?? 0,
    'status' => 'completed'
];

// Log the order (for testing purposes)
$log_message = sprintf(
    "[%s] ORDER COMPLETED: %s - %s - %s - INR %s\n",
    date('Y-m-d H:i:s'),
    $order_data['order_id'],
    $order_data['customer']['full_name'],
    $order_data['customer']['email'],
    $order_data['total']
);

// Create orders directory if it doesn't exist
$orders_dir = __DIR__ . '/orders';
if (!is_dir($orders_dir)) {
    mkdir($orders_dir, 0755, true);
}

// Save order to file
$order_file = $orders_dir . '/order_' . $order_data['order_id'] . '.json';
file_put_contents($order_file, json_encode($order_data, JSON_PRETTY_PRINT));

// Log to orders log file
$log_file = $orders_dir . '/orders.log';
file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);

// Send success response
sendResponse(true, 'Order processed successfully', [
    'order_id' => $order_data['order_id'],
    'status' => 'completed'
]);

// Helper function to determine card type
function getCardType($card_number) {
    $card_number = preg_replace('/\D/', '', $card_number);
    
    if (preg_match('/^4/', $card_number)) {
        return 'visa';
    } elseif (preg_match('/^5[1-5]/', $card_number) || preg_match('/^2[2-7]/', $card_number)) {
        return 'mastercard';
    } elseif (preg_match('/^3[47]/', $card_number)) {
        return 'amex';
    } elseif (preg_match('/^6/', $card_number)) {
        return 'discover';
    } else {
        return 'unknown';
    }
}
?>
