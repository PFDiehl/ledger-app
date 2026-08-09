$file = "app/(tabs)/index.tsx"
$lines = Get-Content $file -Encoding UTF8
$out = New-Object System.Collections.Generic.List[string]
$skip = $false
foreach ($line in $lines) {
    if ($line -match "expenseForm.*receiptNumber:''$") {
        $out.Add("  const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });")
        $skip = $true
    } elseif ($skip -and $line -match "invoiceForm.*issueDate") {
        $skip = $false
    } elseif ($line -match "invoiceForm.*useState.*discount:''.*\}\);" -and $line -notmatch "issueDate") {
        # skip old invoiceForm without issueDate
    } else {
        $out.Add($line)
    }
}
[System.IO.File]::WriteAllLines($file, $out, [System.Text.UTF8Encoding]::new($false))
Write-Host "Done! Lines: $($out.Count)"