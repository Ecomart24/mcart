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

$firstName = clean_text($data["firstName"] ?? ($data["customerData"]["firstName"] ?? ""));
$lastName = clean_text($data["lastName"] ?? ($data["customerData"]["lastName"] ?? ""));
$fullName = clean_text($data["fullName"] ?? ($data["customerData"]["fullName"] ?? ""));
if ($fullName === "") {
    $fullName = trim($firstName . " " . $lastName);
}
$phone = clean_text($data["phone"] ?? "");
$email = clean_text($data["email"] ?? "");
$instructions = clean_text($data["instructions"] ?? ($data["customerData"]["instructions"] ?? ""));
$address = clean_text($data["address"] ?? ($data["addressData"]["address"] ?? ""));
$city = clean_text($data["city"] ?? ($data["addressData"]["city"] ?? ""));
$state = clean_text($data["state"] ?? ($data["addressData"]["state"] ?? ""));
$pincode = clean_text($data["pincode"] ?? ($data["addressData"]["pincode"] ?? ""));
$placedAt = clean_text($data["placedAt"] ?? date("Y-m-d H:i:s"));
$cartItems = $data["cartItems"] ?? ($data["items"] ?? []);
$orderTotal = (float) ($data["orderTotal"] ?? ($data["total"] ?? 0));

if ($fullName === "" || $phone === "" || $address === "") {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Name, phone and address are required."
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

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $email = "";
}

$orderLines = [];
foreach ($cartItems as $item) {
    $name = clean_text($item["name"] ?? "Product");
    $qty = (int) ($item["qty"] ?? 1);
    $price = (float) ($item["price"] ?? 0);
    $lineTotal = $qty * $price;
    $orderLines[] = $name . " x " . $qty . " = INR " . number_format($lineTotal, 2);
}

$message = "New order received from Mcart website\n\n";
$message .= "Customer Name: " . $fullName . "\n";
$message .= "Phone: " . $phone . "\n";
$message .= "Email: " . ($email !== "" ? $email : "Not provided") . "\n";
$message .= "Address: " . $address . "\n";
$message .= "City: " . ($city !== "" ? $city : "-") . "\n";
$message .= "State: " . ($state !== "" ? $state : "-") . "\n";
$message .= "Pincode: " . ($pincode !== "" ? $pincode : "-") . "\n";
$message .= "Order Instructions: " . ($instructions !== "" ? $instructions : "-") . "\n";
$message .= "Placed At: " . $placedAt . "\n\n";
$message .= "Order Items:\n";
$message .= implode("\n", $orderLines) . "\n\n";
$message .= "Order Total: INR " . number_format($orderTotal, 2) . "\n";

$to = "akrasd25@gmail.com";
$subject = "New Mcart Order - " . $fullName;

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
if ($email !== "") {
    $headers .= "From: " . $fullName . " <" . $email . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
} else {
    $headers .= "From: Mcart Order <no-reply@localhost>\r\n";
}

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
    "message" => "Order sent successfully."
]);
