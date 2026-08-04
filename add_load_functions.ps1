$file = "app/(tabs)/index.tsx"
$content = Get-Content $file -Raw

$old = "async function loadBills(orgId, tok)"
$new = "async function loadCustomers(orgId, tok) {
    try {
      const r = await fetch(API+'/orgs/'+orgId+'/contacts?type=customer', { headers:{ Authorization:'Bearer '+tok } });
      const j = await r.json(); setCustomers(j.data||[]);
    } catch(e) {}
  }
  async function loadVendors(orgId, tok) {
    try {
      const r = await fetch(API+'/orgs/'+orgId+'/contacts?type=vendor', { headers:{ Authorization:'Bearer '+tok } });
      const j = await r.json(); setVendors(j.data||[]);
    } catch(e) {}
  }
  async function loadBills(orgId, tok)"

$content.Replace($old, $new) | Set-Content $file
Write-Host "Done!"