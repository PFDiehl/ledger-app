$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = '            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,color:''#fff'',fontSize:15,marginBottom:16,borderWidth:1,borderColor:''#3D5A45''}} value={expenseForm.vendor} onChangeText={v=>setExpenseForm(f=>({...f,vendor:v}))} placeholder="Amazon" placeholderTextColor="#7A9A7A" />'

$new = '            <TouchableOpacity onPress={async()=>{
              const perm=await ImagePicker.requestMediaLibraryPermissionsAsync();
              if(perm.status!==''granted''){Alert.alert(''Permission needed'',''Please allow photo access.'');return;}
              const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,base64:true,quality:0.8});
              if(result.canceled)return;
              setScanningReceipt(true);
              try{
                const b64=result.assets[0].base64;
                const r=await fetch(''https://api.anthropic.com/v1/messages'',{method:''POST'',headers:{''Content-Type'':''application/json'',''anthropic-version'':''2023-06-01'',''x-api-key'':''REPLACE_WITH_KEY''},body:JSON.stringify({model:''claude-sonnet-4-6'',max_tokens:500,messages:[{role:''user'',content:[{type:''image'',source:{type:''base64'',media_type:''image/jpeg'',data:b64}},{type:''text'',text:''Extract receipt info. Return ONLY JSON with: vendor, amount (number), date (YYYY-MM-DD), category (one of: Advertising & Marketing, Bank Charges, Equipment, Insurance, Legal & Professional Fees, Meals & Entertainment, Office Supplies, Payroll, Rent & Lease, Software & Subscriptions, Taxes & Licenses, Travel, Utilities, Vehicle, Other). No explanation.''}]}]})});
                const j=await r.json();
                const info=JSON.parse(j.content[0].text.replace(/```json|```/g,'''').trim());
                setExpenseForm(f=>({...f,vendor:info.vendor||f.vendor,amount:String(info.amount||f.amount),date:info.date||f.date,category:info.category||f.category}));
                Alert.alert(''Receipt scanned!'',''Please review the filled fields.'');
              }catch(e){Alert.alert(''Error'',''Could not read receipt. Fill in manually.'');}
              finally{setScanningReceipt(false);}
            }} style={{backgroundColor:''#1C3A4A'',borderRadius:12,padding:14,alignItems:''center'',marginBottom:20,flexDirection:''row'',justifyContent:''center'',gap:8}}>
              <Text style={{color:scanningReceipt?''#7A9A7A'':''#A8C4D4'',fontSize:15,fontWeight:''600''}}>{scanningReceipt?''Scanning receipt...'':''Scan Receipt''}</Text>
            </TouchableOpacity>
            <Text style={{color:''#7A9A7A'',fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:''#2D4A35'',borderRadius:10,padding:14,color:''#fff'',fontSize:15,marginBottom:16,borderWidth:1,borderColor:''#3D5A45''}} value={expenseForm.vendor} onChangeText={v=>setExpenseForm(f=>({...f,vendor:v}))} placeholder="Amazon" placeholderTextColor="#7A9A7A" />'

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"