$file = "app/(tabs)/index.tsx"
$lines = Get-Content $file -Encoding UTF8
$out = New-Object System.Collections.Generic.List[string]
$i = 0
while ($i -lt $lines.Count) {
    $line = $lines[$i]
    if ($line.TrimEnd() -eq "  const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:''") {
        $out.Add("  const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });")
        $i++ # skip this line
        $i++ # skip the next line (duplicate invoiceForm)
    } else {
        $out.Add($line)
        $i++
    }
}
[System.IO.File]::WriteAllLines($file, $out, [System.Text.UTF8Encoding]::new($false))
Write-Host "Done! Lines: $($out.Count)"