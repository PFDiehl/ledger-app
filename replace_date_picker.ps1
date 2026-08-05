$file = "C:\Users\Paul\Desktop\ledger-app\app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>DATE</Text>
            <TextInput style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,color:''#fff'',fontSize:15,marginBottom:16,borderWidth:1,borderColor:''#3D5A45''}} value={expenseForm.date} onChangeText={v=>setExpenseForm(f=>({...f,date:v}))} placeholder="YYYY-MM-DD" placeholderTextColor="#7A9A7A" />'

$new = '            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>DATE</Text>
            <TouchableOpacity onPress={()=>setShowDatePicker(true)} style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:''#3D5A45'',flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
              <Text style={{color:''#fff'',fontSize:15}}>{expenseForm.date||new Date().toISOString().slice(0,10)}</Text>
              <Text style={{color:''#7A9A7A'',fontSize:12}}>📅</Text>
            </TouchableOpacity>
            {showDatePicker&&(
              <DateTimePicker value={expenseForm.date?new Date(expenseForm.date):new Date()} mode="date" display="default" onChange={(e,d)=>{setShowDatePicker(false);if(d)setExpenseForm(f=>({...f,date:d.toISOString().slice(0,10)});}}} />
            )}'

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"