$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add billCalViewYear and billCalViewMonth state
$content = $content.Replace(
    "const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);",
    "const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);
  const [billCalViewYear, setBillCalViewYear] = useState(new Date().getFullYear());
  const [billCalViewMonth, setBillCalViewMonth] = useState(new Date().getMonth());"
)

# Add calendar modal after the DATE touchable in bill form
$old = '            <TouchableOpacity onPress={()=>{setBillDatePickerVisible(true);}} style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:''#3D5A45''}}>
              <Text style={{color:billForm.dueDate?''#fff'':''#7A9A7A'',fontSize:15}}>{billForm.dueDate ? new Date(billForm.dueDate+''T12:00:00'').toLocaleDateString(''en-US'',{month:''short'',day:''numeric'',year:''numeric''}) : ''Select date''}</Text>
            </TouchableOpacity>'

$new = '            <TouchableOpacity onPress={()=>{setBillCalViewYear(new Date().getFullYear());setBillCalViewMonth(new Date().getMonth());setBillDatePickerVisible(true);}} style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:''#3D5A45'',flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
              <Text style={{color:billForm.dueDate?''#fff'':''#7A9A7A'',fontSize:15}}>{billForm.dueDate ? new Date(billForm.dueDate+''T12:00:00'').toLocaleDateString(''en-US'',{month:''short'',day:''numeric'',year:''numeric''}) : ''Select date''}</Text>
              <Text style={{color:''#7A9A7A'',fontSize:16}}>📅</Text>
            </TouchableOpacity>
            <Modal visible={billDatePickerVisible} transparent animationType=''fade''>
              <View style={{flex:1,backgroundColor:''rgba(0,0,0,0.6)'',justifyContent:''center'',alignItems:''center'',padding:24}}>
                <View style={{backgroundColor:''#1E3A28'',borderRadius:16,padding:20,width:''100%'',maxWidth:340}}>
                  {(()=>{
                    const monthNames=[''January'',''February'',''March'',''April'',''May'',''June'',''July'',''August'',''September'',''October'',''November'',''December''];
                    const dayNames=[''Su'',''Mo'',''Tu'',''We'',''Th'',''Fr'',''Sa''];
                    const firstDay=new Date(billCalViewYear,billCalViewMonth,1).getDay();
                    const daysInMonth=new Date(billCalViewYear,billCalViewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&billForm.dueDate===`${billCalViewYear}-${String(billCalViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===billCalViewYear&&t.getMonth()===billCalViewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center'',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(billCalViewMonth===0){setBillCalViewMonth(11);setBillCalViewYear(y=>y-1);}else setBillCalViewMonth(m=>m-1);}} style={{padding:8}}>
                            <Text style={{color:''#A8D4A8'',fontSize:20}}>‹</Text>
                          </TouchableOpacity>
                          <Text style={{color:''#fff'',fontSize:16,fontWeight:''600''}}>{monthNames[billCalViewMonth]} {billCalViewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(billCalViewMonth===11){setBillCalViewMonth(0);setBillCalViewYear(y=>y+1);}else setBillCalViewMonth(m=>m+1);}} style={{padding:8}}>
                            <Text style={{color:''#A8D4A8'',fontSize:20}}>›</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:''row'',marginBottom:8}}>
                          {dayNames.map(d=><View key={d} style={{flex:1,alignItems:''center''}}><Text style={{color:''#7A9A7A'',fontSize:11,fontWeight:''600''}}>{d}</Text></View>)}
                        </View>
                        <View style={{flexDirection:''row'',flexWrap:''wrap''}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${billCalViewYear}-${String(billCalViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;setBillForm(f=>({...f,dueDate:ds}));setBillDatePickerVisible(false);}}} style={{width:''14.28%'',aspectRatio:1,alignItems:''center'',justifyContent:''center'',marginBottom:2}}>
                              {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSelected(d)?''#A8D4A8'':''transparent'',alignItems:''center'',justifyContent:''center'',borderWidth:isToday(d)&&!isSelected(d)?1:0,borderColor:''#A8D4A8''}}>
                                <Text style={{color:isSelected(d)?''#1C2E1C'':''#fff'',fontSize:14,fontWeight:isSelected(d)||isToday(d)?''700'':''400''}}>{d}</Text>
                              </View>:null}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={()=>setBillDatePickerVisible(false)} style={{marginTop:16,padding:12,alignItems:''center'',borderTopWidth:1,borderTopColor:''#3D5A45''}}>
                          <Text style={{color:''#7A9A7A'',fontSize:15}}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Modal>'

$content = $content.Replace($old, $new)
Set-Content $file $content
Write-Host "Done"