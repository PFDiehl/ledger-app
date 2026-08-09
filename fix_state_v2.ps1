$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Fix the broken expenseForm + duplicate invoiceForm
$content = $content -replace "const \[expenseForm.*?receiptNumber:''[\r\n]+const \[invoiceForm[^\r\n]+[\r\n]", "const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });`r`n  const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'' });`r`n"

Set-Content $file $content
Write-Host "Done"