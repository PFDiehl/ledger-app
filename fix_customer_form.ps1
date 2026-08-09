$file = "C:\Users\Paul\Desktop\ledger\src\pages\CustomerForm.jsx"
$content = Get-Content $file -Raw
$old = '      <div style={{display:''flex'',gap:12}}>
        <button onClick={onCancel}'
$new = '      <div style={{background:''var(--color-surface)'',borderRadius:14,padding:28,border:''1px solid var(--color-border)'',marginBottom:28}}>
        <h3 style={{margin:''0 0 20px'',fontSize:13,fontWeight:600,color:''var(--color-text-secondary)'',textTransform:''uppercase'',letterSpacing:''0.05em''}}>Dates & Notes</h3>
        <div style={{display:''grid'',gridTemplateColumns:''1fr 1fr'',gap:12}}>
          <div style={fieldStyle}><label style={labelStyle}>Date Added</label><input style={inputStyle} type="date" value={form.dateAdded ? new Date(form.dateAdded).toISOString().slice(0,10) : ''''} onChange={set(''dateAdded'')} /></div>
          <div style={fieldStyle}><label style={labelStyle}>Last Contact</label><input style={inputStyle} type="date" value={form.lastContact ? new Date(form.lastContact).toISOString().slice(0,10) : ''''} onChange={set(''lastContact'')} /></div>
        </div>
        <div style={fieldStyle}><label style={labelStyle}>Notes</label><textarea style={{...inputStyle,minHeight:80,resize:''vertical''}} value={form.notes||''''} onChange={set(''notes'')} placeholder="Any notes about this customer..." /></div>
      </div>
      <div style={{display:''flex'',gap:12}}>
        <button onClick={onCancel}'
$content = $content.Replace($old, $new)
Set-Content $file $content
Write-Host "Done"