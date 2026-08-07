$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "const rr = await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:receiptToUpload,mediaType:'image/jpeg'}) }); const jj = await rr.json(); console.log('RECEIPT UPLOAD RESULT:', JSON.stringify(jj));",
    "const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(),30000); const rr = await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:receiptToUpload,mediaType:'image/jpeg'}), signal:controller.signal }); clearTimeout(timeout); const jj = await rr.json(); console.log('RECEIPT UPLOAD RESULT:', JSON.stringify(jj));"
)
Set-Content $file $content
Write-Host "Done"