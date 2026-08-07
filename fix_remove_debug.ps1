$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "Alert.alert('Debug', 'pending='+!!pendingReceiptBase64.current+' id='+(j.data&&j.data.id)); if (pendingReceiptBase64.current && j.data && j.data.id) {",
    "if (pendingReceiptBase64.current && j.data && j.data.id) {"
)
Set-Content $file $content
Write-Host "Done"
