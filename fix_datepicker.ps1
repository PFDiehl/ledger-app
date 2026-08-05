$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = 'onChange={(e,d)=>{setShowDatePicker(false);if(d)setExpenseForm(f=>({...f,date:d.toISOString().slice(0,10)});}} />'

$new = 'onChange={(e,d)=>{setShowDatePicker(false);if(d){setExpenseForm(f=>({...f,date:d.toISOString().slice(0,10)}));}}} />'

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"