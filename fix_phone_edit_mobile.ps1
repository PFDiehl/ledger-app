$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Fix customer phone formatting
$content = $content.Replace(
  "onChangeText={v=>setCustomerForm(f=>({...f,phone:v}))} placeholder='(555) 000-0000' placeholderTextColor='#7A9A7A' keyboardType='phone-pad'",
  "onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setCustomerForm(f=>({...f,phone:p}));}} placeholder='(555) 000-0000' placeholderTextColor='#7A9A7A' keyboardType='phone-pad'"
)

# Fix vendor phone formatting
$content = $content.Replace(
  "onChangeText={v=>setVendorForm(f=>({...f,phone:v}))} placeholder='(555) 000-0000' placeholderTextColor='#7A9A7A' keyboardType='phone-pad'",
  "onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setVendorForm(f=>({...f,phone:p}));}} placeholder='(555) 000-0000' placeholderTextColor='#7A9A7A' keyboardType='phone-pad'"
)

$content | Set-Content $file
Write-Host "Done!"