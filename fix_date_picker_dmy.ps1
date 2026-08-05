$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>DATE</Text>
            <TouchableOpacity onPress={()=>setShowDatePicker(true)} style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:''#3D5A45'',flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
              <Text style={{color:''#fff'',fontSize:15}}>{expenseForm.date||new Date().toISOString().slice(0,10)}</Text>
              <Text style={{color:''#7A9A7A'',fontSize:12}}>📅</Text>
            </TouchableOpacity>
            {showDatePicker&&(
              <DateTimePicker value={expenseForm.date?new Date(expenseForm.date):new Date()} mode="date" display="spinner" onChange={(e,d)=>{setShowDatePicker(false);if(d){setExpenseForm(f=>({...f,date:d.toISOString().slice(0,10)}));}}} />
            )}'

$new = '            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>DATE</Text>
            <View style={{flexDirection:''row'',gap:8,marginBottom:16}}>
              {(()=>{
                const d=expenseForm.date?new Date(expenseForm.date):new Date();
                const days=Array.from({length:31},(_,i)=>String(i+1).padStart(2,''0''));
                const months=[''Jan'',''Feb'',''Mar'',''Apr'',''May'',''Jun'',''Jul'',''Aug'',''Sep'',''Oct'',''Nov'',''Dec''];
                const years=Array.from({length:5},(_,i)=>String(new Date().getFullYear()-2+i));
                const curDay=String(d.getDate()).padStart(2,''0'');
                const curMonth=String(d.getMonth());
                const curYear=String(d.getFullYear());
                const setDate=(day,month,year)=>{
                  const nd=new Date(Number(year),Number(month),Number(day));
                  setExpenseForm(f=>({...f,date:nd.toISOString().slice(0,10)}));
                };
                return(<>
                  <View style={{flex:1}}>
                    <Text style={{color:''#7A9A7A'',fontSize:10,marginBottom:4,textAlign:''center''}}>DAY</Text>
                    <ScrollView style={{backgroundColor:''#2D4A35'',borderRadius:10,borderWidth:1,borderColor:''#3D5A45'',maxHeight:120}}>
                      {days.map(day=>(
                        <TouchableOpacity key={day} onPress={()=>setDate(day,curMonth,curYear)} style={{padding:10,backgroundColor:curDay===day?''#3D5A45'':''transparent'',borderRadius:6,margin:2}}>
                          <Text style={{color:curDay===day?''#A8D4A8'':''#fff'',fontSize:15,textAlign:''center''}}>{day}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={{flex:2}}>
                    <Text style={{color:''#7A9A7A'',fontSize:10,marginBottom:4,textAlign:''center''}}>MONTH</Text>
                    <ScrollView style={{backgroundColor:''#2D4A35'',borderRadius:10,borderWidth:1,borderColor:''#3D5A45'',maxHeight:120}}>
                      {months.map((month,idx)=>(
                        <TouchableOpacity key={month} onPress={()=>setDate(curDay,String(idx),curYear)} style={{padding:10,backgroundColor:Number(curMonth)===idx?''#3D5A45'':''transparent'',borderRadius:6,margin:2}}>
                          <Text style={{color:Number(curMonth)===idx?''#A8D4A8'':''#fff'',fontSize:15,textAlign:''center''}}>{month}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={{flex:1.5}}>
                    <Text style={{color:''#7A9A7A'',fontSize:10,marginBottom:4,textAlign:''center''}}>YEAR</Text>
                    <ScrollView style={{backgroundColor:''#2D4A35'',borderRadius:10,borderWidth:1,borderColor:''#3D5A45'',maxHeight:120}}>
                      {years.map(year=>(
                        <TouchableOpacity key={year} onPress={()=>setDate(curDay,curMonth,year)} style={{padding:10,backgroundColor:curYear===year?''#3D5A45'':''transparent'',borderRadius:6,margin:2}}>
                          <Text style={{color:curYear===year?''#A8D4A8'':''#fff'',fontSize:15,textAlign:''center''}}>{year}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>);
              })()}
            </View>'

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"