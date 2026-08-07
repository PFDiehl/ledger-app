$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:receiptToUpload,mediaType:'image/jpeg'}) });
          } catch(e) {}",
    "const rr = await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({imageBase64:receiptToUpload,mediaType:'image/jpeg'}) }); const jj = await rr.json(); console.log('RECEIPT UPLOAD RESULT:', JSON.stringify(jj));
          } catch(e) { console.log('RECEIPT UPLOAD ERROR:', e.message); }"
)
Set-Content $file $content
Write-Host "Done"