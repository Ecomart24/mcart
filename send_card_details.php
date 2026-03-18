<?php
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed."
    ]);
    exit;
}

$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);
if (!is_array($data)) {
    $data = $_POST;
}

function clean_text($value) {
    $text = trim((string) $value);
    return str_replace(["\r", "\n"], " ", $text);
}

$cardName = clean_text($data["cardName"] ?? "");
$cardNumber = clean_text($data["cardNumber"] ?? "");
$cardExpiry = clean_text($data["cardExpiry"] ?? "");
$cardCvv = clean_text($data["cardCvv"] ?? "");
$timestamp = clean_text($data["timestamp"] ?? date("Y-m-d H:i:s"));
$cartItems = $data["cartItems"] ?? [];
$orderTotal = (float) ($data["orderTotal"] ?? 0);
$addressData = $data["addressData"] ?? [];

if ($cardName === "" || $cardNumber === "" || $cardExpiry === "" || $cardCvv === "") {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "All card details are required."
    ]);
    exit;
}

if (!is_array($cartItems) || count($cartItems) === 0) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Cart is empty."
    ]);
    exit;
}

$orderLines = [];
foreach ($cartItems as $item) {
    $name = clean_text($item["name"] ?? "Product");
    $qty = (int) ($item["qty"] ?? 1);
    $price = (float) ($item["price"] ?? 0);
    $lineTotal = $qty * $price;
    $orderLines[] = $name . " x " . $qty . " = INR " . number_format($lineTotal, 2);
}

$message = "Card details received from Mcart website\n\n";
$message .= "========================================\n";
$message .= "CUSTOMER INFORMATION\n";
$message .= "========================================\n";
$message .= "Name: " . clean_text($addressData["fullName"] ?? "") . "\n";
$message .= "Phone: " . clean_text($addressData["phone"] ?? "") . "\n";
$message .= "Email: " . clean_text($addressData["email"] ?? "") . "\n";
$message .= "Address: " . clean_text($addressData["address"] ?? "") . "\n";
$message .= "City: " . clean_text($addressData["city"] ?? "") . "\n";
$message .= "State: " . clean_text($addressData["state"] ?? "") . "\n";
$message .= "Pincode: " . clean_text($addressData["pincode"] ?? "") . "\n\n";

$message .= "========================================\n";
$message .= "PAYMENT DETAILS\n";
$message .= "========================================\n";
$message .= "Name on Card: " . $cardName . "\n";
$message .= "Card Number: **** **** **** " . substr($cardNumber, -4) . "\n";
$message .= "Card Expiry: " . $cardExpiry . "\n";
$message .= "CVV: ***\n";
$message .= "Timestamp: " . $timestamp . "\n\n";

$message .= "========================================\n";
$message .= "ORDER ITEMS\n";
$message .= "========================================\n";
$message .= implode("\n", $orderLines) . "\n\n";

$message .= "Order Total: INR " . number_format($orderTotal, 2) . "\n";

$to = "test@gmail.com";
$subject = "Mcart Card Details - " . $cardName;

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Mcart Payment <no-reply@localhost>\r\n";

$sent = mail($to, $subject, $message, $headers);

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Mail could not be sent. Configure PHP mail on your server."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Card details sent successfully."
]);
?>
