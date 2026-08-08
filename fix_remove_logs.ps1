$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "console.log('Cloudinary direct upload:', cj.secure_url||JSON.stringify(cj.error));",
    ""
)
$content = $content.Replace(
    "} catch(ce){ console.log('Cloudinary error:', ce.message); }",
    "} catch(ce){}"
)
$content = $content.Replace(
    "const receiptToUpload = pendingReceiptBase64.current; console.log('RECEIPT TO UPLOAD:', !!receiptToUpload, 'orgId:', org?.id, 'expenseId:', j?.data?.id);",
    "const receiptToUpload = pendingReceiptBase64.current;"
)
$content = $content.Replace(
    "console.log('Receipt URL saved:', pendingReceiptUrl.current);",
    ""
)
$content = $content.Replace(
    "} catch(e) { console.log('Receipt URL save error:', e.message); }",
    "} catch(e) {}"
)
Set-Content $file $content
Write-Host "Done"