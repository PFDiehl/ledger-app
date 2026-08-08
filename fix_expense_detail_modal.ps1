$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '      {/* Expense Detail Modal */}
      <Modal visible={showExpenseDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:''#1C2E1C''}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center'',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowExpenseDetail(false)}>
                <Text style={{color:''#A8D4A8'',fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:''row'',gap:12}}>
                <TouchableOpacity onPress={()=>editExpense(selectedExpense)} style={{backgroundColor:''#2D4A35'',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:''#A8D4A8'',fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteExpense(selectedExpense.id)} style={{backgroundColor:''#4a1a1a'',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:''#D4A8A8'',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedExpense && (
              <View>
                <Text style={{color:''#fff'',fontSize:24,fontWeight:''700'',marginBottom:4}}>{selectedExpense.vendor}</Text>
                <Text style={{color:''#7A9A7A'',fontSize:14,marginBottom:24,textTransform:''capitalize''}}>{selectedExpense.category}</Text>
                <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:20,marginBottom:16}}>
                  <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                  <Text style={{color:''#fff'',fontSize:15}}>{selectedExpense.description || ''No description''}</Text>
                </View>
                <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:20,marginBottom:16}}>
                  <View style={{flexDirection:''row'',justifyContent:''space-between''}}>
                    <Text style={{color:''#A8D4A8'',fontSize:16,fontWeight:''600''}}>Amount</Text>
                    <Text style={{color:''#A8D4A8'',fontSize:16,fontWeight:''600''}}>{fmt(selectedExpense.amount)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>'

$new = '      {/* Expense Detail Modal */}
      <Modal visible={showExpenseDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:''#1C2E1C''}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center'',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowExpenseDetail(false)}>
                <Text style={{color:''#A8D4A8'',fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:''row'',gap:12}}>
                <TouchableOpacity onPress={()=>editExpense(selectedExpense)} style={{backgroundColor:''#2D4A35'',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:''#A8D4A8'',fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteExpense(selectedExpense.id)} style={{backgroundColor:''#4a1a1a'',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:''#D4A8A8'',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedExpense && (
              <View>
                <Text style={{color:''#fff'',fontSize:24,fontWeight:''700'',marginBottom:4}}>{selectedExpense.vendor}</Text>
                <Text style={{color:''#7A9A7A'',fontSize:14,marginBottom:8,textTransform:''capitalize''}}>{selectedExpense.category}</Text>
                <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:20,marginBottom:12,flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
                  <Text style={{color:''#7A9A7A'',fontSize:13}}>Amount</Text>
                  <Text style={{color:''#A8D4A8'',fontSize:20,fontWeight:''700''}}>{fmt(selectedExpense.amount)}</Text>
                </View>
                {selectedExpense.date ? (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12,flexDirection:''row'',justifyContent:''space-between''}}>
                    <Text style={{color:''#7A9A7A'',fontSize:13}}>Date</Text>
                    <Text style={{color:''#fff'',fontSize:13}}>{new Date(selectedExpense.date).toLocaleDateString()}</Text>
                  </View>
                ) : null}
                {selectedExpense.paymentMethod ? (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12,flexDirection:''row'',justifyContent:''space-between''}}>
                    <Text style={{color:''#7A9A7A'',fontSize:13}}>Payment Method</Text>
                    <Text style={{color:''#fff'',fontSize:13}}>{selectedExpense.paymentMethod}</Text>
                  </View>
                ) : null}
                {selectedExpense.receiptNumber ? (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12,flexDirection:''row'',justifyContent:''space-between''}}>
                    <Text style={{color:''#7A9A7A'',fontSize:13}}>Receipt #</Text>
                    <Text style={{color:''#fff'',fontSize:13}}>{selectedExpense.receiptNumber}</Text>
                  </View>
                ) : null}
                {selectedExpense.description ? (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12}}>
                    <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                    <Text style={{color:''#fff'',fontSize:14}}>{selectedExpense.description}</Text>
                  </View>
                ) : null}
                {selectedExpense.receiptUrl ? (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12}}>
                    <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:10}}>RECEIPT IMAGE</Text>
                    <Image source={{uri:selectedExpense.receiptUrl}} style={{width:''100%'',height:300,borderRadius:8}} resizeMode="contain" />
                  </View>
                ) : (
                  <View style={{backgroundColor:''#2D4A35'',borderRadius:12,padding:16,marginBottom:12,alignItems:''center''}}>
                    <Text style={{color:''#7A9A7A'',fontSize:13}}>No receipt image attached</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>'

$content = $content.Replace($old, $new)
Set-Content $file $content
Write-Host "Done"