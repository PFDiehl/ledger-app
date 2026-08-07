$file = "app/(tabs)/index.tsx"
$lines = Get-Content $file
$out = @()
$i = 0
while ($i -lt $lines.Count) {
    # Skip the misplaced setPendingReceiptBase64(null) line at the top
    if ($lines[$i] -match "^\s+setPendingReceiptBase64\(null\);" -and $i -lt 60) {
        $i++
    } else {
        $out += $lines[$i]
        $i++
    }
}
$out | Set-Content $file
Write-Host "Done! Lines: $($out.Count)"