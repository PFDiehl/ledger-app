$file = "app/(tabs)/index.tsx"
$lines = Get-Content $file
$out = @()
$i = 0
while ($i -lt $lines.Count) {
    # Fix the broken expenseForm line and remove the duplicate invoiceForm
    if ($lines[$i] -match "expenseForm.*receiptNumber:''$" -and -not ($lines[$i] -match "receiptNumber:'' \};")) {
        $out += "  const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });"
        $i++
        # Skip the next line which is the duplicate invoiceForm
        if ($i -lt $lines.Count -and $lines[$i] -match "invoiceForm.*issueDate") {
            $i++
        }
    }
    # Remove the old invoiceForm without issueDate
    elseif ($lines[$i] -match "invoiceForm.*useState.*discount:''.*\}\);$" -and -not ($lines[$i] -match "issueDate")) {
        $out += "  const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'' });"
        $i++
    }
    else {
        $out += $lines[$i]
        $i++
    }
}
$out | Set-Content $file
Write-Host "Done! Lines: $($out.Count)"