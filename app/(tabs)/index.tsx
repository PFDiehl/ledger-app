import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';

const API = 'https://ledger-accounting-production.up.railway.app/api';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [token, setToken] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [showBillDetail, setShowBillDetail] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showExpenseCategoryPicker, setShowExpenseCategoryPicker] = useState(false);
  const [showBillCategoryPicker, setShowBillCategoryPicker] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customerForm, setCustomerForm] = useState({ name:'', email:'', phone:'', salesperson:'' });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [vendorForm, setVendorForm] = useState({ name:'', email:'', phone:'' });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [lines, setLines] = useState([{ description:'', quantity:'1', unitPrice:'' }]);
  const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'' });
  const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);
  const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'' });
  const [regForm, setRegForm] = useState({ fullName:'', orgName:'', email:'', password:'' });
  const [editingInvoice, setEditingInvoice] = useState(false);
  const [editingExpense, setEditingExpense] = useState(false);
  const [editingBill, setEditingBill] = useState(false);

  async function login() {
    try {
      const r = await fetch(API+'/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
      const j = await r.json();
      const d = j.data || j;
      if (d.user) {
        setUser(d.user); setOrg(d.orgs?.[0]); setToken(d.accessToken);
        loadInvoices(d.orgs?.[0]?.id, d.accessToken);
        loadExpenses(d.orgs?.[0]?.id, d.accessToken);
        loadBills(d.orgs?.[0]?.id, d.accessToken);
        loadCustomers(d.orgs?.[0]?.id, d.accessToken);
        loadVendors(d.orgs?.[0]?.id, d.accessToken);
      } else Alert.alert('Error', 'Invalid credentials');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function register() {
    if (!regForm.fullName || !regForm.orgName || !regForm.email || !regForm.password) return Alert.alert('Error', 'Please fill in all fields');
    try {
      const r = await fetch(API+'/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(regForm) });
      const j = await r.json();
      const d = j.data || j;
      if (d.user) {
        setUser(d.user); setOrg(d.orgs?.[0]); setToken(d.accessToken);
        setShowRegister(false);
        loadInvoices(d.orgs?.[0]?.id, d.accessToken);
        loadExpenses(d.orgs?.[0]?.id, d.accessToken);
        loadBills(d.orgs?.[0]?.id, d.accessToken);
        loadCustomers(d.orgs?.[0]?.id, d.accessToken);
        loadVendors(d.orgs?.[0]?.id, d.accessToken);
      } else Alert.alert('Error', j.message || 'Registration failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function loadInvoices(orgId, tok) {
    try {
      const r = await fetch(API+'/orgs/'+orgId+'/invoices', { headers:{'Authorization':'Bearer '+tok} });
      const j = await r.json();
      if (j.success) setInvoices(j.data);
    } catch(e) {}
  }

  async function loadExpenses(orgId, tok) {
    try {
      const r = await fetch(API+'/orgs/'+orgId+'/expenses', { headers:{'Authorization':'Bearer '+tok} });
      const j = await r.json();
      if (j.success) setExpenses(j.data);
    } catch(e) {}
  }

  async function loadCustomers(orgId, tok) {
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
  async function loadBills(orgId, tok) {
    try {
      const r = await fetch(API+'/orgs/'+orgId+'/bills', { headers:{'Authorization':'Bearer '+tok} });
      const j = await r.json();
      if (j.success) setBills(j.data);
    } catch(e) {}
  }

  function addLine() { setLines(l => [...l, { description:'', quantity:'1', unitPrice:'' }]); }
  function removeLine(i) { setLines(l => l.filter((_, idx) => idx !== i)); }
  function updateLine(i, field, value) { setLines(l => l.map((line, idx) => idx === i ? {...line, [field]: value} : line)); }

  const invoiceTotal = () => {
    const sub = lines.reduce((s, l) => s + (Number(l.quantity||0) * Number(l.unitPrice||0)), 0);
    const tax = sub * (Number(invoiceForm.taxRate||0) / 100);
    return sub + tax + Number(invoiceForm.shipping||0) - Number(invoiceForm.discount||0);
  };

  async function saveInvoice() {
    if (!invoiceForm.clientName) return Alert.alert('Error', 'Enter client name');
    if (lines.some(l => !l.description || !l.unitPrice)) return Alert.alert('Error', 'Fill in all line items');
    try {
      const method = editingInvoice ? 'PATCH' : 'POST';
      const url = editingInvoice ? API+'/orgs/'+org.id+'/invoices/'+selectedInvoice.id : API+'/orgs/'+org.id+'/invoices';
      const r = await fetch(url, {
        method,
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify({ ...invoiceForm, lines })
      });
      const j = await r.json();
      if (j.success) {
        setShowInvoice(false); setEditingInvoice(false);
        setInvoiceForm({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'' });
        setLines([{ description:'', quantity:'1', unitPrice:'' }]);
        loadInvoices(org.id, token);
        Alert.alert('Saved!', editingInvoice ? 'Invoice updated' : 'Invoice created');
      } else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function saveExpense() {
    if (!expenseForm.vendor || !expenseForm.amount) return Alert.alert('Error', 'Fill in vendor and amount');
    try {
      const method = editingExpense ? 'PATCH' : 'POST';
      const url = editingExpense ? API+'/orgs/'+org.id+'/expenses/'+selectedExpense.id : API+'/orgs/'+org.id+'/expenses';
      const r = await fetch(url, { method, headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(expenseForm) });
      const j = await r.json();
      if (j.success) {
        setShowExpense(false); setEditingExpense(false);
        setExpenseForm({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });
        loadExpenses(org.id, token);
        Alert.alert('Saved!', editingExpense ? 'Expense updated' : 'Expense recorded');
      } else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function saveBill() {
    if (!billForm.vendor || !billForm.amount) return Alert.alert('Error', 'Fill in vendor and amount');
    try {
      const method = editingBill ? 'PATCH' : 'POST';
      const url = editingBill ? API+'/orgs/'+org.id+'/bills/'+selectedBill.id : API+'/orgs/'+org.id+'/bills';
      const r = await fetch(url, { method, headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(billForm) });
      const j = await r.json();
      if (j.success) {
        setShowBill(false); setEditingBill(false);
        setBillForm({ vendor:'', amount:'', description:'' });
        loadBills(org.id, token);
        Alert.alert('Saved!', editingBill ? 'Bill updated' : 'Bill recorded');
      } else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function markInvoicePaid(id) {
    try {
      const r = await fetch(API+'/orgs/'+org.id+'/invoices/'+id, {
        method:'PATCH', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify({status:'paid'})
      });
      const j = await r.json();
      if (j.success) { setShowDetail(false); loadInvoices(org.id, token); Alert.alert('Paid!', 'Invoice marked as paid'); }
      else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function recordPartialPayment(inv) {
    Alert.prompt('Partial Payment', 'Enter amount (Invoice total: '+fmt(inv.total)+')',
      [
        { text:'Cancel', style:'cancel' },
        { text:'Record', onPress: async (amount) => {
          if (!amount || isNaN(Number(amount))) return Alert.alert('Error', 'Enter a valid amount');
          try {
            const r = await fetch(API+'/orgs/'+org.id+'/invoices/'+inv.id, {
              method:'PATCH', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
              body:JSON.stringify({status:'partial'})
            });
            const j = await r.json();
            if (j.success) { setShowDetail(false); loadInvoices(org.id, token); Alert.alert('Recorded!', 'Payment of '+fmt(Number(amount))+' recorded'); }
            else Alert.alert('Error', j.message || 'Failed');
          } catch(e) { Alert.alert('Error', 'Cannot connect'); }
        }}
      ], 'plain-text', '', 'decimal-pad'
    );
  }

  async function sendInvoice(id) {
    Alert.alert('Send Invoice', 'Send to ' + (selectedInvoice?.contact?.email || 'client') + '?', [
      { text:'Cancel', style:'cancel' },
      { text:'Send', onPress: async () => {
        try {
          const r = await fetch(API+'/orgs/'+org.id+'/invoices/'+id+'/send', {
            method:'POST', headers:{'Authorization':'Bearer '+token}
          });
          const j = await r.json();
          if (j.success) { Alert.alert('Sent!', 'Invoice emailed to client'); loadInvoices(org.id, token); }
          else Alert.alert('Error', j.message || 'Failed to send');
        } catch(e) { Alert.alert('Error', 'Cannot connect'); }
      }}
    ]);
  }

  async function deleteInvoice(id) {
    Alert.alert('Delete Invoice', 'Are you sure?', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async () => {
        try {
          const r = await fetch(API+'/orgs/'+org.id+'/invoices/'+id, { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
          const j = await r.json();
          if (j.success) { setShowDetail(false); loadInvoices(org.id, token); Alert.alert('Deleted', 'Invoice removed'); }
          else Alert.alert('Error', j.message || 'Failed');
        } catch(e) { Alert.alert('Error', 'Cannot connect'); }
      }}
    ]);
  }

  async function deleteExpense(id) {
    Alert.alert('Delete Expense', 'Are you sure?', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async () => {
        try {
          const r = await fetch(API+'/orgs/'+org.id+'/expenses/'+id, { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
          const j = await r.json();
          if (j.success) { setShowExpenseDetail(false); loadExpenses(org.id, token); Alert.alert('Deleted', 'Expense removed'); }
          else Alert.alert('Error', j.message || 'Failed');
        } catch(e) { Alert.alert('Error', 'Cannot connect'); }
      }}
    ]);
  }

  async function deleteBill(id) {
    Alert.alert('Delete Bill', 'Are you sure?', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async () => {
        try {
          const r = await fetch(API+'/orgs/'+org.id+'/bills/'+id, { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
          const j = await r.json();
          if (j.success) { setShowBillDetail(false); loadBills(org.id, token); Alert.alert('Deleted', 'Bill removed'); }
          else Alert.alert('Error', j.message || 'Failed');
        } catch(e) { Alert.alert('Error', 'Cannot connect'); }
      }}
    ]);
  }

  function editInvoice(inv) {
    setSelectedInvoice(inv);
    setInvoiceForm({ clientName: inv.contact?.name||'', clientEmail: inv.contact?.email||'', poNumber: inv.poNumber||'', notes: inv.notes||'', taxRate: inv.taxRate||'', shipping: inv.shipping||'', discount: inv.discount||'' });
    setLines(inv.lines?.length ? inv.lines.map(l => ({ description: l.description, quantity: String(l.quantity), unitPrice: String(l.unitPrice) })) : [{ description:'', quantity:'1', unitPrice:'' }]);
    setEditingInvoice(true);
    setShowDetail(false);
    setShowInvoice(true);
  }

  function editExpense(exp) {
    setSelectedExpense(exp);
    setExpenseForm({ vendor: exp.vendor||'', amount: String(exp.amount)||'', description: exp.description||'', category: exp.category||'', date: exp.date ? new Date(exp.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10), paymentMethod: exp.paymentMethod||'', receiptNumber: exp.receiptNumber||'' });
    setEditingExpense(true);
    setShowExpenseDetail(false);
    setShowExpense(true);
  }

  function editBill(bill) {
    setSelectedBill(bill);
    setBillForm({ vendor: bill.vendor||'', amount: String(bill.amount)||'', description: bill.description||'' });
    setEditingBill(true);
    setShowBillDetail(false);
    setShowBill(true);
  }

  function fmt(n) { return '$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2}); }

  if (!user) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#2D4A35'}}>
        <ScrollView contentContainerStyle={{flexGrow:1,alignItems:'center',justifyContent:'center',padding:24}}>
          <Text style={{fontSize:32,fontWeight:'700',color:'#A8D4A8',marginBottom:2}}>Mountain Top</Text>
          <Text style={{fontSize:32,fontWeight:'700',color:'#A8D4A8',marginBottom:8}}>Ledger</Text>
          <Text style={{fontSize:14,color:'#7A9A7A',marginBottom:40}}>Built for where you are going</Text>
          <TextInput style={{width:'100%',backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,marginBottom:12}} placeholder="Email" placeholderTextColor="#7A9A7A" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <View style={{width:'100%',marginBottom:20}}>
            <TextInput style={{width:'100%',backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,paddingRight:60}} placeholder="Password" placeholderTextColor="#7A9A7A" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={()=>setShowPassword(p=>!p)} style={{position:'absolute',right:16,top:16}}>
              <Text style={{color:'#7A9A7A',fontSize:14}}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{width:'100%',backgroundColor:'#A8D4A8',borderRadius:12,padding:16,alignItems:'center'}} onPress={login}>
            <Text style={{fontSize:16,fontWeight:'600',color:'#2D4A35'}}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop:16}} onPress={()=>setShowRegister(true)}>
            <Text style={{color:'#7A9A7A',fontSize:14,textAlign:'center'}}>Don't have an account? <Text style={{color:'#A8D4A8'}}>Register</Text></Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal visible={showRegister} animationType="slide" presentationStyle="pageSheet">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#2D4A35'}}>
            <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
                <TouchableOpacity onPress={()=>setShowRegister(false)}>
                  <Text style={{color:'#7A9A7A',fontSize:16}}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{color:'#fff',fontSize:17,fontWeight:'600'}}>Register</Text>
                <TouchableOpacity onPress={register}>
                  <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Save</Text>
                </TouchableOpacity>
              </View>
              <Text style={{fontSize:28,fontWeight:'700',color:'#A8D4A8',marginBottom:4}}>Create account</Text>
              <Text style={{fontSize:14,color:'#7A9A7A',marginBottom:32}}>Start your free trial today</Text>
              <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>FULL NAME</Text>
              <TextInput style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,marginBottom:16,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.fullName} onChangeText={v=>setRegForm(f=>({...f,fullName:v}))} placeholder="Jane Smith" placeholderTextColor="#7A9A7A" />
              <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>COMPANY NAME</Text>
              <TextInput style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,marginBottom:16,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.orgName} onChangeText={v=>setRegForm(f=>({...f,orgName:v}))} placeholder="Acme Co." placeholderTextColor="#7A9A7A" />
              <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>EMAIL</Text>
              <TextInput style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,marginBottom:16,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.email} onChangeText={v=>setRegForm(f=>({...f,email:v}))} placeholder="you@company.com" placeholderTextColor="#7A9A7A" keyboardType="email-address" autoCapitalize="none" />
              <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>PASSWORD</Text>
              <View style={{width:'100%',marginBottom:16}}>
                <TextInput style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,paddingRight:60,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.password} onChangeText={v=>setRegForm(f=>({...f,password:v}))} placeholder="Min 8 characters" placeholderTextColor="#7A9A7A" secureTextEntry={!showRegPassword} />
                <TouchableOpacity onPress={()=>setShowRegPassword(p=>!p)} style={{position:'absolute',right:16,top:16}}>
                  <Text style={{color:'#7A9A7A',fontSize:14}}>{showRegPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{height:16}} />
              <TouchableOpacity style={{backgroundColor:'#A8D4A8',borderRadius:12,padding:16,alignItems:'center'}} onPress={register}>
                <Text style={{fontSize:16,fontWeight:'600',color:'#2D4A35'}}>Create Account</Text>
              </TouchableOpacity>
              <Text style={{fontSize:20,fontWeight:'700',color:'#3D5A45',textAlign:'center',marginTop:40,marginBottom:40}}>Mountain Top Ledger</Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  const totalInvoiced = invoices.reduce((s,i)=>s+Number(i.total),0);
  const totalExpenses = expenses.reduce((s,e)=>s+Number(e.amount),0);

  return (
    <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
      <View style={{padding:24,paddingTop:60,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View>
          <Text style={{color:'#7A9A7A',fontSize:14}}>Welcome back,</Text>
          <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>{user.fullName}</Text>
        </View>
        <TouchableOpacity onPress={()=>setUser(null)} style={{backgroundColor:'#3D5A45',borderRadius:8,padding:8,paddingHorizontal:12}}>
          <Text style={{color:'#A8D4A8',fontSize:13}}>Sign out</Text>
        </TouchableOpacity>
      </View>
      <Text style={{color:'#7A9A7A',fontSize:13,paddingHorizontal:24,marginBottom:16}}>{org?.name}</Text>
      <View style={{flexDirection:'row',gap:12,paddingHorizontal:24,marginBottom:24}}>
        <View style={{flex:1,backgroundColor:'#2D4A35',borderRadius:12,padding:16}}>
          <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>TOTAL INVOICED</Text>
          <Text style={{color:'#A8D4A8',fontSize:20,fontWeight:'700'}}>{fmt(totalInvoiced)}</Text>
          <Text style={{color:'#7A9A7A',fontSize:11,marginTop:4}}>{invoices.length} invoices</Text>
        </View>
        <View style={{flex:1,backgroundColor:'#2D4A35',borderRadius:12,padding:16}}>
          <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>TOTAL EXPENSES</Text>
          <Text style={{color:'#A8D4A8',fontSize:20,fontWeight:'700'}}>{fmt(totalExpenses)}</Text>
          <Text style={{color:'#7A9A7A',fontSize:11,marginTop:4}}>{expenses.length} expenses</Text>
        </View>
      </View>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#2D4A35',borderRadius:12,padding:16,alignItems:'center',marginBottom:12}} onPress={()=>{setEditingInvoice(false);setInvoiceForm({clientName:'',clientEmail:'',poNumber:'',notes:'',taxRate:'',shipping:'',discount:''});setLines([{description:'',quantity:'1',unitPrice:''}]);setShowInvoice(true);}}>
        <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>+ New Invoice</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#3D5A45',borderRadius:12,padding:16,alignItems:'center',marginBottom:12}} onPress={()=>{setEditingExpense(false);setExpenseForm({vendor:'',amount:'',description:''});setShowExpense(true);}}>
        <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>+ Add Expense</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#4A3D2D',borderRadius:12,padding:16,alignItems:'center',marginBottom:12}} onPress={()=>{setEditingBill(false);setBillForm({vendor:'',amount:'',description:''});setShowBill(true);}}>
        <Text style={{color:'#D4A8A8',fontSize:16,fontWeight:'600'}}>+ Add Bill</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#1C3A4A',borderRadius:12,padding:16,alignItems:'center',marginBottom:24}} onPress={()=>setShowReports(true)}>
        <Text style={{color:'#A8C4D4',fontSize:16,fontWeight:'600'}}>View Reports</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#2D3A4A',borderRadius:12,padding:16,alignItems:'center',marginBottom:12}} onPress={()=>setShowCustomers(true)}>
        <Text style={{color:'#A8B4D4',fontSize:16,fontWeight:'600'}}>Customers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#3A2D4A',borderRadius:12,padding:16,alignItems:'center',marginBottom:24}} onPress={()=>setShowVendors(true)}>
        <Text style={{color:'#C4A8D4',fontSize:16,fontWeight:'600'}}>Vendors</Text>
      </TouchableOpacity>

      {invoices.length > 0 && (
        <View style={{paddingHorizontal:24}}>
          <Text style={{color:'#7A9A7A',fontSize:13,fontWeight:'600',marginBottom:12}}>RECENT INVOICES</Text>
          {invoices.slice(0,5).map(inv => (
            <TouchableOpacity key={inv.id} onPress={()=>{setSelectedInvoice(inv);setShowDetail(true);}} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <View>
                <Text style={{color:'#fff',fontWeight:'500'}}>{inv.contact?.name || 'Client'}</Text>
                <Text style={{color:'#7A9A7A',fontSize:12,marginTop:2}}>{inv.invoiceNumber}</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={{color: inv.status==='paid' ? '#A8D4A8' : '#ffd166',fontWeight:'600'}}>{fmt(inv.total)}</Text>
                <Text style={{color:'#7A9A7A',fontSize:11,marginTop:2,textTransform:'capitalize'}}>{inv.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {expenses.length > 0 && (
        <View style={{paddingHorizontal:24,marginTop:16}}>
          <Text style={{color:'#7A9A7A',fontSize:13,fontWeight:'600',marginBottom:12}}>RECENT EXPENSES</Text>
          {expenses.slice(0,5).map(exp => (
            <TouchableOpacity key={exp.id} onPress={()=>{setSelectedExpense(exp);setShowExpenseDetail(true);}} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <View>
                <Text style={{color:'#fff',fontWeight:'500'}}>{exp.vendor}</Text>
                <Text style={{color:'#7A9A7A',fontSize:12,marginTop:2}}>{exp.category}</Text>
              </View>
              <Text style={{color:'#A8D4A8',fontWeight:'600'}}>{fmt(exp.amount)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {bills.length > 0 && (
        <View style={{paddingHorizontal:24,marginTop:16,marginBottom:24}}>
          <Text style={{color:'#7A9A7A',fontSize:13,fontWeight:'600',marginBottom:12}}>RECENT BILLS</Text>
          {bills.slice(0,5).map(bill => (
            <TouchableOpacity key={bill.id} onPress={()=>{setSelectedBill(bill);setShowBillDetail(true);}} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <View>
                <Text style={{color:'#fff',fontWeight:'500'}}>{bill.vendor}</Text>
                <Text style={{color:'#7A9A7A',fontSize:12,marginTop:2}}>{bill.status}</Text>
              </View>
              <Text style={{color:'#D4A8A8',fontWeight:'600'}}>{fmt(bill.amount)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Invoice Detail Modal */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowDetail(false)}>
                <Text style={{color:'#A8D4A8',fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',gap:12}}>
                <TouchableOpacity onPress={()=>editInvoice(selectedInvoice)} style={{backgroundColor:'#2D4A35',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#A8D4A8',fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteInvoice(selectedInvoice.id)} style={{backgroundColor:'#4a1a1a',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#D4A8A8',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedInvoice && (
              <View>
                <Text style={{color:'#fff',fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedInvoice.invoiceNumber}</Text>
                <Text style={{color:'#7A9A7A',fontSize:14,marginBottom:12,textTransform:'capitalize'}}>{selectedInvoice.status}</Text>
                {selectedInvoice.status !== 'paid' && (
                  <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
                    <TouchableOpacity onPress={()=>markInvoicePaid(selectedInvoice.id)} style={{flex:1,backgroundColor:'#1a4a2a',borderRadius:8,padding:12,alignItems:'center'}}>
                      <Text style={{color:'#A8D4A8',fontSize:13,fontWeight:'600'}}>Mark as Paid</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>recordPartialPayment(selectedInvoice)} style={{flex:1,backgroundColor:'#2D3A1A',borderRadius:8,padding:12,alignItems:'center'}}>
                      <Text style={{color:'#ffd166',fontSize:13,fontWeight:'600'}}>Partial Payment</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedInvoice.status !== 'paid' && (
                  <TouchableOpacity onPress={()=>sendInvoice(selectedInvoice.id)} style={{backgroundColor:'#1a2a4a',borderRadius:8,padding:12,alignItems:'center',marginBottom:16}}>
                    <Text style={{color:'#A8C4D4',fontSize:13,fontWeight:'600'}}>Send Invoice by Email</Text>
                  </TouchableOpacity>
                )}
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                  <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>CLIENT</Text>
                  <Text style={{color:'#fff',fontSize:16,fontWeight:'500'}}>{selectedInvoice.contact?.name || 'N/A'}</Text>
                  {selectedInvoice.contact?.email ? <Text style={{color:'#7A9A7A',fontSize:13,marginTop:2}}>{selectedInvoice.contact.email}</Text> : null}
                </View>
                {selectedInvoice.lines?.length > 0 && (
                  <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                    <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:12}}>LINE ITEMS</Text>
                    {selectedInvoice.lines.map((l, i) => (
                      <View key={i} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                        <View style={{flex:1}}>
                          <Text style={{color:'#fff',fontSize:14}}>{l.description}</Text>
                          <Text style={{color:'#7A9A7A',fontSize:12}}>{l.quantity} x {fmt(l.unitPrice)}</Text>
                        </View>
                        <Text style={{color:'#A8D4A8',fontSize:14,fontWeight:'600'}}>{fmt(l.amount)}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                  {Number(selectedInvoice.taxAmount||0) > 0 && (
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                      <Text style={{color:'#7A9A7A',fontSize:14}}>Tax</Text>
                      <Text style={{color:'#fff',fontSize:14}}>{fmt(selectedInvoice.taxAmount)}</Text>
                    </View>
                  )}
                  {Number(selectedInvoice.shipping||0) > 0 && (
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                      <Text style={{color:'#7A9A7A',fontSize:14}}>Shipping</Text>
                      <Text style={{color:'#fff',fontSize:14}}>{fmt(selectedInvoice.shipping)}</Text>
                    </View>
                  )}
                  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Total</Text>
                    <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>{fmt(selectedInvoice.total)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* Expense Detail Modal */}
      <Modal visible={showExpenseDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowExpenseDetail(false)}>
                <Text style={{color:'#A8D4A8',fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',gap:12}}>
                <TouchableOpacity onPress={()=>editExpense(selectedExpense)} style={{backgroundColor:'#2D4A35',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#A8D4A8',fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteExpense(selectedExpense.id)} style={{backgroundColor:'#4a1a1a',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#D4A8A8',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedExpense && (
              <View>
                <Text style={{color:'#fff',fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedExpense.vendor}</Text>
                <Text style={{color:'#7A9A7A',fontSize:14,marginBottom:24,textTransform:'capitalize'}}>{selectedExpense.category}</Text>
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                  <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                  <Text style={{color:'#fff',fontSize:15}}>{selectedExpense.description || 'No description'}</Text>
                </View>
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Amount</Text>
                    <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>{fmt(selectedExpense.amount)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* Bill Detail Modal */}
      <Modal visible={showBillDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowBillDetail(false)}>
                <Text style={{color:'#A8D4A8',fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',gap:12}}>
                <TouchableOpacity onPress={()=>editBill(selectedBill)} style={{backgroundColor:'#2D4A35',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#A8D4A8',fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteBill(selectedBill.id)} style={{backgroundColor:'#4a1a1a',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#D4A8A8',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedBill && (
              <View>
                <Text style={{color:'#fff',fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedBill.vendor}</Text>
                <Text style={{color:'#7A9A7A',fontSize:14,marginBottom:24,textTransform:'capitalize'}}>{selectedBill.status}</Text>
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                  <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                  <Text style={{color:'#fff',fontSize:15}}>{selectedBill.description || 'No description'}</Text>
                </View>
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:'#D4A8A8',fontSize:16,fontWeight:'600'}}>Amount Due</Text>
                    <Text style={{color:'#D4A8A8',fontSize:16,fontWeight:'600'}}>{fmt(selectedBill.amount)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* New Invoice Modal */}
      <Modal visible={showInvoice} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>{setShowInvoice(false);setEditingInvoice(false);}}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:'#fff',fontSize:17,fontWeight:'600'}}>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</Text>
              <TouchableOpacity onPress={saveInvoice}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>

            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CLIENT NAME</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={invoiceForm.clientName} onChangeText={v=>setInvoiceForm(f=>({...f,clientName:v}))} placeholder="Acme Corp" placeholderTextColor="#7A9A7A" />

            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CLIENT EMAIL</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={invoiceForm.clientEmail} onChangeText={v=>setInvoiceForm(f=>({...f,clientEmail:v}))} placeholder="client@example.com" placeholderTextColor="#7A9A7A" keyboardType="email-address" autoCapitalize="none" />

            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>PO / WORK ORDER NUMBER (OPTIONAL)</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:24,borderWidth:1,borderColor:'#3D5A45'}} value={invoiceForm.poNumber} onChangeText={v=>setInvoiceForm(f=>({...f,poNumber:v}))} placeholder="PO-12345" placeholderTextColor="#7A9A7A" />

            <Text style={{color:'#7A9A7A',fontSize:13,fontWeight:'600',marginBottom:12}}>LINE ITEMS</Text>
            {lines.map((line, i) => (
              <View key={i} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,marginBottom:12,borderWidth:1,borderColor:'#3D5A45'}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <Text style={{color:'#7A9A7A',fontSize:11}}>ITEM {i+1}</Text>
                  {lines.length > 1 && (
                    <TouchableOpacity onPress={()=>removeLine(i)}>
                      <Text style={{color:'#D4A8A8',fontSize:13}}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:14,marginBottom:8}} value={line.description} onChangeText={v=>updateLine(i,'description',v)} placeholder="Description" placeholderTextColor="#7A9A7A" />
                <View style={{flexDirection:'row',gap:8}}>
                  <View style={{flex:1}}>
                    <Text style={{color:'#7A9A7A',fontSize:10,marginBottom:4}}>QTY</Text>
                    <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:14}} value={line.quantity} onChangeText={v=>updateLine(i,'quantity',v)} keyboardType="decimal-pad" />
                  </View>
                  <View style={{flex:2}}>
                    <Text style={{color:'#7A9A7A',fontSize:10,marginBottom:4}}>UNIT PRICE ($)</Text>
                    <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:14}} value={line.unitPrice} onChangeText={v=>updateLine(i,'unitPrice',v)} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                  </View>
                  <View style={{flex:1.5,justifyContent:'flex-end'}}>
                    <Text style={{color:'#A8D4A8',fontSize:14,fontWeight:'600',textAlign:'right',padding:12}}>{fmt(Number(line.quantity||0)*Number(line.unitPrice||0))}</Text>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addLine} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,alignItems:'center',marginBottom:24,borderWidth:1,borderColor:'#3D5A45',borderStyle:'dashed'}}>
              <Text style={{color:'#A8D4A8',fontSize:14}}>+ Add Line Item</Text>
            </TouchableOpacity>

            <View style={{backgroundColor:'#2D4A35',borderRadius:10,padding:16,marginBottom:16}}>
              <View style={{flexDirection:'row',gap:12,marginBottom:12}}>
                <View style={{flex:1}}>
                  <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>TAX RATE (%)</Text>
                  <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:14}} value={invoiceForm.taxRate} onChangeText={v=>setInvoiceForm(f=>({...f,taxRate:v}))} placeholder="0" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                </View>
                <View style={{flex:1}}>
                  <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>SHIPPING ($)</Text>
                  <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:14}} value={invoiceForm.shipping} onChangeText={v=>setInvoiceForm(f=>({...f,shipping:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                </View>
                <View style={{flex:1}}>
                  <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DISCOUNT ($)</Text>
                  <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:14}} value={invoiceForm.discount} onChangeText={v=>setInvoiceForm(f=>({...f,discount:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                </View>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:12,borderTopWidth:1,borderTopColor:'#3D5A45'}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'700'}}>Total</Text>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'700'}}>{fmt(invoiceTotal())}</Text>
              </View>
            </View>

            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>NOTES (OPTIONAL)</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:24,borderWidth:1,borderColor:'#3D5A45',minHeight:80}} value={invoiceForm.notes} onChangeText={v=>setInvoiceForm(f=>({...f,notes:v}))} placeholder="Payment terms, special instructions..." placeholderTextColor="#7A9A7A" multiline />

          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Expense Modal */}
      <Modal visible={showExpense} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>{setShowExpense(false);setEditingExpense(false);}}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:'#fff',fontSize:17,fontWeight:'600'}}>{editingExpense ? 'Edit Expense' : 'New Expense'}</Text>
              <TouchableOpacity onPress={saveExpense}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.vendor} onChangeText={v=>setExpenseForm(f=>({...f,vendor:v}))} placeholder="Amazon" placeholderTextColor="#7A9A7A" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CATEGORY</Text>
            <TouchableOpacity onPress={()=>setShowExpenseCategoryPicker(true)} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:'#3D5A45',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:expenseForm.category?'#fff':'#7A9A7A',fontSize:15}}>{expenseForm.category||'Select category...'}</Text>
              <Text style={{color:'#7A9A7A',fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showExpenseCategoryPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowExpenseCategoryPicker(false)} />
              <View style={{backgroundColor:'#1E3A28',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Category</Text>
                <ScrollView>
                  {['Advertising & Marketing','Bank Charges','Equipment','Insurance','Legal & Professional Fees','Meals & Entertainment','Office Supplies','Payroll','Rent & Lease','Software & Subscriptions','Taxes & Licenses','Travel','Utilities','Vehicle','Other'].map(cat=>(
                    <TouchableOpacity key={cat} onPress={()=>{setExpenseForm(f=>({...f,category:cat}));setShowExpenseCategoryPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:'#3D5A45',backgroundColor:expenseForm.category===cat?'#3D5A45':'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:expenseForm.category===cat?'#A8D4A8':'#fff',fontSize:15}}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>AMOUNT ($)</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.amount} onChangeText={v=>setExpenseForm(f=>({...f,amount:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DATE</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.date} onChangeText={v=>setExpenseForm(f=>({...f,date:v}))} placeholder="YYYY-MM-DD" placeholderTextColor="#7A9A7A" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>PAYMENT METHOD</Text>
            <TouchableOpacity onPress={()=>setShowPaymentMethodPicker(true)} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:'#3D5A45',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:expenseForm.paymentMethod?'#fff':'#7A9A7A',fontSize:15}}>{expenseForm.paymentMethod||'Select payment method...'}</Text>
              <Text style={{color:'#7A9A7A',fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showPaymentMethodPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowPaymentMethodPicker(false)} />
              <View style={{backgroundColor:'#1E3A28',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Payment Method</Text>
                <ScrollView>
                  {['Cash','Check','Credit Card','Debit Card','ACH / Bank Transfer','Wire Transfer','PayPal','Venmo','Zelle','Other'].map(pm=>(
                    <TouchableOpacity key={pm} onPress={()=>{setExpenseForm(f=>({...f,paymentMethod:pm}));setShowPaymentMethodPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:'#3D5A45',backgroundColor:expenseForm.paymentMethod===pm?'#3D5A45':'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:expenseForm.paymentMethod===pm?'#A8D4A8':'#fff',fontSize:15}}>{pm}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>RECEIPT NUMBER</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.receiptNumber} onChangeText={v=>setExpenseForm(f=>({...f,receiptNumber:v}))} placeholder="REC-001 (optional)" placeholderTextColor="#7A9A7A" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.description} onChangeText={v=>setExpenseForm(f=>({...f,description:v}))} placeholder="Office supplies" placeholderTextColor="#7A9A7A" />
            <TouchableOpacity onPress={()=>{setShowExpense(false);setEditingExpense(false);}} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,alignItems:'center',marginTop:8}}>
              <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Bill Modal */}
      <Modal visible={showBill} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>{setShowBill(false);setEditingBill(false);}}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:'#fff',fontSize:17,fontWeight:'600'}}>{editingBill ? 'Edit Bill' : 'New Bill'}</Text>
              <TouchableOpacity onPress={saveBill}>
                <Text style={{color:'#D4A8A8',fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.vendor} onChangeText={v=>setBillForm(f=>({...f,vendor:v}))} placeholder="Landlord" placeholderTextColor="#7A9A7A" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CATEGORY</Text>
            <TouchableOpacity onPress={()=>setShowBillCategoryPicker(true)} style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:'#3D5A45',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:billForm.category?'#fff':'#7A9A7A',fontSize:15}}>{billForm.category||'Select category...'}</Text>
              <Text style={{color:'#7A9A7A',fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showBillCategoryPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowBillCategoryPicker(false)} />
              <View style={{backgroundColor:'#1E3A28',borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Category</Text>
                <ScrollView>
                  {['Rent & Lease','Utilities','Insurance','Loan Payment','Supplier Invoice','Equipment Lease','Professional Services','Payroll','Taxes','Software & Subscriptions','Other'].map(cat=>(
                    <TouchableOpacity key={cat} onPress={()=>{setBillForm(f=>({...f,category:cat}));setShowBillCategoryPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:'#3D5A45',backgroundColor:billForm.category===cat?'#3D5A45':'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:billForm.category===cat?'#A8D4A8':'#fff',fontSize:15}}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>AMOUNT ($)</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.amount} onChangeText={v=>setBillForm(f=>({...f,amount:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.description} onChangeText={v=>setBillForm(f=>({...f,description:v}))} placeholder="Monthly rent" placeholderTextColor="#7A9A7A" />
            <TouchableOpacity onPress={()=>{setShowBill(false);setEditingBill(false);}} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,alignItems:'center',marginTop:8}}>
              <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Reports Modal */}
      <Modal visible={showReports} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <TouchableOpacity onPress={()=>setShowReports(false)} style={{marginBottom:24}}>
              <Text style={{color:'#A8D4A8',fontSize:16}}>Close</Text>
            </TouchableOpacity>
            <Text style={{color:'#fff',fontSize:28,fontWeight:'700',marginBottom:4}}>Reports</Text>
            <Text style={{color:'#7A9A7A',fontSize:14,marginBottom:32}}>Financial summary</Text>
            <Text style={{color:'#7A9A7A',fontSize:13,fontWeight:'600',marginBottom:12}}>INCOME</Text>
            <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:12}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:12}}>
                <Text style={{color:'#7A9A7A',fontSize:14}}>Total Invoiced</Text>
                <Text style={{color:'#A8D4A8',fontSize:14,fontWeight:'600'}}>{fmt(invoices.reduce((s,i)=>s+Number(i.total),0))}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:12}}>
                <Text style={{color:'#7A9A7A',fontSize:14}}>Total Paid</Text>
                <Text style={{color:'#A8D4A8',fontSize:14,fontWeight:'600'}}>{fmt(invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.total),0))}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={{color:'#7A9A7A',fontSize:14}}>Outstanding</Text>
                <Text style={{color:'#ffd166',fontSize:14,fontWeight:'600'}}>{fmt(invoices.filter(i=>i.status!=='paid').reduce((s,i)=>s+Number(i.total),0))}</Text>
              </View>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:13,fontWeight:'600',marginBottom:12,marginTop:8}}>EXPENSES</Text>
            <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:12}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:12}}>
                <Text style={{color:'#7A9A7A',fontSize:14}}>Total Expenses</Text>
                <Text style={{color:'#D4A8A8',fontSize:14,fontWeight:'600'}}>{fmt(expenses.reduce((s,e)=>s+Number(e.amount),0))}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={{color:'#7A9A7A',fontSize:14}}>Total Bills</Text>
                <Text style={{color:'#D4A8A8',fontSize:14,fontWeight:'600'}}>{fmt(bills.reduce((s,b)=>s+Number(b.amount),0))}</Text>
              </View>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:13,fontWeight:'600',marginBottom:12,marginTop:8}}>SUMMARY</Text>
            <View style={{backgroundColor:'#1a3a2a',borderRadius:12,padding:20,marginBottom:24,borderWidth:1,borderColor:'#2D4A35'}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:12}}>
                <Text style={{color:'#7A9A7A',fontSize:14}}>Total Revenue (Paid)</Text>
                <Text style={{color:'#A8D4A8',fontSize:14,fontWeight:'600'}}>{fmt(invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.total),0))}</Text>
              </View>
              <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:12}}>
                <Text style={{color:'#7A9A7A',fontSize:14}}>Total Expenses</Text>
                <Text style={{color:'#D4A8A8',fontSize:14,fontWeight:'600'}}>{fmt(expenses.reduce((s,e)=>s+Number(e.amount),0))}</Text>
              </View>
              <View style={{height:1,backgroundColor:'#2D4A35',marginBottom:12}}/>
              <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={{color:'#fff',fontSize:16,fontWeight:'700'}}>Net Income</Text>
                <Text style={{color:'#ffd166',fontSize:16,fontWeight:'700'}}>{fmt(invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.total),0) - expenses.reduce((s,e)=>s+Number(e.amount),0))}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
      {/* Customers Modal */}
      <Modal visible={showCustomers} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>Customers</Text>
              <TouchableOpacity onPress={()=>setShowCustomers(false)}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:13,marginBottom:16}}>{customers.length} customer{customers.length!==1?'s':''}</Text>
            <TouchableOpacity onPress={()=>{setCustomerForm({name:'',email:'',phone:'',salesperson:''});setEditingCustomer(null);setShowCustomerForm(true);}} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:14,alignItems:'center',marginBottom:16}}>
              <Text style={{color:'#A8D4A8',fontSize:15,fontWeight:'600'}}>+ Add Customer</Text>
            </TouchableOpacity>
            {showCustomerForm&&(
              <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:16}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600',marginBottom:12}}>{editingCustomer?'Edit Customer':'New Customer'}</Text>
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>NAME *</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:10,borderWidth:1,borderColor:'#3D5A45'}} value={customerForm.name} onChangeText={v=>setCustomerForm(f=>({...f,name:v}))} placeholder='Acme Corp' placeholderTextColor='#7A9A7A' />
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>EMAIL</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:10,borderWidth:1,borderColor:'#3D5A45'}} value={customerForm.email} onChangeText={v=>setCustomerForm(f=>({...f,email:v}))} placeholder='billing@acme.com' placeholderTextColor='#7A9A7A' keyboardType='email-address' />
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>PHONE</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:10,borderWidth:1,borderColor:'#3D5A45'}} value={customerForm.phone} onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setCustomerForm(f=>({...f,phone:p}));}} placeholder='(555) 000-0000' placeholderTextColor='#7A9A7A' keyboardType='phone-pad' />
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>SALESPERSON</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={customerForm.salesperson} onChangeText={v=>setCustomerForm(f=>({...f,salesperson:v}))} placeholder='Jane Smith' placeholderTextColor='#7A9A7A' />
                <View style={{flexDirection:'row',gap:10}}>
                  <TouchableOpacity onPress={()=>setShowCustomerForm(false)} style={{flex:1,backgroundColor:'#3D5A45',borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:'#A8D4A8',fontSize:14}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={async()=>{
                    if(!customerForm.name.trim())return Alert.alert('Error','Name is required');
                    try{
                      if(editingCustomer){
                        await fetch(API+'/orgs/'+org.id+'/contacts/'+editingCustomer.id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...customerForm,type:'customer'})});
                      }else{
                        await fetch(API+'/orgs/'+org.id+'/contacts',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...customerForm,type:'customer'})});
                      }
                      setShowCustomerForm(false);
                      loadCustomers(org.id,token);
                    }catch(e){Alert.alert('Error','Could not save customer');}
                  }} style={{flex:2,backgroundColor:'#2D6A4F',borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:'#fff',fontSize:14,fontWeight:'600'}}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {customers.map(c=>(
              <View key={c.id} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:12}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:'#fff',fontSize:16,fontWeight:'600'}}>{c.name}</Text>
                  <TouchableOpacity onPress={()=>{setCustomerForm({name:c.name||'',email:c.email||'',phone:c.phone||'',salesperson:c.salesperson||''});setEditingCustomer(c);setShowCustomerForm(true);}}>
                    <Text style={{color:'#7A9A7A',fontSize:13}}>Edit</Text>
                  </TouchableOpacity>
                </View>
                {c.email?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:4}}>{c.email}</Text>:null}
                {c.phone?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:2}}>{c.phone}</Text>:null}
                {c.salesperson?<Text style={{color:'#7A9A7A',fontSize:12,marginTop:4}}>Rep: {c.salesperson}</Text>:null}
              </View>
            ))}
            {customers.length===0&&<Text style={{color:'#7A9A7A',textAlign:'center',marginTop:40}}>No customers yet</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Vendors Modal */}
      <Modal visible={showVendors} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <ScrollView contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>Vendors</Text>
              <TouchableOpacity onPress={()=>setShowVendors(false)}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:13,marginBottom:16}}>{vendors.length} vendor{vendors.length!==1?'s':''}</Text>
            <TouchableOpacity onPress={()=>{setVendorForm({name:'',email:'',phone:''});setEditingVendor(null);setShowVendorForm(true);}} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:14,alignItems:'center',marginBottom:16}}>
              <Text style={{color:'#A8D4A8',fontSize:15,fontWeight:'600'}}>+ Add Vendor</Text>
            </TouchableOpacity>
            {showVendorForm&&(
              <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:16}}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600',marginBottom:12}}>{editingVendor?'Edit Vendor':'New Vendor'}</Text>
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>NAME *</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:10,borderWidth:1,borderColor:'#3D5A45'}} value={vendorForm.name} onChangeText={v=>setVendorForm(f=>({...f,name:v}))} placeholder='Vendor Name' placeholderTextColor='#7A9A7A' />
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>EMAIL</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:10,borderWidth:1,borderColor:'#3D5A45'}} value={vendorForm.email} onChangeText={v=>setVendorForm(f=>({...f,email:v}))} placeholder='vendor@example.com' placeholderTextColor='#7A9A7A' keyboardType='email-address' />
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>PHONE</Text>
                <TextInput style={{backgroundColor:'#1C2E1C',borderRadius:8,padding:12,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={vendorForm.phone} onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setVendorForm(f=>({...f,phone:p}));}} placeholder='(555) 000-0000' placeholderTextColor='#7A9A7A' keyboardType='phone-pad' />
                <View style={{flexDirection:'row',gap:10}}>
                  <TouchableOpacity onPress={()=>setShowVendorForm(false)} style={{flex:1,backgroundColor:'#3D5A45',borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:'#A8D4A8',fontSize:14}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={async()=>{
                    if(!vendorForm.name.trim())return Alert.alert('Error','Name is required');
                    try{
                      if(editingVendor){
                        await fetch(API+'/orgs/'+org.id+'/contacts/'+editingVendor.id,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...vendorForm,type:'vendor'})});
                      }else{
                        await fetch(API+'/orgs/'+org.id+'/contacts',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({...vendorForm,type:'vendor'})});
                      }
                      setShowVendorForm(false);
                      loadVendors(org.id,token);
                    }catch(e){Alert.alert('Error','Could not save vendor');}
                  }} style={{flex:2,backgroundColor:'#2D6A4F',borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:'#fff',fontSize:14,fontWeight:'600'}}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {vendors.map(v=>(
              <View key={v.id} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:12}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:'#fff',fontSize:16,fontWeight:'600'}}>{v.name}</Text>
                  <TouchableOpacity onPress={()=>{setVendorForm({name:v.name||'',email:v.email||'',phone:v.phone||''});setEditingVendor(v);setShowVendorForm(true);}}>
                    <Text style={{color:'#7A9A7A',fontSize:13}}>Edit</Text>
                  </TouchableOpacity>
                </View>
                {v.email?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:4}}>{v.email}</Text>:null}
                {v.phone?<Text style={{color:'#7A9A7A',fontSize:13,marginTop:2}}>{v.phone}</Text>:null}
              </View>
            ))}
            {vendors.length===0&&<Text style={{color:'#7A9A7A',textAlign:'center',marginTop:40}}>No vendors yet</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}




















