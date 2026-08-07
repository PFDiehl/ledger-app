$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw
$content = $content.Replace(
    "setExpenseForm(f=>({...f,vendor:info.vendor||f.vendor,amount:String(info.amount||f.amount),date:info.date||f.date,category:info.category||f.category}));",
    "const safeDate = info.date && !isNaN(new Date(info.date)) ? info.date : new Date().toISOString().slice(0,10); setExpenseForm(f=>({...f,vendor:info.vendor||f.vendor,amount:String(info.amount||f.amount),date:safeDate,category:info.category||f.category}));"
)
Set-Content $file $content
Write-Host "Done"