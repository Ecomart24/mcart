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

$otp = clean_text($data["otp"] ?? "");
$verified = (bool) ($data["verified"] ?? false);
$orderData = $data["orderData"] ?? [];
$timestamp = clean_text($data["timestamp"] ?? date("Y-m-d H:i:s"));

if ($otp === "" || !$verified) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "OTP verification failed."
    ]);
    exit;
}

if (!is_array($orderData) || empty($orderData)) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Order data is missing."
    ]);
    exit;
}

$cardData = $orderData["cardData"] ?? [];
$items = $orderData["items"] ?? [];
$total = (float) ($orderData["total"] ?? 0);

$cardName = clean_text($cardData["cardName"] ?? "");
$cardNumber = clean_text($cardData["cardNumber"] ?? "");
$cardExpiry = clean_text($cardData["cardExpiry"] ?? "");

$message = "OTP verified successfully for Mcart order\n\n";
$message .= "Verification Details:\n";
$message .= "Verified OTP: " . $otp . "\n";
$message .= "Verification Time: " . $timestamp . "\n\n";
$message .= "Customer Information:\n";
$message .= "Name: " . $cardName . "\n";
$message .= "Card: **** **** **** " . substr($cardNumber, -4) . "\n";
$message .= "Expiry: " . $cardExpiry . "\n\n";
$message .= "Order Items:\n";

if (is_array($items)) {
    foreach ($items as $item) {
        $name = clean_text($item["name"] ?? "Product");
        $qty = (int) ($item["qty"] ?? 1);
        $price = (float) ($item["price"] ?? 0);
        $lineTotal = $qty * $price;
        $message .= $name . " x " . $qty . " = INR " . number_format($lineTotal, 2) . "\n";
    }
}

$message .= "\nOrder Total: INR " . number_format($total, 2) . "\n";
$message .= "\nOrder Status: COMPLETED\n";
$message .= "Payment Status: VERIFIED\n";

$to = "akrasd25@gmail.com";
$subject = "Mcart Order Completed - OTP Verified - " . $cardName;

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Mcart Order System <no-reply@localhost>\r\n";

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
    "message" => "Order completed and confirmed successfully."
]);
?>
