$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '                  {(()=>{
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
                  })()}'

$new = '                  {(()=>{
                    const monthNames=[''January'',''February'',''March'',''April'',''May'',''June'',''July'',''August'',''September'',''October'',''November'',''December''];
                    const dayNames=[''Su'',''Mo'',''Tu'',''We'',''Th'',''Fr'',''Sa''];
                    const firstDay=new Date(calViewYear,calViewMonth,1).getDay();
                    const daysInMonth=new Date(calViewYear,calViewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&expenseForm.date===`${calViewYear}-${String(calViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===calViewYear&&t.getMonth()===calViewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center'',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(calViewMonth===0){setCalViewMonth(11);setCalViewYear(y=>y-1);}else setCalViewMonth(m=>m-1);}} style={{padding:8}}>
                            <Text style={{color:''#A8D4A8'',fontSize:20}}>‹</Text>
                          </TouchableOpacity>
                          <Text style={{color:''#fff'',fontSize:16,fontWeight:''600''}}>{monthNames[calViewMonth]} {calViewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(calViewMonth===11){setCalViewMonth(0);setCalViewYear(y=>y+1);}else setCalViewMonth(m=>m+1);}} style={{padding:8}}>
                            <Text style={{color:''#A8D4A8'',fontSize:20}}>›</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:''row'',marginBottom:8}}>
                          {dayNames.map(d=><View key={d} style={{flex:1,alignItems:''center''}}><Text style={{color:''#7A9A7A'',fontSize:11,fontWeight:''600''}}>{d}</Text></View>)}
                        </View>
                        <View style={{flexDirection:''row'',flexWrap:''wrap''}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${calViewYear}-${String(calViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;setExpenseForm(f=>({...f,date:ds}));setShowDatePicker(false);}}} style={{width:''14.28%'',aspectRatio:1,alignItems:''center'',justifyContent:''center'',marginBottom:2}}>
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
                  })()}'

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"