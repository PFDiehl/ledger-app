import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Modal } from 'react-native';

const API = 'https://ledger-accounting-production.up.railway.app/api';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [token, setToken] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ clientName:'', clientEmail:'', description:'', quantity:'1', price:'' });
  const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'' });
  const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'' });

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
      } else Alert.alert('Error', 'Invalid credentials');
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

  async function loadBills(orgId, tok) {
    try {
      const r = await fetch(API+'/orgs/'+orgId+'/bills', { headers:{'Authorization':'Bearer '+tok} });
      const j = await r.json();
      if (j.success) setBills(j.data);
    } catch(e) {}
  }

  async function saveInvoice() {
    if (!form.clientName || !form.price) return Alert.alert('Error', 'Fill in client name and price');
    try {
      const r = await fetch(API+'/orgs/'+org.id+'/invoices', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify(form)
      });
      const j = await r.json();
      if (j.success) {
        setShowInvoice(false);
        setForm({ clientName:'', clientEmail:'', description:'', quantity:'1', price:'' });
        loadInvoices(org.id, token);
        Alert.alert('Saved!', 'Invoice created');
      } else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function saveExpense() {
    if (!expenseForm.vendor || !expenseForm.amount) return Alert.alert('Error', 'Fill in vendor and amount');
    try {
      const r = await fetch(API+'/orgs/'+org.id+'/expenses', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify(expenseForm)
      });
      const j = await r.json();
      if (j.success) {
        setShowExpense(false);
        setExpenseForm({ vendor:'', amount:'', description:'' });
        loadExpenses(org.id, token);
        Alert.alert('Saved!', 'Expense recorded');
      } else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function saveBill() {
    if (!billForm.vendor || !billForm.amount) return Alert.alert('Error', 'Fill in vendor and amount');
    try {
      const r = await fetch(API+'/orgs/'+org.id+'/bills', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify(billForm)
      });
      const j = await r.json();
      if (j.success) {
        setShowBill(false);
        setBillForm({ vendor:'', amount:'', description:'' });
        loadBills(org.id, token);
        Alert.alert('Saved!', 'Bill recorded');
      } else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  function fmt(n) { return '$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2}); }

  if (!user) {
    return (
      <View style={{flex:1,backgroundColor:'#2D4A35',alignItems:'center',justifyContent:'center',padding:24}}>
        <Text style={{fontSize:42,fontWeight:'700',color:'#A8D4A8',marginBottom:8}}>Ledger</Text>
        <Text style={{fontSize:14,color:'#7A9A7A',marginBottom:40}}>Small business accounting</Text>
        <TextInput style={{width:'100%',backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,marginBottom:12}} placeholder="Email" placeholderTextColor="#7A9A7A" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={{width:'100%',backgroundColor:'#3D5A45',borderRadius:12,padding:16,color:'#fff',fontSize:16,marginBottom:20}} placeholder="Password" placeholderTextColor="#7A9A7A" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={{width:'100%',backgroundColor:'#A8D4A8',borderRadius:12,padding:16,alignItems:'center'}} onPress={login}>
          <Text style={{fontSize:16,fontWeight:'600',color:'#2D4A35'}}>Sign in</Text>
        </TouchableOpacity>
      </View>
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
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#2D4A35',borderRadius:12,padding:16,alignItems:'center',marginBottom:12}} onPress={()=>setShowInvoice(true)}>
        <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>+ New Invoice</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#3D5A45',borderRadius:12,padding:16,alignItems:'center',marginBottom:12}} onPress={()=>setShowExpense(true)}>
        <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>+ Add Expense</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{marginHorizontal:24,backgroundColor:'#4A3D2D',borderRadius:12,padding:16,alignItems:'center',marginBottom:24}} onPress={()=>setShowBill(true)}>
        <Text style={{color:'#D4A8A8',fontSize:16,fontWeight:'600'}}>+ Add Bill</Text>
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
                <Text style={{color:'#A8D4A8',fontWeight:'600'}}>{fmt(inv.total)}</Text>
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
            <View key={bill.id} style={{backgroundColor:'#2D4A35',borderRadius:12,padding:16,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <View>
                <Text style={{color:'#fff',fontWeight:'500'}}>{bill.vendor}</Text>
                <Text style={{color:'#7A9A7A',fontSize:12,marginTop:2}}>{bill.status}</Text>
              </View>
              <Text style={{color:'#D4A8A8',fontWeight:'600'}}>{fmt(bill.amount)}</Text>
            </View>
          ))}
        </View>
      )}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <TouchableOpacity onPress={()=>setShowDetail(false)} style={{marginBottom:24}}>
              <Text style={{color:'#A8D4A8',fontSize:16}}>Close</Text>
            </TouchableOpacity>
            {selectedInvoice && (
              <View>
                <Text style={{color:'#fff',fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedInvoice.invoiceNumber}</Text>
                <Text style={{color:'#7A9A7A',fontSize:14,marginBottom:24,textTransform:'capitalize'}}>{selectedInvoice.status}</Text>
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
                  <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:4}}>CLIENT</Text>
                  <Text style={{color:'#fff',fontSize:16,fontWeight:'500'}}>{selectedInvoice.contact?.name || 'N/A'}</Text>
                </View>
                <View style={{backgroundColor:'#2D4A35',borderRadius:12,padding:20,marginBottom:16}}>
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
      <Modal visible={showExpenseDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <TouchableOpacity onPress={()=>setShowExpenseDetail(false)} style={{marginBottom:24}}>
              <Text style={{color:'#A8D4A8',fontSize:16}}>Close</Text>
            </TouchableOpacity>
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
      <Modal visible={showInvoice} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>setShowInvoice(false)}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:'#fff',fontSize:17,fontWeight:'600'}}>New Invoice</Text>
              <TouchableOpacity onPress={saveInvoice}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CLIENT NAME</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={form.clientName} onChangeText={v=>setForm(f=>({...f,clientName:v}))} placeholder="Acme Corp" placeholderTextColor="#7A9A7A" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>CLIENT EMAIL</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={form.clientEmail} onChangeText={v=>setForm(f=>({...f,clientEmail:v}))} placeholder="client@example.com" placeholderTextColor="#7A9A7A" keyboardType="email-address" autoCapitalize="none" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={form.description} onChangeText={v=>setForm(f=>({...f,description:v}))} placeholder="Services rendered" placeholderTextColor="#7A9A7A" />
            <View style={{flexDirection:'row',gap:12,marginBottom:16}}>
              <View style={{flex:1}}>
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>QUANTITY</Text>
                <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,borderWidth:1,borderColor:'#3D5A45'}} value={form.quantity} onChangeText={v=>setForm(f=>({...f,quantity:v}))} keyboardType="numeric" />
              </View>
              <View style={{flex:1}}>
                <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>PRICE ($)</Text>
                <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,borderWidth:1,borderColor:'#3D5A45'}} value={form.price} onChangeText={v=>setForm(f=>({...f,price:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
              </View>
            </View>
            <TouchableOpacity onPress={()=>setShowInvoice(false)} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,alignItems:'center',marginTop:8}}>
              <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
      <Modal visible={showExpense} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>setShowExpense(false)}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:'#fff',fontSize:17,fontWeight:'600'}}>New Expense</Text>
              <TouchableOpacity onPress={saveExpense}>
                <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.vendor} onChangeText={v=>setExpenseForm(f=>({...f,vendor:v}))} placeholder="Amazon" placeholderTextColor="#7A9A7A" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>AMOUNT ($)</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.amount} onChangeText={v=>setExpenseForm(f=>({...f,amount:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={expenseForm.description} onChangeText={v=>setExpenseForm(f=>({...f,description:v}))} placeholder="Office supplies" placeholderTextColor="#7A9A7A" />
            <TouchableOpacity onPress={()=>setShowExpense(false)} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,alignItems:'center',marginTop:8}}>
              <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
      <Modal visible={showBill} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#1C2E1C'}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>setShowBill(false)}>
                <Text style={{color:'#7A9A7A',fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:'#fff',fontSize:17,fontWeight:'600'}}>New Bill</Text>
              <TouchableOpacity onPress={saveBill}>
                <Text style={{color:'#D4A8A8',fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.vendor} onChangeText={v=>setBillForm(f=>({...f,vendor:v}))} placeholder="Landlord" placeholderTextColor="#7A9A7A" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>AMOUNT ($)</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.amount} onChangeText={v=>setBillForm(f=>({...f,amount:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
            <Text style={{color:'#7A9A7A',fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:'#2D4A35',borderRadius:10,padding:14,color:'#fff',fontSize:15,marginBottom:16,borderWidth:1,borderColor:'#3D5A45'}} value={billForm.description} onChangeText={v=>setBillForm(f=>({...f,description:v}))} placeholder="Monthly rent" placeholderTextColor="#7A9A7A" />
            <TouchableOpacity onPress={()=>setShowBill(false)} style={{backgroundColor:'#3D5A45',borderRadius:12,padding:16,alignItems:'center',marginTop:8}}>
              <Text style={{color:'#A8D4A8',fontSize:16,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}
