$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>DATE</Text>
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

$new = '            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>DATE</Text>
            <TouchableOpacity onPress={()=>setShowDatePicker(true)} style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:''#3D5A45'',flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
              <Text style={{color:''#fff'',fontSize:15}}>{expenseForm.date ? new Date(expenseForm.date+''T12:00:00'').toLocaleDateString(''en-US'',{month:''short'',day:''numeric'',year:''numeric''}) : ''Select date''}</Text>
              <Text style={{color:''#7A9A7A'',fontSize:16}}>📅</Text>
            </TouchableOpacity>
            <Modal visible={showDatePicker} transparent animationType=''fade''>
              <View style={{flex:1,backgroundColor:''rgba(0,0,0,0.6)'',justifyContent:''center'',alignItems:''center'',padding:24}}>
                <View style={{backgroundColor:''#1E3A28'',borderRadius:16,padding:20,width:''100%'',maxWidth:340}}>
                  {(()=>{
                    const selDate=expenseForm.date?new Date(expenseForm.date+''T12:00:00''):new Date();
                    const [viewYear,setViewYear]=React.useState(selDate.getFullYear());
                    const [viewMonth,setViewMonth]=React.useState(selDate.getMonth());
                    const monthNames=[''January'',''February'',''March'',''April'',''May'',''June'',''July'',''August'',''September'',''October'',''November'',''December''];
                    const dayNames=[''Su'',''Mo'',''Tu'',''We'',''Th'',''Fr'',''Sa''];
                    const firstDay=new Date(viewYear,viewMonth,1).getDay();
                    const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&expenseForm.date===`${viewYear}-${String(viewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===viewYear&&t.getMonth()===viewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center'',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);}} style={{padding:8}}>
                            <Text style={{color:''#A8D4A8'',fontSize:20}}>‹</Text>
                          </TouchableOpacity>
                          <Text style={{color:''#fff'',fontSize:16,fontWeight:''600''}}>{monthNames[viewMonth]} {viewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);}} style={{padding:8}}>
                            <Text style={{color:''#A8D4A8'',fontSize:20}}>›</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:''row'',marginBottom:8}}>
                          {dayNames.map(d=><View key={d} style={{flex:1,alignItems:''center''}}><Text style={{color:''#7A9A7A'',fontSize:11,fontWeight:''600''}}>{d}</Text></View>)}
                        </View>
                        <View style={{flexDirection:''row'',flexWrap:''wrap''}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${viewYear}-${String(viewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;setExpenseForm(f=>({...f,date:ds}));setShowDatePicker(false);}}} style={{width:''14.28%'',aspectRatio:1,alignItems:''center'',justifyContent:''center'',marginBottom:2}}>
                              {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSelected(d)?''#A8D4A8'':''transparent'',alignItems:''center'',justifyContent:''center'',borderWidth:isToday(d)&&!isSelected(d)?1:0,borderColor:''#A8D4A8''}}>
                                <Text style={{color:isSelected(d)?''#1C2E1C'':''#fff'',fontSize:14,fontWeight:isSelected(d)||isToday(d)?''700'':''400''}}>{d}</Text>
                              </View>:null}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={()=>setShowDatePicker(false)} style={{marginTop:16,padding:12,alignItems:''center'',borderTopWidth:1,borderTopColor:''#3D5A45''}}>
                          <Text style={{color:''#7A9A7A'',fontSize:15}}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Modal>'

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"