$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add new fields to customerForm state
$content = $content.Replace(
    "const [customerForm, setCustomerForm] = useState({ name:'', email:'', phone:'', salesperson:'' });",
    "const [customerForm, setCustomerForm] = useState({ name:'', email:'', phone:'', salesperson:'', notes:'', dateAdded:new Date().toISOString().slice(0,10), lastContact:'' });"
)

# Add new fields to vendorForm state
$content = $content.Replace(
    "const [vendorForm, setVendorForm] = useState({ name:'', email:'', phone:'' });",
    "const [vendorForm, setVendorForm] = useState({ name:'', email:'', phone:'', notes:'', dateAdded:new Date().toISOString().slice(0,10), lastContact:'' });"
)

Set-Content $file $content
Write-Host "Done"