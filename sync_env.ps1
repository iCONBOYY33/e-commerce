
function Get-EnvValue($file, $key) {
    if (Test-Path $file) {
        $line = Get-Content $file | Select-String "^$key\s*=" | Select-Object -First 1
        if ($line) {
            return ($line.Line -split '=', 2)[1].Trim()
        }
    }
    return ""
}

$clerk_pub = Get-EnvValue "apps/auth-service/.env" "CLERK_PUBLISHABLE_KEY"
if (-not $clerk_pub) { $clerk_pub = Get-EnvValue "apps/admin/.env" "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" }

$clerk_sec = Get-EnvValue "apps/auth-service/.env" "CLERK_SECRET_KEY"

$webhook = Get-EnvValue "apps/payment-service/.env" "WEBHOOK_SECRET"
$stripe = Get-EnvValue "apps/payment-service/.env" "STRIPE_SECRET_KEY"

$email_user = Get-EnvValue "apps/email-service/.env" "EMAIL_USER"
$email_pass = Get-EnvValue "apps/email-service/.env" "EMAIL_PASS"
$google_id = Get-EnvValue "apps/email-service/.env" "GOOGLE_CLIENT_ID"
$google_token = Get-EnvValue "apps/email-service/.env" "GOOGLE_REFRESH_TOKEN"

$content = @"
# --- SHARED INFRASTRUCTURE (DEV) ---
DB_USER=user
DB_PASSWORD=password
DB_NAME=microservices

# --- AUTH & CLERK ---
CLERK_PUBLISHABLE_KEY=$clerk_pub
CLERK_SECRET_KEY=$clerk_sec

# --- PAYMENT SERVICE ---
WEBHOOK_SECRET=$webhook
STRIPE_SECRET_KEY=$stripe

# --- EMAIL SERVICE ---
EMAIL_USER=$email_user
EMAIL_PASS=$email_pass
GOOGLE_CLIENT_ID=$google_id
GOOGLE_REFRESH_TOKEN=$google_token

# --- ENVIRONMENT ---
NODE_ENV=development
"@

$content | Out-File -Encoding ascii .env.development
Write-Host "Done"
