$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '            <Text style={{color:''#7A9A7A'',fontSize:13,marginBottom:16}}>{customers.length} customer{customers.length!==1?''s'':''''}</Text>
            {customers.map(c=>(
              <View key={c.id} style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12}}>
                <Text style={{color:''#fff'',fontSize:16,fontWeight:''600''}}>{c.name}</Text>
                {c.email?<Text style={{color:''#7A9A7A'',fontSize:13,marginTop:4}}>{c.email}</Text>:null}
                {c.phone?<Text style={{color:''#7A9A7A'',fontSize:13,marginTop:2}}>{c.phone}</Text>:null}
                {c.salesperson?<Text style={{color:''#7A9A7A'',fontSize:12,marginTop:4}}>Rep: {c.salesperson}</Text>:null}
              </View>
            ))}
            {customers.length===0&&<Text style={{color:''#7A9A7A'',textAlign:''center'',marginTop:40}}>No customers yet</Text>}'

$new = '            <Text style={{color:''#7A9A7A'',fontSize:13,marginBottom:16}}>{customers.length} customer{customers.length!==1?''s'':''''}</Text>
            <TouchableOpacity onPress={()=>{setCustomerForm({name:'''',email:'''',phone:'''',salesperson:''''});setEditingCustomer(null);setShowCustomerForm(true);}} style={{backgroundColor:''#3D5A45'',borderRadius:12,padding:14,alignItems:''center'',marginBottom:16}}>
              <Text style={{color:''#A8D4A8'',fontSize:15,fontWeight:''600''}}>+ Add Customer</Text>
            </TouchableOpacity>
            {showCustomerForm&&(
              <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:16}}>
                <Text style={{color:''#A8D4A8'',fontSize:16,fontWeight:''600'',marginBottom:12}}>{editingCustomer?''Edit Customer'':''New Customer''}</Text>
                <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>NAME *</Text>
                <TextInput style={{backgroundColor:''#1C2E1C'',borderRadius:8,padding:12,color:''#fff'',fontSize:15,marginBottom:10,borderWidth:1,borderColor:''#3D5A45''}} value={customerForm.name} onChangeText={v=>setCustomerForm(f=>({...f,name:v}))} placeholder=''Acme Corp'' placeholderTextColor=''#7A9A7A'' />
                <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>EMAIL</Text>
                <TextInput style={{backgroundColor:''#1C2E1C'',borderRadius:8,padding:12,color:''#fff'',fontSize:15,marginBottom:10,borderWidth:1,borderColor:''#3D5A45''}} value={customerForm.email} onChangeText={v=>setCustomerForm(f=>({...f,email:v}))} placeholder=''billing@acme.com'' placeholderTextColor=''#7A9A7A'' keyboardType=''email-address'' />
                <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>PHONE</Text>
                <TextInput style={{backgroundColor:''#1C2E1C'',borderRadius:8,padding:12,color:''#fff'',fontSize:15,marginBottom:10,borderWidth:1,borderColor:''#3D5A45''}} value={customerForm.phone} onChangeText={v=>setCustomerForm(f=>({...f,phone:v}))} placeholder=''(555) 000-0000'' placeholderTextColor=''#7A9A7A'' keyboardType=''phone-pad'' />
                <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>SALESPERSON</Text>
                <TextInput style={{backgroundColor:''#1C2E1C'',borderRadius:8,padding:12,color:''#fff'',fontSize:15,marginBottom:16,borderWidth:1,borderColor:''#3D5A45''}} value={customerForm.salesperson} onChangeText={v=>setCustomerForm(f=>({...f,salesperson:v}))} placeholder=''Jane Smith'' placeholderTextColor=''#7A9A7A'' />
                <View style={{flexDirection:''row'',gap:10}}>
                  <TouchableOpacity onPress={()=>setShowCustomerForm(false)} style={{flex:1,backgroundColor:''#3D5A45'',borderRadius:10,padding:12,alignItems:''center''}}>
                    <Text style={{color:''#A8D4A8'',fontSize:14}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={async()=>{
                    if(!customerForm.name.trim())return Alert.alert(''Error'',''Name is required'');
                    try{
                      if(editingCustomer){
                        await fetch(API+''/orgs/''+org.id+''/contacts/''+editingCustomer.id,{method:''PATCH'',headers:{''Content-Type'':''application/json'',Authorization:''Bearer ''+token},body:JSON.stringify({...customerForm,type:''customer''})});
                      }else{
                        await fetch(API+''/orgs/''+org.id+''/contacts'',{method:''POST'',headers:{''Content-Type'':''application/json'',Authorization:''Bearer ''+token},body:JSON.stringify({...customerForm,type:''customer''})});
                      }
                      setShowCustomerForm(false);
                      loadCustomers(org.id,token);
                    }catch(e){Alert.alert(''Error'',''Could not save customer'');}
                  }} style={{flex:2,backgroundColor:''#2D6A4F'',borderRadius:10,padding:12,alignItems:''center''}}>
                    <Text style={{color:''#fff'',fontSize:14,fontWeight:''600''}}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {customers.map(c=>(
              <View key={c.id} style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12}}>
                <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
                  <Text style={{color:''#fff'',fontSize:16,fontWeight:''600''}}>{c.name}</Text>
                  <TouchableOpacity onPress={()=>{setCustomerForm({name:c.name||'''',email:c.email||'''',phone:c.phone||'''',salesperson:c.salesperson||''''});setEditingCustomer(c);setShowCustomerForm(true);}}>
                    <Text style={{color:''#7A9A7A'',fontSize:13}}>Edit</Text>
                  </TouchableOpacity>
                </View>
                {c.email?<Text style={{color:''#7A9A7A'',fontSize:13,marginTop:4}}>{c.email}</Text>:null}
                {c.phone?<Text style={{color:''#7A9A7A'',fontSize:13,marginTop:2}}>{c.phone}</Text>:null}
                {c.salesperson?<Text style={{color:''#7A9A7A'',fontSize:12,marginTop:4}}>Rep: {c.salesperson}</Text>:null}
              </View>
            ))}
            {customers.length===0&&<Text style={{color:''#7A9A7A'',textAlign:''center'',marginTop:40}}>No customers yet</Text>}'

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"
