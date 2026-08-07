$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Replace state declaration with ref
$content = $content.Replace(
    "const [pendingReceiptBase64, setPendingReceiptBase64] = React.useState<string|null>(null);",
    "const pendingReceiptBase64 = React.useRef<string|null>(null);"
)

# Replace all setPendingReceiptBase64(b64) with ref set
$content = $content.Replace(
    "setPendingReceiptBase64(b64);",
    "pendingReceiptBase64.current = b64;"
)

# Replace all setPendingReceiptBase64(null) with ref clear
$content = $content.Replace(
    "setPendingReceiptBase64(null);",
    "pendingReceiptBase64.current = null;"
)

# Replace all pendingReceiptBase64 checks with .current
$content = $content.Replace(
    "if (pendingReceiptBase64 && j.data && j.data.id)",
    "if (pendingReceiptBase64.current && j.data && j.data.id)"
)

$content = $content.Replace(
    "body:JSON.stringify({imageBase64:pendingReceiptBase64,mediaType:'image/jpeg'})",
    "body:JSON.stringify({imageBase64:pendingReceiptBase64.current,mediaType:'image/jpeg'})"
)

Set-Content $file $content
Write-Host "Done"