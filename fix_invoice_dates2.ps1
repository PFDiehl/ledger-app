$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add dates to invoiceForm state
$content = $content.Replace(
    "const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'' });",
    "const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'' });"
)

# Add picker states after billDatePickerVisible
$content = $content.Replace(
    "const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);",
    "const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);
  const [invoiceDatePickerVisible, setInvoiceDatePickerVisible] = useState(false);
  const [invoiceDueDatePickerVisible, setInvoiceDueDatePickerVisible] = useState(false);
  const [invCalYear, setInvCalYear] = useState(new Date().getFullYear());
  const [invCalMonth, setInvCalMonth] = useState(new Date().getMonth());
  const [invDueCalYear, setInvDueCalYear] = useState(new Date().getFullYear());
  const [invDueCalMonth, setInvDueCalMonth] = useState(new Date().getMonth());"
)

Set-Content $file $content
Write-Host "Done"