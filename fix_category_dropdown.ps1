$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Fix expenseForm initial state - add category
$content = $content -replace "expenseForm, setExpenseForm\] = useState\(\{ vendor:'', amount:'', description:'' \}\)", "expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'' })"

# Fix billForm initial state - add category
$content = $content -replace "billForm, setBillForm\] = useState\(\{ vendor:'', amount:'', description:'' \}\)", "billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'' })"

# Add picker state variables after showReports state
$content = $content -replace "const \[showReports, setShowReports\] = useState\(false\);", "const [showReports, setShowReports] = useState(false);`n  const [showExpenseCategoryPicker, setShowExpenseCategoryPicker] = useState(false);`n  const [showBillCategoryPicker, setShowBillCategoryPicker] = useState(false);"

# Replace expense category list with dropdown button
$oldExpensePicker = "<View style={{backgroundColor:'#2D4A35',borderRadius:10,marginBottom:16,borderWidth:1,borderColor:'#3D5A45',overflow:'hidden'}}>
              {['Advertising & Marketing','Bank Charges','Equipment','Insurance','Legal & Professional Fees','Meals & Entertainment','Office Supplies','Payroll','Rent & Lease','Software & Subscriptions','Taxes & Licenses','Travel','Utilities','Vehicle','Other'].map(cat => (
                <TouchableOpacity key={cat} onPress={()=>setExpenseForm(f=>({...f,category:cat}))} style={{padding:12,backgroundColor:expenseForm.category===cat?'#3D5A45':'transparent',borderBottomWidth:0.5,borderBottomColor:'#3D5A45'}}>
                  <Text style={{color:expenseForm.category===cat?'#A8D4A8':'#fff',fontSize:14}}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>"

$newExpensePicker = "<TouchableOpacity onPress={()=>setShowExpenseCategoryPicker(true)} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:'#3D5A45',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:expenseForm.category?'#fff':'#7A9A7A',fontSize:15}}>{expenseForm.category||'Select category...'}</Text>
              <Text style={{color:'#7A9A7A',fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showExpenseCategoryPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowExpenseCategoryPicker(false)} />
              <View style={{backgroundColor:'#1E3A28',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Category</Text>
                <ScrollView>
                  {['Advertising & Marketing','Bank Charges','Equipment','Insurance','Legal & Professional Fees','Meals & Entertainment','Office Supplies','Payroll','Rent & Lease','Software & Subscriptions','Taxes & Licenses','Travel','Utilities','Vehicle','Other'].map(cat=>(
                    <TouchableOpacity key={cat} onPress={()=>{setExpenseForm(f=>({...f,category:cat}));setShowExpenseCategoryPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:'#3D5A45',backgroundColor:expenseForm.category===cat?'#3D5A45':'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:expenseForm.category===cat?'#A8D4A8':'#fff',fontSize:15}}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>"

$content = $content.Replace($oldExpensePicker, $newExpensePicker)

$content | Set-Content $file
Write-Host "Done!"