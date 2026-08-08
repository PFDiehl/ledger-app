$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "setEditingBill(false);setBillForm({vendor:'',amount:'',description:''});setShowBill(true);",
    "setEditingBill(false);setBillForm({vendor:'',amount:'',description:'',category:'',dueDate:new Date().toISOString().slice(0,10)});setShowBill(true);"
)
Set-Content $file $content
Write-Host "Done"