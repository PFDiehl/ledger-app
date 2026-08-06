$file = "app/(tabs)/index.tsx"
$lines = Get-Content $file
$out = @()
$i = 0
while ($i -lt $lines.Count) {
    if ($lines[$i] -match "api.anthropic.com/v1/messages") {
        $out += "                const r=await fetch(API+'/orgs/'+org.id+'/receipts/scan',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({imageBase64:b64,mediaType:'image/jpeg'})});"
        $i++
    } elseif ($lines[$i] -match "const j=await r.json\(\);") {
        $out += $lines[$i]
        $i++
        if ($i -lt $lines.Count -and $lines[$i] -match "JSON.parse\(j.content") {
            $out += "                if(!j.success)throw new Error(j.message);"
            $out += "                const info=j.data;"
            $i++
        }
    } else {
        $out += $lines[$i]
        $i++
    }
}
$out | Set-Content $file
Write-Host "Done! Lines: $($out.Count)"