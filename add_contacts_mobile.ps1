$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add state variables
$old1 = "const [showBillCategoryPicker, setShowBillCategoryPicker] = useState(false);"
$new1 = "const [showBillCategoryPicker, setShowBillCategoryPicker] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customerForm, setCustomerForm] = useState({ name:'', email:'', phone:'', salesperson:'' });
  const [vendorForm, setVendorForm] = useState({ name:'', email:'', phone:'' });"

$content = $content.Replace($old1, $new1)
$content | Set-Content $file
Write-Host "Done!"