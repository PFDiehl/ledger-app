$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "async function saveExpense() {
    if (!expenseForm.vendor || !expenseForm.amount) return Alert.alert('Error', 'Fill in vendor and amount');
    try {
      const method = editingExpense ? 'PATCH' : 'POST';",
    "async function saveExpense() {
    if (!expenseForm.vendor || !expenseForm.amount) return Alert.alert('Error', 'Fill in vendor and amount');
    const receiptToUpload = pendingReceiptBase64.current;
    try {
      const method = editingExpense ? 'PATCH' : 'POST';"
)
$content = $content.Replace(
    "if (pendingReceiptBase64.current && j.data && j.data.id) {
          try {
            await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:pendingReceiptBase64.current,mediaType:'image/jpeg'}) });
          } catch(e) {}
        }",
    "if (receiptToUpload && j.data && j.data.id) {
          try {
            await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:receiptToUpload,mediaType:'image/jpeg'}) });
          } catch(e) {}
        }"
)
Set-Content $file $content
Write-Host "Done"