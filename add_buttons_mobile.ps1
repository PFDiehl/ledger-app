$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = "onPress={()=>setShowReports(true)}>
        <Text style={{color:'#A8C4D4',fontSize:16,fontWeight:'600'}}>View Reports</Text>
      </TouchableOpacity>"

$new = "onPress={()=>setShowReports(true)}>
        <Text style={{color:'#A8C4D4',fontSize:16,fontWeight:'600'}}>View Reports</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#2D3A4A',borderRadius:12,padding:16,alignItems:'center',marginBottom:12}} onPress={()=>setShowCustomers(true)}>
        <Text style={{color:'#A8B4D4',fontSize:16,fontWeight:'600'}}>Customers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#3A2D4A',borderRadius:12,padding:16,alignItems:'center',marginBottom:24}} onPress={()=>setShowVendors(true)}>
        <Text style={{color:'#C4A8D4',fontSize:16,fontWeight:'600'}}>Vendors</Text>
      </TouchableOpacity>"

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"