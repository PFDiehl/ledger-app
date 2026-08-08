$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "setBillForm({ vendor: bill.vendor||'', amount: String(bill.amount)||'', description: bill.description||'' });",
    "setBillForm({ vendor: bill.vendor||'', amount: String(bill.amount)||'', description: bill.description||'', category: bill.category||'', dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10) });"
)
Set-Content $file $content
Write-Host "Done"