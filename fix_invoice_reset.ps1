$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "setInvoiceForm({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'' });",
    "setInvoiceForm({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'' });"
)
Set-Content $file $content
Write-Host "Done"