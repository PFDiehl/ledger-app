$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

# Fix state to use dueDate
$content = $content.Replace(
    "const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10) });",
    "const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'', dueDate:new Date().toISOString().slice(0,10) });"
)

# Fix reset after save
$content = $content.Replace(
    "setBillForm({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10) });",
    "setBillForm({ vendor:'', amount:'', description:'', category:'', dueDate:new Date().toISOString().slice(0,10) });"
)

# Fix UI display
$content = $content.Replace(
    "color:billForm.date?'#fff':'#7A9A7A',fontSize:15}}>{billForm.date ? new Date(billForm.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>",
    "color:billForm.dueDate?'#fff':'#7A9A7A',fontSize:15}}>{billForm.dueDate ? new Date(billForm.dueDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>"
)

Set-Content $file $content
Write-Host "Done"