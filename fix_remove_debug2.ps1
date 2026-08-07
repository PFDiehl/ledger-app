$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
# Remove all variations of the debug alert before the if statement
$content = $content -replace "(?:Alert\.alert\('Debug'[^;]+;\s*)+if \(pendingReceiptBase64\.current", "if (pendingReceiptBase64.current"
Set-Content $file $content
Write-Host "Done"