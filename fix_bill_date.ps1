$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add date to billForm initial state
$content = $content.Replace(
    "const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'' });",
    "const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10) });"
)

# Add date to bill form reset after save
$content = $content.Replace(
    "setBillForm({ vendor:'', amount:'', description:'' });",
    "setBillForm({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10) });"
)

# Add date field to bill form UI after AMOUNT field
$content = $content.Replace(
    "<Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.description} onChangeText={v=>setBillForm(f=>({...f,description:v}))} placeholder=""Monthly rent"" placeholderTextColor=""#7A9A7A"" />",
    "<Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DATE</Text>
            <TouchableOpacity onPress={()=>{setBillDatePickerVisible(true);}} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}}>
              <Text style={{color:billForm.date?'#fff':'#7A9A7A',fontSize:15}}>{billForm.date ? new Date(billForm.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>
            </TouchableOpacity>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.description} onChangeText={v=>setBillForm(f=>({...f,description:v}))} placeholder=""Monthly rent"" placeholderTextColor=""#7A9A7A"" />"
)

# Add billDatePickerVisible state
$content = $content.Replace(
    "const [showBillCategoryPicker, setShowBillCategoryPicker] = useState(false);",
    "const [showBillCategoryPicker, setShowBillCategoryPicker] = useState(false);
  const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);"
)

Set-Content $file $content
Write-Host "Done"