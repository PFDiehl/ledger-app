$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add showVendorForm and editingVendor state
$content = $content.Replace(
  "const [vendorForm, setVendorForm] = useState({ name:'', email:'', phone:'' });",
  "const [vendorForm, setVendorForm] = useState({ name:'', email:'', phone:'' });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);"
)

# Replace vendors modal content
$old = "            <Text style={{color:'#7A9A7A',fontSize:13,marginBottom:16}}>{vendors.length} vendor{vendors.length!==1?'s':''}</Text>
            {vendors.map(v=>(
              <View key={v.id} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:12}}>
                <Text style={{color:'#fff',fontSize:16,fontWeight:'600'}}>{v.name}</Text>
                {v.email?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:4}}>{v.email}</Text>:null}
                {v.phone?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:2}}>{v.phone}</Text>:null}
              </View>
            ))}
            {vendors.length===0&&<Text style={{color:'#7A9A7A',textAlign:'center',marginTop:40}}>No vendors yet</Text>}"

$new = "            <Text style={{color:'#7A9A7A',fontSize:13,marginBottom:16}}>{vendors.length} vendor{vendors.length!==1?'s':''}</Text>
            <TouchableOpacity onPress={()=>{setVendorForm({name:'',email:'',phone:''});setEditingVendor(null);setShowVendorForm(true);}} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:14,alignItems:'center',marginBottom:16}}>
              <Text style={{color:'#A8D4A8',fontSize:15,fontWeight:'600'}}>+ Add Vendor</Text>
            </TouchableOpacity>
            {showVendorForm&&(
              <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:16}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600',marginBottom:12}}>{editingVendor?'Edit Vendor':'New Vendor'}</Text>
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>NAME *</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:10,borderWidth:1,borderColor:'#3D5A45'}} value={vendorForm.name} onChangeText={v=>setVendorForm(f=>({...f,name:v}))} placeholder='Vendor Name' placeholderTextColor='#7A9A7A' />
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>EMAIL</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:10,borderWidth:1,borderColor:'#3D5A45'}} value={vendorForm.email} onChangeText={v=>setVendorForm(f=>({...f,email:v}))} placeholder='vendor@example.com' placeholderTextColor='#7A9A7A' keyboardType='email-address' />
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>PHONE</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={vendorForm.phone} onChangeText={v=>setVendorForm(f=>({...f,phone:v}))} placeholder='(555) 000-0000' placeholderTextColor='#7A9A7A' keyboardType='phone-pad' />
                <View style={{flexDirection:'row',gap:10}}>
                  <TouchableOpacity onPress={()=>setShowVendorForm(false)} style={{flex:1,backgroundColor:'#3D5A45',borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:'#A8D4A8',fontSize:14}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={async()=>{
                    if(!vendorForm.name.trim())return Alert.alert('Error','Name is required');
                    try{
                      if(editingVendor){
                        await fetch(API+'/orgs/'+org.id+'/contacts/'+editingVendor.id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...vendorForm,type:'vendor'})});
                      }else{
                        await fetch(API+'/orgs/'+org.id+'/contacts',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...vendorForm,type:'vendor'})});
                      }
                      setShowVendorForm(false);
                      loadVendors(org.id,token);
                    }catch(e){Alert.alert('Error','Could not save vendor');}
                  }} style={{flex:2,backgroundColor:'#2D6A4F',borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:'#fff',fontSize:14,fontWeight:'600'}}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {vendors.map(v=>(
              <View key={v.id} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:12}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:'#fff',fontSize:16,fontWeight:'600'}}>{v.name}</Text>
                  <TouchableOpacity onPress={()=>{setVendorForm({name:v.name||'',email:v.email||'',phone:v.phone||''});setEditingVendor(v);setShowVendorForm(true);}}>
                    <Text style={{color:'#7A9A7A',fontSize:13}}>Edit</Text>
                  </TouchableOpacity>
                </View>
                {v.email?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:4}}>{v.email}</Text>:null}
                {v.phone?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:2}}>{v.phone}</Text>:null}
              </View>
            ))}
            {vendors.length===0&&<Text style={{color:'#7A9A7A',textAlign:'center',marginTop:40}}>No vendors yet</Text>}"

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"
