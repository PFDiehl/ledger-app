$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add dates to invoiceForm state
$content = $content.Replace(
    "const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'' });",
    "const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'' });"
)

# Add date picker states
$content = $content.Replace(
    "const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);",
    "const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);
  const [invoiceDatePickerVisible, setInvoiceDatePickerVisible] = useState(false);
  const [invoiceDueDatePickerVisible, setInvoiceDueDatePickerVisible] = useState(false);
  const [invoiceCalViewYear, setInvoiceCalViewYear] = useState(new Date().getFullYear());
  const [invoiceCalViewMonth, setInvoiceCalViewMonth] = useState(new Date().getMonth());
  const [invoiceDueCalViewYear, setInvoiceDueCalViewYear] = useState(new Date().getFullYear());
  const [invoiceDueCalViewMonth, setInvoiceDueCalViewMonth] = useState(new Date().getMonth());"
)

# Add date fields after PO number in invoice form
$content = $content.Replace(
    "<Text style={{color:''#7A9A7A'',fontSize:13,fontWeight:''600'',marginBottom:12}}>LINE ITEMS</Text>",
    "<Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>INVOICE DATE</Text>
            <TouchableOpacity onPress={()=>{setInvoiceCalViewYear(new Date().getFullYear());setInvoiceCalViewMonth(new Date().getMonth());setInvoiceDatePickerVisible(true);}} style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:''#3D5A45'',flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
              <Text style={{color:invoiceForm.issueDate?''#fff'':''#7A9A7A'',fontSize:15}}>{invoiceForm.issueDate ? new Date(invoiceForm.issueDate+''T12:00:00'').toLocaleDateString(''en-US'',{month:''short'',day:''numeric'',year:''numeric''}) : ''Select date''}</Text>
              <Text style={{color:''#7A9A7A'',fontSize:16}}>📅</Text>
            </TouchableOpacity>
            <Modal visible={invoiceDatePickerVisible} transparent animationType=''fade''>
              <View style={{flex:1,backgroundColor:''rgba(0,0,0,0.6)'',justifyContent:''center'',alignItems:''center'',padding:24}}>
                <View style={{backgroundColor:''#1E3A28'',borderRadius:16,padding:20,width:''100%'',maxWidth:340}}>
                  {(()=>{
                    const monthNames=[''January'',''February'',''March'',''April'',''May'',''June'',''July'',''August'',''September'',''October'',''November'',''December''];
                    const dayNames=[''Su'',''Mo'',''Tu'',''We'',''Th'',''Fr'',''Sa''];
                    const firstDay=new Date(invoiceCalViewYear,invoiceCalViewMonth,1).getDay();
                    const daysInMonth=new Date(invoiceCalViewYear,invoiceCalViewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&invoiceForm.issueDate===`${invoiceCalViewYear}-${String(invoiceCalViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===invoiceCalViewYear&&t.getMonth()===invoiceCalViewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center'',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(invoiceCalViewMonth===0){setInvoiceCalViewMonth(11);setInvoiceCalViewYear(y=>y-1);}else setInvoiceCalViewMonth(m=>m-1);}} style={{padding:8}}><Text style={{color:''#A8D4A8'',fontSize:20}}>‹</Text></TouchableOpacity>
                          <Text style={{color:''#fff'',fontSize:16,fontWeight:''600''}}>{monthNames[invoiceCalViewMonth]} {invoiceCalViewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(invoiceCalViewMonth===11){setInvoiceCalViewMonth(0);setInvoiceCalViewYear(y=>y+1);}else setInvoiceCalViewMonth(m=>m+1);}} style={{padding:8}}><Text style={{color:''#A8D4A8'',fontSize:20}}>›</Text></TouchableOpacity>
                        </View>
                        <View style={{flexDirection:''row'',marginBottom:8}}>{dayNames.map(d=><View key={d} style={{flex:1,alignItems:''center''}}><Text style={{color:''#7A9A7A'',fontSize:11,fontWeight:''600''}}>{d}</Text></View>)}</View>
                        <View style={{flexDirection:''row'',flexWrap:''wrap''}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${invoiceCalViewYear}-${String(invoiceCalViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;setInvoiceForm(f=>({...f,issueDate:ds}));setInvoiceDatePickerVisible(false);}}} style={{width:''14.28%'',aspectRatio:1,alignItems:''center'',justifyContent:''center'',marginBottom:2}}>
                              {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSelected(d)?''#A8D4A8'':''transparent'',alignItems:''center'',justifyContent:''center'',borderWidth:isToday(d)&&!isSelected(d)?1:0,borderColor:''#A8D4A8''}}><Text style={{color:isSelected(d)?''#1C2E1C'':''#fff'',fontSize:14,fontWeight:isSelected(d)||isToday(d)?''700'':''400''}}>{d}</Text></View>:null}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={()=>setInvoiceDatePickerVisible(false)} style={{marginTop:16,padding:12,alignItems:''center'',borderTopWidth:1,borderTopColor:''#3D5A45''}}><Text style={{color:''#7A9A7A'',fontSize:15}}>Cancel</Text></TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Modal>
            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>DUE DATE (OPTIONAL)</Text>
            <TouchableOpacity onPress={()=>{setInvoiceDueCalViewYear(new Date().getFullYear());setInvoiceDueCalViewMonth(new Date().getMonth());setInvoiceDueDatePickerVisible(true);}} style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,marginBottom:24,borderWidth:1,borderColor:''#3D5A45'',flexDirection:''row'',justifyContent:''space-between'',alignItems:''center''}}>
              <Text style={{color:invoiceForm.dueDate?''#fff'':''#7A9A7A'',fontSize:15}}>{invoiceForm.dueDate ? new Date(invoiceForm.dueDate+''T12:00:00'').toLocaleDateString(''en-US'',{month:''short'',day:''numeric'',year:''numeric''}) : ''Select due date''}</Text>
              <Text style={{color:''#7A9A7A'',fontSize:16}}>📅</Text>
            </TouchableOpacity>
            <Modal visible={invoiceDueDatePickerVisible} transparent animationType=''fade''>
              <View style={{flex:1,backgroundColor:''rgba(0,0,0,0.6)'',justifyContent:''center'',alignItems:''center'',padding:24}}>
                <View style={{backgroundColor:''#1E3A28'',borderRadius:16,padding:20,width:''100%'',maxWidth:340}}>
                  {(()=>{
                    const monthNames=[''January'',''February'',''March'',''April'',''May'',''June'',''July'',''August'',''September'',''October'',''November'',''December''];
                    const dayNames=[''Su'',''Mo'',''Tu'',''We'',''Th'',''Fr'',''Sa''];
                    const firstDay=new Date(invoiceDueCalViewYear,invoiceDueCalViewMonth,1).getDay();
                    const daysInMonth=new Date(invoiceDueCalViewYear,invoiceDueCalViewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&invoiceForm.dueDate===`${invoiceDueCalViewYear}-${String(invoiceDueCalViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===invoiceDueCalViewYear&&t.getMonth()===invoiceDueCalViewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:''row'',justifyContent:''space-between'',alignItems:''center'',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(invoiceDueCalViewMonth===0){setInvoiceDueCalViewMonth(11);setInvoiceDueCalViewYear(y=>y-1);}else setInvoiceDueCalViewMonth(m=>m-1);}} style={{padding:8}}><Text style={{color:''#A8D4A8'',fontSize:20}}>‹</Text></TouchableOpacity>
                          <Text style={{color:''#fff'',fontSize:16,fontWeight:''600''}}>{monthNames[invoiceDueCalViewMonth]} {invoiceDueCalViewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(invoiceDueCalViewMonth===11){setInvoiceDueCalViewMonth(0);setInvoiceDueCalViewYear(y=>y+1);}else setInvoiceDueCalViewMonth(m=>m+1);}} style={{padding:8}}><Text style={{color:''#A8D4A8'',fontSize:20}}>›</Text></TouchableOpacity>
                        </View>
                        <View style={{flexDirection:''row'',marginBottom:8}}>{dayNames.map(d=><View key={d} style={{flex:1,alignItems:''center''}}><Text style={{color:''#7A9A7A'',fontSize:11,fontWeight:''600''}}>{d}</Text></View>)}</View>
                        <View style={{flexDirection:''row'',flexWrap:''wrap''}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${invoiceDueCalViewYear}-${String(invoiceDueCalViewMonth+1).padStart(2,''0'')}-${String(d).padStart(2,''0'')}`;setInvoiceForm(f=>({...f,dueDate:ds}));setInvoiceDueDatePickerVisible(false);}}} style={{width:''14.28%'',aspectRatio:1,alignItems:''center'',justifyContent:''center'',marginBottom:2}}>
                              {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSelected(d)?''#A8D4A8'':''transparent'',alignItems:''center'',justifyContent:''center'',borderWidth:isToday(d)&&!isSelected(d)?1:0,borderColor:''#A8D4A8''}}><Text style={{color:isSelected(d)?''#1C2E1C'':''#fff'',fontSize:14,fontWeight:isSelected(d)||isToday(d)?''700'':''400''}}>{d}</Text></View>:null}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={()=>setInvoiceDueDatePickerVisible(false)} style={{marginTop:16,padding:12,alignItems:''center'',borderTopWidth:1,borderTopColor:''#3D5A45''}}><Text style={{color:''#7A9A7A'',fontSize:15}}>Cancel</Text></TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Modal>
            <Text style={{color:''#7A9A7A'',fontSize:13,fontWeight:''600'',marginBottom:12}}>LINE ITEMS</Text>"
)

Set-Content $file $content
Write-Host "Done"