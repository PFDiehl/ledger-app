$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$old = @'
        setShowExpense(false); setEditingExpense(false);
        setExpenseForm({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });
        setPendingReceiptBase64(null);
        loadExpenses(org.id, token);
        if (pendingReceiptBase64 && j.data && j.data.id) {
          try {
            await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:pendingReceiptBase64,mediaType:'image/jpeg'}) });
          } catch(e) {}
          setPendingReceiptBase64(null);
        }
        Alert.alert('Saved!', editingExpense ? 'Expense updated' : 'Expense recorded');
'@
$new = @'
        setShowExpense(false); setEditingExpense(false);
        setExpenseForm({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });
        loadExpenses(org.id, token);
        if (pendingReceiptBase64 && j.data && j.data.id) {
          try {
            await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:pendingReceiptBase64,mediaType:'image/jpeg'}) });
          } catch(e) {}
        }
        setPendingReceiptBase64(null);
        Alert.alert('Saved!', editingExpense ? 'Expense updated' : 'Expense recorded');
'@
$content = $content.Replace($old, $new)
Set-Content $file $content
Write-Host "Done"
