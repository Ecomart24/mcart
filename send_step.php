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
    // Prevent header injection and keep output readable.
    return str_replace(["\r", "\n"], " ", $text);
}

function pick($data, $path, $fallback = "") {
    // Supports simple "a.b.c" paths for nested arrays.
    $value = $data;
    foreach (explode(".", $path) as $key) {
        if (!is_array($value) || !array_key_exists($key, $value)) {
            return $fallback;
        }
        $value = $value[$key];
    }
    return $value;
}

$stepRaw = $data["step"] ?? 0;
$step = (int) $stepRaw;
if ($step < 1 || $step > 3) {
    $step = 0;
}

$addressData = is_array($data["addressData"] ?? null) ? $data["addressData"] : [];
$customerData = is_array($data["customerData"] ?? null) ? $data["customerData"] : [];

$firstName = clean_text($data["firstName"] ?? pick($customerData, "firstName", ""));
$lastName = clean_text($data["lastName"] ?? pick($customerData, "lastName", ""));
$fullName = clean_text(
    $data["fullName"]
        ?? pick($customerData, "fullName", "")
        ?? pick($addressData, "fullName", "")
);
if ($fullName === "") {
    $fullName = trim($firstName . " " . $lastName);
}

$email = clean_text(
    $data["email"]
        ?? pick($customerData, "email", "")
        ?? pick($addressData, "email", "")
);
$phone = clean_text(
    $data["phone"]
        ?? pick($customerData, "phone", "")
        ?? pick($addressData, "phone", "")
);
$phoneLast6 = clean_text($data["phoneLast6"] ?? pick($customerData, "phoneLast6", ""));
$instructions = clean_text($data["instructions"] ?? pick($customerData, "instructions", ""));

$address = clean_text($data["address"] ?? pick($addressData, "address", ""));
$city = clean_text($data["city"] ?? pick($addressData, "city", ""));
$state = clean_text($data["state"] ?? pick($addressData, "state", ""));
$pincode = clean_text($data["pincode"] ?? pick($addressData, "pincode", ""));

$timestamp = clean_text($data["placedAt"] ?? ($data["timestamp"] ?? date("Y-m-d H:i:s")));

// Order lines (optional at step 1/2).
$items = $data["cartItems"] ?? ($data["items"] ?? []);
$orderTotal = (float) ($data["orderTotal"] ?? ($data["total"] ?? 0));

if ($step === 0) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Invalid step."
    ]);
    exit;
}

if ($step === 1 && $address === "") {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Address is required for step 1."
    ]);
    exit;
}

if ($step === 2 && ($email === "" || $phone === "")) {
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "Email and phone are required for step 2."
    ]);
    exit;
}

if ($step === 3 && $phoneLast6 === "") {
    // Step 3 is demo, but still useful to include the code.
    http_response_code(422);
    echo json_encode([
        "success" => false,
        "message" => "6-digit phone code is required for step 3."
    ]);
    exit;
}

$stepTitle = $step === 1 ? "Step 1 (Address)" : ($step === 2 ? "Step 2 (Details)" : "Step 3 (Confirm)");

// Email subject: keep step 3 as a full order email subject.
$subject = $step === 3
    ? ("New Mcart Order - " . ($fullName !== "" ? $fullName : "Customer"))
    : ("Mcart " . $stepTitle . " Submitted - " . ($fullName !== "" ? $fullName : "Customer"));

$message = "MCART - " . strtoupper($stepTitle) . "\n\n";
$message .= "Placed At: " . $timestamp . "\n\n";

$message .= "Customer\n";
$message .= "Name: " . ($fullName !== "" ? $fullName : "-") . "\n";
$message .= "Phone: " . ($phone !== "" ? $phone : "-") . "\n";
$message .= "Email: " . ($email !== "" ? $email : "Not provided") . "\n";
if ($phoneLast6 !== "") {
    $message .= "Phone Code (6 digits): " . $phoneLast6 . "\n";
}
if ($instructions !== "") {
    $message .= "Order Instructions: " . $instructions . "\n";
}
$message .= "\n";

$message .= "Delivery Address\n";
$message .= "Address: " . ($address !== "" ? $address : "-") . "\n";
$message .= "City: " . ($city !== "" ? $city : "-") . "\n";
$message .= "State: " . ($state !== "" ? $state : "-") . "\n";
$message .= "Pincode: " . ($pincode !== "" ? $pincode : "-") . "\n\n";

if (is_array($items) && count($items) > 0) {
    $orderLines = [];
    foreach ($items as $item) {
        $name = clean_text($item["name"] ?? "Product");
        $qty = (int) ($item["qty"] ?? 1);
        $price = (float) ($item["price"] ?? 0);
        $lineTotal = $qty * $price;
        $orderLines[] = $name . " x " . $qty . " = INR " . number_format($lineTotal, 2);
    }

    $message .= "Order Items\n";
    $message .= implode("\n", $orderLines) . "\n\n";
    $message .= "Order Total: INR " . number_format($orderTotal, 2) . "\n";
}

$to = "akrasd25@gmail.com";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
if ($email !== "" && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= "From: " . ($fullName !== "" ? $fullName : "Mcart Customer") . " <" . $email . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
} else {
    $headers .= "From: Mcart Order <no-reply@localhost>\r\n";
}

$sent = mail($to, $subject, $message, $headers);

if (!$sent) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Mail could not be sent. Configure PHP mail/SMTP on your server."
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "message" => "Step email sent."
]);

