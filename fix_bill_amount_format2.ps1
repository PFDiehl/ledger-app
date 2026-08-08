$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "value={billForm.amount?Number(billForm.amount.replace(/,/g,'')).toLocaleString('en-US'):''} onChangeText={v=>{const raw=v.replace(/,/g,'');if(!isNaN(raw)||raw==='')setBillForm(f=>({...f,amount:raw}));}}",
    "value={billForm.amount?(()=>{const parts=billForm.amount.split('.');const intPart=Number(parts[0].replace(/,/g,'')||0).toLocaleString('en-US');return parts.length>1?intPart+'.'+parts[1]:intPart;})():''} onChangeText={v=>{const raw=v.replace(/,/g,'');if(raw===''||/^\d*\.?\d*$/.test(raw))setBillForm(f=>({...f,amount:raw}));}}"
)
Set-Content $file $content
Write-Host "Done"