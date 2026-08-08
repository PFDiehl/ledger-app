$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Add billDate to form state
$content = $content.Replace(
    "const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'', dueDate:new Date().toISOString().slice(0,10) });",
    "const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'', billDate:new Date().toISOString().slice(0,10), dueDate:'' });"
)

# Add billDate to reset after save
$content = $content.Replace(
    "setBillForm({ vendor:'', amount:'', description:'', category:'', dueDate:new Date().toISOString().slice(0,10) });",
    "setBillForm({ vendor:'', amount:'', description:'', category:'', billDate:new Date().toISOString().slice(0,10), dueDate:'' });"
)

# Add billDate to button reset
$content = $content.Replace(
    "setEditingBill(false);setBillForm({vendor:'',amount:'',description:'',category:'',dueDate:new Date().toISOString().slice(0,10)});setShowBill(true);",
    "setEditingBill(false);setBillForm({vendor:'',amount:'',description:'',category:'',billDate:new Date().toISOString().slice(0,10),dueDate:''});setShowBill(true);"
)

# Add billDate to editBill function
$content = $content.Replace(
    "setBillForm({ vendor: bill.vendor||'', amount: String(bill.amount)||'', description: bill.description||'', category: bill.category||'', dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10) });",
    "setBillForm({ vendor: bill.vendor||'', amount: String(bill.amount)||'', description: bill.description||'', category: bill.category||'', billDate: bill.billDate ? new Date(bill.billDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10), dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().slice(0,10) : '' });"
)

# Add due date calendar state
$content = $content.Replace(
    "const [billCalViewYear, setBillCalViewYear] = useState(new Date().getFullYear());
  const [billCalViewMonth, setBillCalViewMonth] = useState(new Date().getMonth());",
    "const [billCalViewYear, setBillCalViewYear] = useState(new Date().getFullYear());
  const [billCalViewMonth, setBillCalViewMonth] = useState(new Date().getMonth());
  const [billDueDatePickerVisible, setBillDueDatePickerVisible] = useState(false);
  const [billDueCalViewYear, setBillDueCalViewYear] = useState(new Date().getFullYear());
  const [billDueCalViewMonth, setBillDueCalViewMonth] = useState(new Date().getMonth());"
)

# Fix bill date field to use billDate instead of dueDate
$content = $content.Replace(
    "color:billForm.dueDate?'#fff':'#7A9A7A',fontSize:15}}>{billForm.dueDate ? new Date(billForm.dueDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>",
    "color:billForm.billDate?'#fff':'#7A9A7A',fontSize:15}}>{billForm.billDate ? new Date(billForm.billDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>"
)

# Fix calendar to set billDate instead of dueDate
$content = $content.Replace(
    "setBillForm(f=>({...f,dueDate:ds}));setBillDatePickerVisible(false);",
    "setBillForm(f=>({...f,billDate:ds}));setBillDatePickerVisible(false);"
)

Set-Content $file $content
Write-Host "Done"