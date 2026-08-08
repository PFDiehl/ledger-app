$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "value={billForm.amount} onChangeText={v=>setBillForm(f=>({...f,amount:v}))} placeholder=""0.00"" placeholderTextColor=""#7A9A7A"" keyboardType=""decimal-pad""",
    "value={billForm.amount?Number(billForm.amount.replace(/,/g,'')).toLocaleString('en-US'):''} onChangeText={v=>{const raw=v.replace(/,/g,'');if(!isNaN(raw)||raw==='')setBillForm(f=>({...f,amount:raw}));}} placeholder=""0.00"" placeholderTextColor=""#7A9A7A"" keyboardType=""decimal-pad"""
)
Set-Content $file $content
Write-Host "Done"