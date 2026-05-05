<?php
/**
 * Master Lead Solutions — Contact Form Handler
 * Reads config from parent directory (outside public_html for security).
 */

header('Content-Type: application/json; charset=UTF-8');

// Only accept AJAX POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bad request.']);
    exit;
}

// Load config from server root (one level above public_html)
$config_path = dirname(__DIR__) . '/config.php';
if (!file_exists($config_path)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server configuration error.']);
    exit;
}
require $config_path;

// Sanitize & validate inputs
function clean(string $val): string {
    return htmlspecialchars(trim(strip_tags($val)), ENT_QUOTES, 'UTF-8');
}

// Strip newlines from anything that goes into email headers to prevent injection
function clean_header(string $val): string {
    return preg_replace('/[\r\n\t]/', ' ', clean($val));
}

$name     = clean_header($_POST['name']  ?? '');
$phone    = clean_header($_POST['phone'] ?? '');
$email    = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$property = clean($_POST['property'] ?? '');
$service  = clean_header($_POST['service']  ?? '');
$message  = clean($_POST['message']  ?? '');

// Required field validation
if (!$name || !$phone || !$email || !$service) {
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

// Basic length guards
if (strlen($name) > 120 || strlen($phone) > 30 || strlen($service) > 80 || strlen($message) > 2000) {
    echo json_encode(['success' => false, 'message' => 'One or more fields exceed the allowed length.']);
    exit;
}

// Build email body
$subject = MLS_SITE_NAME . ': New Inquiry — ' . $service;

$body  = "New contact form submission from " . MLS_SITE_NAME . "\n";
$body .= str_repeat('-', 50) . "\n\n";
$body .= "Name:             {$name}\n";
$body .= "Phone:            {$phone}\n";
$body .= "Email:            {$email}\n";
$body .= "Property Address: " . ($property ?: 'Not provided') . "\n";
$body .= "Service Needed:   {$service}\n\n";
$body .= "Message:\n{$message}\n\n";
$body .= str_repeat('-', 50) . "\n";
$body .= "Submitted: " . date('Y-m-d H:i:s T') . "\n";

$headers  = "From: " . MLS_SENDER_NAME . " <" . MLS_SENDER_EMAIL . ">\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail(MLS_RECIPIENT_EMAIL, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email. Please call us directly at (845) 760-9555.']);
}
