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

$orderNumber = clean_text($data["orderNumber"] ?? "");
$orderDate = clean_text($data["orderDate"] ?? "");
$deliveryDate = clean_text($data["deliveryDate"] ?? "");
$orderTotal = (float) ($data["orderTotal"] ?? 0);
$status = clean_text($data["status"] ?? "COMPLETED");
$paymentStatus = clean_text($data["paymentStatus"] ?? "PAID");
$timestamp = clean_text($data["timestamp"] ?? date("Y-m-d H:i:s"));
$addressData = $data["addressData"] ?? [];
$items = $data["items"] ?? [];

if ($orderNumber === "") {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Order number is required."
    ]);
    exit;
}

$message = "ORDER CONFIRMATION - Mcart\n\n";
$message .= "========================================\n";
$message .= "ORDER DETAILS\n";
$message .= "========================================\n\n";
$message .= "Order Number: " . $orderNumber . "\n";
$message .= "Order Date: " . $orderDate . "\n";
$message .= "Estimated Delivery: " . $deliveryDate . "\n";
$message .= "Order Status: " . $status . "\n";
$message .= "Payment Status: " . $paymentStatus . "\n";
$message .= "Order Total: INR " . number_format($orderTotal, 2) . "\n";
$message .= "Confirmation Time: " . $timestamp . "\n\n";

$message .= "========================================\n";
$message .= "CUSTOMER INFORMATION\n";
$message .= "========================================\n\n";
$message .= "Name: " . clean_text($addressData["fullName"] ?? "") . "\n";
$message .= "Phone: " . clean_text($addressData["phone"] ?? "") . "\n";
$message .= "Email: " . clean_text($addressData["email"] ?? "") . "\n";
$message .= "Address: " . clean_text($addressData["address"] ?? "") . "\n";
$message .= "City: " . clean_text($addressData["city"] ?? "") . "\n";
$message .= "State: " . clean_text($addressData["state"] ?? "") . "\n";
$message .= "Pincode: " . clean_text($addressData["pincode"] ?? "") . "\n\n";

$message .= "========================================\n";
$message .= "ORDER ITEMS\n";
$message .= "========================================\n";

if (is_array($items)) {
    foreach ($items as $item) {
        $name = clean_text($item["name"] ?? "Product");
        $qty = (int) ($item["qty"] ?? 1);
        $price = (float) ($item["price"] ?? 0);
        $lineTotal = $qty * $price;
        $message .= $name . " x " . $qty . " = INR " . number_format($lineTotal, 2) . "\n";
    }
}

$message .= "\nOrder Total: INR " . number_format($orderTotal, 2) . "\n\n";

$message .= "========================================\n";
$message .= "NEXT STEPS\n";
$message .= "========================================\n\n";
$message .= "1. You will receive a detailed invoice via email\n";
$message .= "2. Your order will be processed within 24 hours\n";
$message .= "3. You will receive tracking information once shipped\n";
$message .= "4. Expected delivery date: " . $deliveryDate . "\n\n";

$message .= "========================================\n";
$message .= "CONTACT INFORMATION\n";
$message .= "========================================\n\n";
$message .= "If you have any questions about your order, please contact us:\n";
$message .= "Email: support@mcart.com\n";
$message .= "Phone: +1-800-MCART\n\n";

$message .= "Thank you for choosing Mcart!\n";
$message .= "We appreciate your business and hope you enjoy your purchase.\n";

$to = "support@indicart.store";
$subject = "Order Confirmed - " . $orderNumber . " - Mcart";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Mcart Orders <no-reply@localhost>\r\n";

$sent = mail($to, $subject, $message, $headers);

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Order confirmation could not be sent via email."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Order confirmation sent successfully."
]);
?>
