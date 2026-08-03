$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$oldBillPicker = "            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CATEGORY</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.amount} onChangeText={v=>setBillForm(f=>({...f,amount:v}))} placeholder=""0.00"" placeholderTextColor=""#7A9A7A"" keyboardType=""decimal-pad"" />"

$newBillPicker = "            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CATEGORY</Text>
            <TouchableOpacity onPress={()=>setShowBillCategoryPicker(true)} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:'#3D5A45',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:billForm.category?'#fff':'#7A9A7A',fontSize:15}}>{billForm.category||'Select category...'}</Text>
              <Text style={{color:'#7A9A7A',fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showBillCategoryPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowBillCategoryPicker(false)} />
              <View style={{backgroundColor:'#1E3A28',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Category</Text>
                <ScrollView>
                  {['Rent & Lease','Utilities','Insurance','Loan Payment','Supplier Invoice','Equipment Lease','Professional Services','Payroll','Taxes','Software & Subscriptions','Other'].map(cat=>(
                    <TouchableOpacity key={cat} onPress={()=>{setBillForm(f=>({...f,category:cat}));setShowBillCategoryPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:'#3D5A45',backgroundColor:billForm.category===cat?'#3D5A45':'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:billForm.category===cat?'#A8D4A8':'#fff',fontSize:15}}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>AMOUNT ($)</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.amount} onChangeText={v=>setBillForm(f=>({...f,amount:v}))} placeholder=""0.00"" placeholderTextColor=""#7A9A7A"" keyboardType=""decimal-pad"" />"

$content.Replace($oldBillPicker, $newBillPicker) | Set-Content $file
Write-Host "Done!"