$file = "app/(tabs)/index.tsx"
$lines = Get-Content $file
$out = @()
$i = 0
while ($i -lt $lines.Count) {
    if ($lines[$i] -match 'CATEGORY' -and $lines[$i+1] -match 'expenseForm\.amount') {
        $out += $lines[$i]
        $out += "            <View style={{backgroundColor:'#2D4A35',borderRadius:10,marginBottom:16,borderWidth:1,borderColor:'#3D5A45',overflow:'hidden'}}>"
        $out += "              {['Advertising & Marketing','Bank Charges','Equipment','Insurance','Legal & Professional Fees','Meals & Entertainment','Office Supplies','Payroll','Rent & Lease','Software & Subscriptions','Taxes & Licenses','Travel','Utilities','Vehicle','Other'].map(cat => ("
        $out += "                <TouchableOpacity key={cat} onPress={()=>setExpenseForm(f=>({...f,category:cat}))} style={{padding:12,backgroundColor:expenseForm.category===cat?'#3D5A45':'transparent',borderBottomWidth:0.5,borderBottomColor:'#3D5A45'}}>"
        $out += "                  <Text style={{color:expenseForm.category===cat?'#A8D4A8':'#fff',fontSize:14}}>{cat}</Text>"
        $out += "                </TouchableOpacity>"
        $out += "              ))}"
        $out += "            </View>"
        $out += "            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>AMOUNT (`$)</Text>"
        $out += $lines[$i+1]
        $i += 2
    } else {
        $out += $lines[$i]
        $i++
    }
}
$out | Set-Content $file
Write-Host "Done! Lines processed: $($out.Count)"