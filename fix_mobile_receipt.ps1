$file = "app/(tabs)/index.tsx"
$lines = Get-Content $file
$out = @()
$i = 0
while ($i -lt $lines.Count) {
    # Add pendingReceiptBase64 state after scanningReceipt state
    if ($lines[$i] -match "setScanningReceipt.*useState") {
        $out += $lines[$i]
        $out += "  const [pendingReceiptBase64, setPendingReceiptBase64] = React.useState<string|null>(null);"
        $i++
    }
    # After scan succeeds, store the base64
    elseif ($lines[$i] -match "setExpenseForm.*vendor.*info\.vendor") {
        $out += $lines[$i]
        $out += "                setPendingReceiptBase64(b64);"
        $i++
    }
    # After saveExpense succeeds, upload receipt if pending
    elseif ($lines[$i] -match "Alert\.alert\('Saved!', editingExpense") {
        $out += "        if (pendingReceiptBase64 && j.data && j.data.id) {"
        $out += "          try {"
        $out += "            await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:pendingReceiptBase64,mediaType:'image/jpeg'}) });"
        $out += "          } catch(e) {}"
        $out += "          setPendingReceiptBase64(null);"
        $out += "        }"
        $out += $lines[$i]
        $i++
    }
    # Clear pending receipt when form is reset
    elseif ($lines[$i] -match "setExpenseForm.*vendor.*amount.*description.*category.*date.*paymentMethod.*receiptNumber") {
        $out += $lines[$i]
        $out += "        setPendingReceiptBase64(null);"
        $i++
    }
    else {
        $out += $lines[$i]
        $i++
    }
}
$out | Set-Content $file
Write-Host "Done! Lines: $($out.Count)"