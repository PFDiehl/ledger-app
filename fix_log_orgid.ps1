$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "const receiptToUpload = pendingReceiptBase64.current; console.log('RECEIPT TO UPLOAD:', !!receiptToUpload, receiptToUpload ? receiptToUpload.slice(0,20) : 'null');",
    "const receiptToUpload = pendingReceiptBase64.current; console.log('RECEIPT TO UPLOAD:', !!receiptToUpload, 'orgId:', org?.id, 'expenseId:', j?.data?.id);"
)
Set-Content $file $content
Write-Host "Done"