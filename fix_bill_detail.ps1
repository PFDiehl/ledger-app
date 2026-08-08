$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '            {selectedBill && (
              <View>
                <Text style={{color:''#fff'',fontSize:24,fontWeight:''700'',marginBottom:4}}>{selectedBill.vendor}</Text>
                <Text style={{color:''#7A9A7A'',fontSize:14,marginBottom:24,textTransform:''capitalize''}}>{selectedBill.status}</Text>
                <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:20,marginBottom:16}}>
                  <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                  <Text style={{color:''#fff'',fontSize:15}}>{selectedBill.description || ''No description''}</Text>
                </View>
                <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:20,marginBottom:16}}>
                  <View style={{flexDirection:''row'',justifyContent:''space-between''}}>
                    <Text style={{color:''#D4A8A8'',fontSize:16,fontWeight:''600''}}>Amount Due</Text>
                    <Text style={{color:''#D4A8A8'',fontSize:16,fontWeight:''600''}}>{fmt(selectedBill.amount)}</Text>
                  </View>
                </View>
              </View>
            )}'

$new = '            {selectedBill && (
              <View>
                <Text style={{color:''#fff'',fontSize:24,fontWeight:''700'',marginBottom:4}}>{selectedBill.vendor}</Text>
                <Text style={{color:''#7A9A7A'',fontSize:14,marginBottom:16,textTransform:''capitalize''}}>{selectedBill.category||''Bill''}</Text>
                <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:20,marginBottom:12,flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
                  <Text style={{color:''#7A9A7A'',fontSize:13}}>Amount Due</Text>
                  <Text style={{color:''#D4A8A8'',fontSize:20,fontWeight:''700''}}>{fmt(selectedBill.amount)}</Text>
                </View>
                <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12,flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
                  <Text style={{color:''#7A9A7A'',fontSize:13}}>Status</Text>
                  <Text style={{color:selectedBill.status===''paid''?''#A8D4A8'':''#ffd166'',fontSize:13,fontWeight:''600'',textTransform:''capitalize''}}>{selectedBill.status}</Text>
                </View>
                {selectedBill.dueDate ? (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12,flexDirection:''row'',justifyContent:''space-between''}}>
                    <Text style={{color:''#7A9A7A'',fontSize:13}}>Due Date</Text>
                    <Text style={{color:''#fff'',fontSize:13}}>{new Date(selectedBill.dueDate).toLocaleDateString()}</Text>
                  </View>
                ) : null}
                {selectedBill.description ? (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12}}>
                    <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                    <Text style={{color:''#fff'',fontSize:14}}>{selectedBill.description}</Text>
                  </View>
                ) : null}
              </View>
            )}'

$content = $content.Replace($old, $new)
Set-Content $file $content
Write-Host "Done"