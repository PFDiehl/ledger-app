$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = "    </ScrollView>
  );
}"

$new = "      {/* Customers Modal */}
      <Modal visible={showCustomers} animationType=""slide"" presentationStyle=""pageSheet"">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>Customers</Text>
              <TouchableOpacity onPress={()=>setShowCustomers(false)}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:13,marginBottom:16}}>{customers.length} customer{customers.length!==1?'s':''}</Text>
            {customers.map(c=>(
              <View key={c.id} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:12}}>
                <Text style={{color:'#fff',fontSize:16,fontWeight:'600'}}>{c.name}</Text>
                {c.email?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:4}}>{c.email}</Text>:null}
                {c.phone?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:2}}>{c.phone}</Text>:null}
                {c.salesperson?<Text style={{color:'#7A9A7A',fontSize:12,marginTop:4}}>Rep: {c.salesperson}</Text>:null}
              </View>
            ))}
            {customers.length===0&&<Text style={{color:'#7A9A7A',textAlign:'center',marginTop:40}}>No customers yet</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Vendors Modal */}
      <Modal visible={showVendors} animationType=""slide"" presentationStyle=""pageSheet"">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>Vendors</Text>
              <TouchableOpacity onPress={()=>setShowVendors(false)}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:13,marginBottom:16}}>{vendors.length} vendor{vendors.length!==1?'s':''}</Text>
            {vendors.map(v=>(
              <View key={v.id} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:12}}>
                <Text style={{color:'#fff',fontSize:16,fontWeight:'600'}}>{v.name}</Text>
                {v.email?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:4}}>{v.email}</Text>:null}
                {v.phone?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:2}}>{v.phone}</Text>:null}
              </View>
            ))}
            {vendors.length===0&&<Text style={{color:'#7A9A7A',textAlign:'center',marginTop:40}}>No vendors yet</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}"

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"