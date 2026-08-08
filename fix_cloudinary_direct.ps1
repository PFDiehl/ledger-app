$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Replace the receipt upload after save with direct Cloudinary upload during scan
$old = '                pendingReceiptBase64.current = b64;
                setExpenseForm(f=>({...f,vendor:info.vendor||f.vendor,amount:String(info.amount||f.amount),date:safeDate2,category:info.category||f.category}));
                Alert.alert(''Receipt scanned!'',''Please review the filled fields.'');'

$new = '                pendingReceiptBase64.current = b64;
                setExpenseForm(f=>({...f,vendor:info.vendor||f.vendor,amount:String(info.amount||f.amount),date:safeDate2,category:info.category||f.category}));
                try {
                  const fd = new FormData();
                  fd.append(''file'', ''data:image/jpeg;base64,''+b64);
                  fd.append(''upload_preset'', ''ledger_unsigned'');
                  fd.append(''cloud_name'', ''gxbce37f'');
                  const cr = await fetch(''https://api.cloudinary.com/v1_1/gxbce37f/image/upload'', {method:''POST'', body:fd});
                  const cj = await cr.json();
                  if (cj.secure_url) pendingReceiptUrl.current = cj.secure_url;
                  console.log(''Cloudinary direct upload:'', cj.secure_url||cj.error);
                } catch(ce){ console.log(''Cloudinary error:'', ce.message); }
                Alert.alert(''Receipt scanned!'',''Please review the filled fields.'');'

$content = $content.Replace($old, $new)

# Add pendingReceiptUrl ref next to pendingReceiptBase64 ref
$content = $content.Replace(
    'const pendingReceiptBase64 = React.useRef<string|null>(null);',
    'const pendingReceiptBase64 = React.useRef<string|null>(null);
  const pendingReceiptUrl = React.useRef<string|null>(null);'
)

# Replace the backend upload with saving the Cloudinary URL directly to the expense
$old2 = '        if (receiptToUpload && j.data && j.data.id) {
          try {
            const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(),30000); const rr = await fetch(API+''/orgs/''+org.id+''/expenses/''+j.data.id+''/receipt'', { method:''POST'', headers:{''Content-Type'':''application/json'',''Authorization'':''Bearer ''+token}, body:JSON.stringify({imageBase64:receiptToUpload,mediaType:''image/jpeg''}), signal:controller.signal }); clearTimeout(timeout); const jj = await rr.json(); console.log(''RECEIPT UPLOAD RESULT:'', JSON.stringify(jj));
          } catch(e) { console.log(''RECEIPT UPLOAD ERROR:'', e.message); }
        }'

$new2 = '        if (pendingReceiptUrl.current && j.data && j.data.id) {
          try {
            await fetch(API+''/orgs/''+org.id+''/expenses/''+j.data.id+''/receipt/url'', { method:''POST'', headers:{''Content-Type'':''application/json'',''Authorization'':''Bearer ''+token}, body:JSON.stringify({receiptUrl:pendingReceiptUrl.current}) });
            console.log(''Receipt URL saved:'', pendingReceiptUrl.current);
          } catch(e) { console.log(''Receipt URL save error:'', e.message); }
          pendingReceiptUrl.current = null;
        }'

$content = $content.Replace($old2, $new2)

Set-Content $file $content
Write-Host "Done"