$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "setEditingExpense(false);setExpenseForm({vendor:'',amount:'',description:''});setShowExpense(true);",
    "setEditingExpense(false);setExpenseForm({vendor:'',amount:'',description:'',category:'',date:new Date().toISOString().slice(0,10),paymentMethod:'',receiptNumber:''});setShowExpense(true);"
)
Set-Content $file $content
Write-Host "Done"