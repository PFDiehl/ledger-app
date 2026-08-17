import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform, Image } from 'react-native';

const API = 'https://ledger-accounting-production.up.railway.app/api';

// Keep a record only if its date falls in the selected reporting period
function inPeriod(dateVal, period) {
  if (!dateVal || period === 'all') return true;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  if (period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === 'ytd')   return d.getFullYear() === now.getFullYear();
  return true;
}

const EXPENSE_CATEGORIES = ['Advertising & Marketing','Bank Charges','Equipment','Insurance','Legal & Professional Fees','Meals & Entertainment','Office Supplies','Payroll','Rent & Lease','Software & Subscriptions','Taxes & Licenses','Travel','Utilities','Vehicle','Other'];

// Recurring schedule options (stored on-device)
const FREQUENCIES = [
  { key:'', label:'One-time (does not repeat)' },
  { key:'weekly', label:'Weekly' },
  { key:'biweekly', label:'Every 2 weeks' },
  { key:'monthly', label:'Monthly' },
  { key:'quarterly', label:'Quarterly' },
  { key:'yearly', label:'Yearly' },
];
const freqLabel = (k) => (FREQUENCIES.find(f=>f.key===k)?.label) || '';
// Advance a YYYY-MM-DD date string by one interval of the given frequency
function advanceDate(dateStr, freq) {
  const base = dateStr && !isNaN(new Date(dateStr+'T12:00:00')) ? new Date(dateStr+'T12:00:00') : new Date();
  const d = new Date(base);
  if (freq==='weekly') d.setDate(d.getDate()+7);
  else if (freq==='biweekly') d.setDate(d.getDate()+14);
  else if (freq==='monthly') d.setMonth(d.getMonth()+1);
  else if (freq==='quarterly') d.setMonth(d.getMonth()+3);
  else if (freq==='yearly') d.setFullYear(d.getFullYear()+1);
  else return dateStr;
  return d.toISOString().slice(0,10);
}
const BILL_CATEGORIES = ['Rent & Lease','Utilities','Insurance','Loan Payment','Supplier Invoice','Equipment Lease','Professional Services','Payroll','Taxes','Software & Subscriptions','Other'];

// App color themes. O = Original forest green (default), B = Evergreen (light), C = Slate (premium dark).
const THEMES = {
  O: { key:'O', name:'Original',  bg:'#1c2e1c', card:'#2d4a35', border:'rgba(255,255,255,0.06)', text:'#FFFFFF', sub:'#7a9a7a', accent:'#a8d4a8', gold:'#FFD166', chip:'#3d5a45', danger:'#d4a8a8', input:'#1c2e1c' },
  B: { key:'B', name:'Evergreen', bg:'#F4F1E9', card:'#FFFFFF', border:'rgba(0,0,0,0.08)',       text:'#18271C', sub:'#6B7A6B', accent:'#2D7A4A', gold:'#B9852B', chip:'#EAE6DA', danger:'#B4472D', input:'#F0EEE6' },
  C: { key:'C', name:'Slate',     bg:'#16181D', card:'#21252C', border:'rgba(255,255,255,0.07)', text:'#FFFFFF', sub:'#9AA3AE', accent:'#5FCF9A', gold:'#E8B94A', chip:'#2A2F38', danger:'#E5928A', input:'#16181D' },
};

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
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [showExpenseList, setShowExpenseList] = useState(false);
  const [showBillList, setShowBillList] = useState(false);
  const [pendingInvoiceNav, setPendingInvoiceNav] = useState(null);
  const [pendingExpenseNav, setPendingExpenseNav] = useState(null);
  const [pendingBillNav, setPendingBillNav] = useState(null);
  const [themeKey, setThemeKey] = useState('O');
  const t = THEMES[themeKey] || THEMES.O;
  useEffect(() => { AsyncStorage.getItem('themeKey').then(v => { if (v && THEMES[v]) setThemeKey(v); }).catch(()=>{}); }, []);
  useEffect(() => { AsyncStorage.getItem('recurringRules').then(v => { if (v) { try { setRecurringRules(JSON.parse(v)||[]); } catch(e){} } }).catch(()=>{}); }, []);
  useEffect(() => {
    if (!org || !token || recurringChecked.current || !recurringRules.length) return;
    recurringChecked.current = true;
    setTimeout(() => { checkRecurringDue(); }, 900);
  }, [org, token, recurringRules]);
  const [showRegister, setShowRegister] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('ytd');
  const [showExpenseCategoryPicker, setShowExpenseCategoryPicker] = useState(false);
  const [showBillCategoryPicker, setShowBillCategoryPicker] = useState(false);
  const [billDatePickerVisible, setBillDatePickerVisible] = useState(false);
  const [invoiceDatePickerVisible, setInvoiceDatePickerVisible] = useState(false);
  const [invoiceDueDatePickerVisible, setInvoiceDueDatePickerVisible] = useState(false);
  const [invCalYear, setInvCalYear] = useState(new Date().getFullYear());
  const [invCalMonth, setInvCalMonth] = useState(new Date().getMonth());
  const [invDueCalYear, setInvDueCalYear] = useState(new Date().getFullYear());
  const [invDueCalMonth, setInvDueCalMonth] = useState(new Date().getMonth());
  const [billCalViewYear, setBillCalViewYear] = useState(new Date().getFullYear());
  const [billCalViewMonth, setBillCalViewMonth] = useState(new Date().getMonth());
  const [billDueDatePickerVisible, setBillDueDatePickerVisible] = useState(false);
  const [billDueCalViewYear, setBillDueCalViewYear] = useState(new Date().getFullYear());
  const [billDueCalViewMonth, setBillDueCalViewMonth] = useState(new Date().getMonth());
  const [showCustomers, setShowCustomers] = useState(false);
  const [showVendors, setShowVendors] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [customerForm, setCustomerForm] = useState({ name:'', company:'', contactName:'', email:'', phone:'', cellPhone:'', officePhone:'', salesperson:'', notes:'', dateAdded:new Date().toISOString().slice(0,10), lastContact:'' });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [vendorForm, setVendorForm] = useState({ name:'', email:'', phone:'', notes:'', dateAdded:new Date().toISOString().slice(0,10), lastContact:'' });
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorDetail, setShowVendorDetail] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [bills, setBills] = useState([]);
  const [lines, setLines] = useState([{ description:'', quantity:'1', unitPrice:'', service:'', taxable:true }]);
  const [servicePickerLine, setServicePickerLine] = useState(null);
  const [recurringRules, setRecurringRules] = useState([]);
  const [showInvoiceRepeatPicker, setShowInvoiceRepeatPicker] = useState(false);
  const [showBillRepeatPicker, setShowBillRepeatPicker] = useState(false);
  const recurringChecked = React.useRef(false);
  const [invoiceForm, setInvoiceForm] = useState({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'', recurring:'' });
  const [expenseForm, setExpenseForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const pendingReceiptBase64 = React.useRef<string|null>(null);
  const pendingReceiptUrl = React.useRef<string|null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calViewYear, setCalViewYear] = useState(new Date().getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(new Date().getMonth());
  const [billForm, setBillForm] = useState({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), recurring:'' });
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
        const activeOrg = d.orgs?.[0] || d.org;
        setUser(d.user); setOrg(activeOrg); setToken(d.accessToken);
        loadInvoices(activeOrg?.id, d.accessToken);
        loadExpenses(activeOrg?.id, d.accessToken);
        loadBills(activeOrg?.id, d.accessToken);
        loadCustomers(activeOrg?.id, d.accessToken);
        loadVendors(activeOrg?.id, d.accessToken);
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
        const newOrg = d.orgs?.[0] || d.org;
        setUser(d.user); setOrg(newOrg); setToken(d.accessToken);
        setShowRegister(false);
        loadInvoices(newOrg?.id, d.accessToken);
        loadExpenses(newOrg?.id, d.accessToken);
        loadBills(newOrg?.id, d.accessToken);
        loadCustomers(newOrg?.id, d.accessToken);
        loadVendors(newOrg?.id, d.accessToken);
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

  // ---- Recurring schedules (stored on-device) ----
  function persistRules(rules) { setRecurringRules(rules); AsyncStorage.setItem('recurringRules', JSON.stringify(rules)).catch(()=>{}); }
  function ruleForRecord(type, id) { return recurringRules.find(r => r.type===type && r.sourceId===id); }
  // Create/update/remove a rule for a saved record based on chosen frequency
  function upsertRule({ type, sourceId, freq, anchorDate, label, payload }) {
    const others = recurringRules.filter(r => !(r.type===type && r.sourceId===sourceId));
    if (!freq) { persistRules(others); return; }
    const rule = { id: String(Date.now())+'_'+Math.floor(Math.random()*10000), type, sourceId, freq, nextRun: advanceDate(anchorDate, freq), label, payload };
    persistRules([...others, rule]);
  }

  async function generateFromRule(rule) {
    try {
      if (rule.type==='invoice') {
        const body = { ...rule.payload, issueDate: new Date().toISOString().slice(0,10) };
        const r = await fetch(API+'/orgs/'+org.id+'/invoices', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(body) });
        const j = await r.json();
        if (j.success) { loadInvoices(org.id, token); return true; }
      } else {
        const body = { ...rule.payload, dueDate: new Date().toISOString().slice(0,10), date: new Date().toISOString().slice(0,10) };
        const r = await fetch(API+'/orgs/'+org.id+'/bills', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(body) });
        const j = await r.json();
        if (j.success) { loadBills(org.id, token); return true; }
      }
    } catch(e) {}
    return false;
  }

  // On load, ask about each recurring item that's due (one prompt at a time)
  function checkRecurringDue() {
    const today = new Date().toISOString().slice(0,10);
    let working = recurringRules.slice();
    const due = working.filter(r => r.nextRun && r.nextRun <= today);
    if (!due.length) return;
    let idx = 0;
    const advance = (rule) => { working = working.map(r => r.id===rule.id ? { ...r, nextRun: advanceDate(rule.nextRun, rule.freq) } : r); persistRules(working); };
    const next = () => {
      if (idx >= due.length) return;
      const rule = due[idx]; idx++;
      const kind = rule.type==='invoice' ? 'invoice' : 'bill';
      const amt = rule.type==='invoice'
        ? (rule.payload?.lines||[]).reduce((s,l)=>s+Number(l.quantity||0)*Number(l.unitPrice||0),0)
        : Number(rule.payload?.amount||0);
      Alert.alert(
        'Recurring '+kind+' due',
        (rule.label||kind)+' — '+freqLabel(rule.freq)+(amt?(' · '+fmt(amt)):'')+'.\n\nCreate this '+kind+' now?',
        [
          { text:'Create', onPress: async ()=>{ const ok = await generateFromRule(rule); if(ok){ advance(rule); } setTimeout(next, 400); } },
          { text:'Skip this one', onPress: ()=>{ advance(rule); setTimeout(next, 250); } },
          { text:'Later', style:'cancel', onPress: ()=>{ setTimeout(next, 250); } },
        ]
      );
    };
    next();
  }

  function addLine() { setLines(l => [...l, { description:'', quantity:'1', unitPrice:'', service:'', taxable:true }]); }
  function removeLine(i) { setLines(l => l.filter((_, idx) => idx !== i)); }
  function updateLine(i, field, value) { setLines(l => l.map((line, idx) => idx === i ? {...line, [field]: value} : line)); }

  const invoiceTotal = () => {
    const sub = lines.reduce((s, l) => s + (Number(l.quantity||0) * Number(l.unitPrice||0)), 0);
    const taxableSub = lines.reduce((s, l) => s + (l.taxable===false ? 0 : Number(l.quantity||0) * Number(l.unitPrice||0)), 0);
    const tax = taxableSub * (Number(invoiceForm.taxRate||0) / 100);
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
        const recordId = editingInvoice ? selectedInvoice.id : (j.data?.id);
        if (recordId) {
          upsertRule({
            type:'invoice', sourceId: recordId, freq: invoiceForm.recurring,
            anchorDate: invoiceForm.issueDate || new Date().toISOString().slice(0,10),
            label: invoiceForm.clientName,
            payload: { clientName:invoiceForm.clientName, clientEmail:invoiceForm.clientEmail, poNumber:invoiceForm.poNumber, notes:invoiceForm.notes, taxRate:invoiceForm.taxRate, shipping:invoiceForm.shipping, discount:invoiceForm.discount, salesperson:invoiceForm.salesperson||'', lines: lines.map(l=>({description:l.description,quantity:l.quantity,unitPrice:l.unitPrice,service:l.service||'',taxable:l.taxable!==false})) }
          });
        }
        // Auto-create customer if it doesn't exist
        if (!editingInvoice && invoiceForm.clientName) {
          const existingCustomer = customers.find(c => c.name?.toLowerCase() === invoiceForm.clientName.toLowerCase());
          if (!existingCustomer) {
            try {
              await fetch(API+'/orgs/'+org.id+'/contacts', {
                method:'POST',
                headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
                body:JSON.stringify({
                  name: invoiceForm.clientName,
                  email: invoiceForm.clientEmail||'',
                  type: 'customer'
                })
              });
              loadCustomers(org.id, token);
            } catch(e) { console.log('Could not auto-create customer:', e.message); }
          }
        }
        setShowInvoice(false); setEditingInvoice(false);
        setInvoiceForm({ clientName:'', clientEmail:'', poNumber:'', notes:'', taxRate:'', shipping:'', discount:'', issueDate:new Date().toISOString().slice(0,10), dueDate:'', recurring:'' });
        setLines([{ description:'', quantity:'1', unitPrice:'', service:'', taxable:true }]);
        loadInvoices(org.id, token);
        Alert.alert('Saved!', (editingInvoice ? 'Invoice updated' : 'Invoice created') + (invoiceForm.recurring ? '\nRepeats '+freqLabel(invoiceForm.recurring).toLowerCase()+'.' : ''));
      } else Alert.alert('Error', j.message || 'Failed');
    } catch(e) { Alert.alert('Error', 'Cannot connect'); }
  }

  async function saveExpense() {
    if (scanningReceipt) return Alert.alert('Please wait', 'Still scanning your receipt — give it a moment, then tap Save.');
    if (!expenseForm.vendor || !expenseForm.amount) return Alert.alert('Error', 'Fill in vendor and amount');
    const receiptToUpload = pendingReceiptBase64.current; console.log('RECEIPT TO UPLOAD:', !!receiptToUpload, receiptToUpload ? receiptToUpload.slice(0,20) : 'null');
    try {
      const method = editingExpense ? 'PATCH' : 'POST';
      const url = editingExpense ? API+'/orgs/'+org.id+'/expenses/'+selectedExpense.id : API+'/orgs/'+org.id+'/expenses';
      const r = await fetch(url, { method, headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(expenseForm) });
      const j = await r.json();
      if (j.success) {
        setShowExpense(false); setEditingExpense(false);
        setExpenseForm({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), paymentMethod:'', receiptNumber:'' });
        loadExpenses(org.id, token);
        if (pendingReceiptUrl.current && j.data && j.data.id) {
          try {
            await fetch(API+'/orgs/'+org.id+'/expenses/'+j.data.id+'/receipt/url', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify({receiptUrl:pendingReceiptUrl.current}) });
            console.log('Receipt URL saved:', pendingReceiptUrl.current);
          } catch(e) { console.log('Receipt URL save error:', e.message); }
          pendingReceiptUrl.current = null;
        }
        pendingReceiptBase64.current = null;
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
        const recordId = editingBill ? selectedBill.id : (j.data?.id);
        if (recordId) {
          upsertRule({
            type:'bill', sourceId: recordId, freq: billForm.recurring,
            anchorDate: billForm.dueDate || billForm.date || new Date().toISOString().slice(0,10),
            label: billForm.vendor,
            payload: { vendor:billForm.vendor, amount:billForm.amount, description:billForm.description, category:billForm.category }
          });
        }
        setShowBill(false); setEditingBill(false);
        setBillForm({ vendor:'', amount:'', description:'', category:'', date:new Date().toISOString().slice(0,10), recurring:'' });
        loadBills(org.id, token);
        Alert.alert('Saved!', (editingBill ? 'Bill updated' : 'Bill recorded') + (billForm.recurring ? '\nRepeats '+freqLabel(billForm.recurring).toLowerCase()+'.' : ''));
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

  async function setBillStatus(id, status) {
    try {
      const r = await fetch(API+'/orgs/'+org.id+'/bills/'+id, {
        method:'PATCH', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify({status})
      });
      const j = await r.json();
      if (j.success) { setShowBillDetail(false); loadBills(org.id, token); Alert.alert(status==='paid'?'Paid!':'Updated', status==='paid'?'Bill marked as paid':'Bill marked as unpaid'); }
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
          if (j.success) { persistRules(recurringRules.filter(rr=>!(rr.type==='invoice'&&rr.sourceId===id))); setShowDetail(false); loadInvoices(org.id, token); Alert.alert('Deleted', 'Invoice removed'); }
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
          if (j.success) { persistRules(recurringRules.filter(rr=>!(rr.type==='bill'&&rr.sourceId===id))); setShowBillDetail(false); loadBills(org.id, token); Alert.alert('Deleted', 'Bill removed'); }
          else Alert.alert('Error', j.message || 'Failed');
        } catch(e) { Alert.alert('Error', 'Cannot connect'); }
      }}
    ]);
  }

  async function deleteAccount() {
    Alert.alert(
      'Delete Account',
      'This permanently deletes your account and ALL of your data — invoices, bills, expenses, customers, and vendors. This cannot be undone.',
      [
        { text:'Cancel', style:'cancel' },
        { text:'Continue', style:'destructive', onPress: () => {
          Alert.prompt('Confirm your password', 'For your security, enter your password to permanently delete your account.', [
            { text:'Cancel', style:'cancel' },
            { text:'Delete Forever', style:'destructive', onPress: async (pw) => {
              if (!pw) { Alert.alert('Password required', 'Please enter your password to delete your account.'); return; }
              try {
                const r = await fetch(API+'/auth/account', { method:'DELETE', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({ password: pw }) });
                const j = await r.json();
                if (j.success) {
                  AsyncStorage.removeItem('recurringRules').catch(()=>{});
                  setRecurringRules([]);
                  setInvoices([]); setExpenses([]); setBills([]); setCustomers([]); setVendors([]);
                  setToken(null); setOrg(null); setUser(null);
                  Alert.alert('Account deleted', 'Your account and all data have been permanently removed.');
                } else Alert.alert('Could not delete', j.message || 'Please check your password and try again.');
              } catch(e) { Alert.alert('Error', 'Cannot connect. Please try again.'); }
            }}
          ], 'secure-text');
        }}
      ]
    );
  }

  async function deleteCustomer(c) {
    Alert.alert('Delete Customer', 'Delete "'+(c.name||'this customer')+'"? This cannot be undone.', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async () => {
        try {
          const r = await fetch(API+'/orgs/'+org.id+'/contacts/'+c.id, { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
          const j = await r.json();
          if (j.success) { loadCustomers(org.id, token); }
          else Alert.alert('Could not delete', 'This customer may have invoices linked to them. Remove those invoices first, then try again.');
        } catch(e) { Alert.alert('Error', 'Cannot connect'); }
      }}
    ]);
  }

  async function deleteVendor(v) {
    Alert.alert('Delete Vendor', 'Delete "'+(v.name||'this vendor')+'"? This cannot be undone.', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async () => {
        try {
          const r = await fetch(API+'/orgs/'+org.id+'/contacts/'+v.id, { method:'DELETE', headers:{'Authorization':'Bearer '+token} });
          const j = await r.json();
          if (j.success) { loadVendors(org.id, token); }
          else Alert.alert('Could not delete', j.message || 'Please try again.');
        } catch(e) { Alert.alert('Error', 'Cannot connect'); }
      }}
    ]);
  }

  function editInvoice(inv) {
    setSelectedInvoice(inv);
    setInvoiceForm({ clientName: inv.contact?.name||'', clientEmail: inv.contact?.email||'', poNumber: inv.poNumber||'', notes: inv.notes||'', taxRate: inv.taxRate||'', shipping: inv.shipping||'', discount: inv.discount||'', salesperson: inv.salesperson||'', recurring: ruleForRecord('invoice', inv.id)?.freq || '' });
    setLines(inv.lines?.length ? inv.lines.map(l => ({ description: l.description, quantity: String(l.quantity), unitPrice: String(l.unitPrice), service: l.service || '', taxable: l.taxable !== false })) : [{ description:'', quantity:'1', unitPrice:'', service:'', taxable:true }]);
    setEditingInvoice(true);
    setShowDetail(false);
    setShowInvoice(true);
  }

  function editExpense(exp) {
    setSelectedExpense(exp);
    setExpenseForm({ vendor: exp.vendor||'', amount: String(exp.amount)||'', description: exp.description||'', category: exp.category||'', date: exp.date ? new Date(exp.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10), paymentMethod: exp.paymentMethod||'', receiptNumber: exp.receiptNumber||'' });
        pendingReceiptBase64.current = null;
    setEditingExpense(true);
    setShowExpenseDetail(false);
    setShowExpense(true);
  }

  function editBill(bill) {
    setSelectedBill(bill);
    setBillForm({ vendor: bill.vendor||'', amount: String(bill.amount)||'', description: bill.description||'', category: bill.category||'', billDate: bill.billDate ? new Date(bill.billDate).toISOString().slice(0,10) : new Date().toISOString().slice(0,10), dueDate: bill.dueDate ? new Date(bill.dueDate).toISOString().slice(0,10) : '', recurring: ruleForRecord('bill', bill.id)?.freq || '' });
    setEditingBill(true);
    setShowBillDetail(false);
    setShowBill(true);
  }

  function fmt(n) { return '$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2}); }

  if (!user) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:t.card}}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1,alignItems:'center',justifyContent:'center',padding:24}}>
          <Text style={{fontSize:32,fontWeight:'700',color:t.accent,marginBottom:2}}>Mountain Top</Text>
          <Text style={{fontSize:32,fontWeight:'700',color:t.accent,marginBottom:8}}>Ledger</Text>
          <Text style={{fontSize:14,color:t.sub,marginBottom:40}}>Built for where you are going</Text>
          <TextInput style={{width:'100%',backgroundColor:t.chip,borderRadius:12,padding:16,color:t.text,fontSize:16,marginBottom:12}} placeholder="Email" placeholderTextColor="#7A9A7A" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <View style={{width:'100%',marginBottom:20}}>
            <TextInput style={{width:'100%',backgroundColor:t.chip,borderRadius:12,padding:16,color:t.text,fontSize:16,paddingRight:60}} placeholder="Password" placeholderTextColor="#7A9A7A" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={()=>setShowPassword(p=>!p)} style={{position:'absolute',right:16,top:16}}>
              <Text style={{color:t.sub,fontSize:14}}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{width:'100%',backgroundColor:t.accent,borderRadius:12,padding:16,alignItems:'center'}} onPress={login}>
            <Text style={{fontSize:16,fontWeight:'600',color:t.card}}>Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{marginTop:16}} onPress={()=>setShowRegister(true)}>
            <Text style={{color:t.sub,fontSize:14,textAlign:'center'}}>Don't have an account? <Text style={{color:t.accent}}>Register</Text></Text>
          </TouchableOpacity>
        </ScrollView>
        <Modal visible={showRegister} animationType="slide" presentationStyle="pageSheet">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:t.card}}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:60}}>
              <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
                <TouchableOpacity onPress={()=>setShowRegister(false)}>
                  <Text style={{color:t.sub,fontSize:16}}>Cancel</Text>
                </TouchableOpacity>
                <Text style={{color:t.text,fontSize:17,fontWeight:'600'}}>Register</Text>
                <TouchableOpacity onPress={register}>
                  <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>Save</Text>
                </TouchableOpacity>
              </View>
              <Text style={{fontSize:28,fontWeight:'700',color:t.accent,marginBottom:4}}>Create account</Text>
              <Text style={{fontSize:14,color:t.sub,marginBottom:32}}>Start your free trial today</Text>
              <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>FULL NAME</Text>
              <TextInput style={{backgroundColor:t.chip,borderRadius:12,padding:16,color:t.text,fontSize:16,marginBottom:16,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.fullName} onChangeText={v=>setRegForm(f=>({...f,fullName:v}))} placeholder="Jane Smith" placeholderTextColor="#7A9A7A" />
              <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>COMPANY NAME</Text>
              <TextInput style={{backgroundColor:t.chip,borderRadius:12,padding:16,color:t.text,fontSize:16,marginBottom:16,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.orgName} onChangeText={v=>setRegForm(f=>({...f,orgName:v}))} placeholder="Acme Co." placeholderTextColor="#7A9A7A" />
              <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>EMAIL</Text>
              <TextInput style={{backgroundColor:t.chip,borderRadius:12,padding:16,color:t.text,fontSize:16,marginBottom:16,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.email} onChangeText={v=>setRegForm(f=>({...f,email:v}))} placeholder="you@company.com" placeholderTextColor="#7A9A7A" keyboardType="email-address" autoCapitalize="none" />
              <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>PASSWORD</Text>
              <View style={{width:'100%',marginBottom:16}}>
                <TextInput style={{backgroundColor:t.chip,borderRadius:12,padding:16,color:t.text,fontSize:16,paddingRight:60,borderWidth:1,borderColor:'#4D6A55'}} value={regForm.password} onChangeText={v=>setRegForm(f=>({...f,password:v}))} placeholder="Min 8 characters" placeholderTextColor="#7A9A7A" secureTextEntry={!showRegPassword} />
                <TouchableOpacity onPress={()=>setShowRegPassword(p=>!p)} style={{position:'absolute',right:16,top:16}}>
                  <Text style={{color:t.sub,fontSize:14}}>{showRegPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{height:16}} />
              <TouchableOpacity style={{backgroundColor:t.accent,borderRadius:12,padding:16,alignItems:'center'}} onPress={register}>
                <Text style={{fontSize:16,fontWeight:'600',color:t.card}}>Create Account</Text>
              </TouchableOpacity>
              <Text style={{fontSize:20,fontWeight:'700',color:t.chip,textAlign:'center',marginTop:40,marginBottom:40}}>Mountain Top Ledger</Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>
    );
  }

  const totalInvoiced = invoices.reduce((s,i)=>s+Number(i.total),0);
  const totalExpenses = expenses.reduce((s,e)=>s+Number(e.amount),0);

  return (
    <ScrollView style={{flex:1,backgroundColor:t.bg}}>
      <View style={{padding:24,paddingTop:60,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <View>
          <Text style={{color:t.sub,fontSize:14}}>Welcome back,</Text>
          <Text style={{color:t.text,fontSize:22,fontWeight:'700'}}>{user.fullName}</Text>
        </View>
        <TouchableOpacity onPress={()=>setUser(null)} style={{backgroundColor:t.chip,borderRadius:8,padding:8,paddingHorizontal:12}}>
          <Text style={{color:t.accent,fontSize:13}}>Sign out</Text>
        </TouchableOpacity>
      </View>
      <Text style={{color:t.sub,fontSize:13,paddingHorizontal:24,marginBottom:16}}>{org?.name}</Text>
      <View style={{flexDirection:'row',gap:12,paddingHorizontal:24,marginBottom:24}}>
        <View style={{flex:1,backgroundColor:t.card,borderColor:t.border,borderWidth:1,borderRadius:12,padding:16}}>
          <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>TOTAL INVOICED</Text>
          <Text style={{color:t.accent,fontSize:20,fontWeight:'700'}}>{fmt(totalInvoiced)}</Text>
          <Text style={{color:t.sub,fontSize:11,marginTop:4}}>{invoices.length} invoices</Text>
        </View>
        <View style={{flex:1,backgroundColor:t.card,borderColor:t.border,borderWidth:1,borderRadius:12,padding:16}}>
          <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>TOTAL EXPENSES</Text>
          <Text style={{color:t.gold,fontSize:20,fontWeight:'700'}}>{fmt(totalExpenses)}</Text>
          <Text style={{color:t.sub,fontSize:11,marginTop:4}}>{expenses.length} expenses</Text>
        </View>
      </View>
      {[{ic:'🧾',label:'Invoices',on:()=>{if(org&&token)loadInvoices(org.id,token);setShowInvoiceList(true);}},{ic:'💳',label:'Expenses',on:()=>{if(org&&token)loadExpenses(org.id,token);setShowExpenseList(true);}},{ic:'📄',label:'Bills',on:()=>{if(org&&token)loadBills(org.id,token);setShowBillList(true);}},{ic:'📊',label:'Reports',on:()=>{if(org&&token){loadInvoices(org.id,token);loadExpenses(org.id,token);loadBills(org.id,token);}setShowReports(true);}},{ic:'👥',label:'Customers',on:()=>{if(org&&token)loadCustomers(org.id,token);setShowCustomers(true);}},{ic:'🏢',label:'Vendors',on:()=>{if(org&&token)loadVendors(org.id,token);setShowVendors(true);}}].map(item=>(
        <TouchableOpacity key={item.label} onPress={item.on} style={{marginHorizontal:24,backgroundColor:t.card,borderColor:t.border,borderWidth:1,borderRadius:12,padding:16,marginBottom:10,flexDirection:'row',alignItems:'center',gap:12}}>
          <Text style={{fontSize:16}}>{item.ic}</Text>
          <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      <View style={{paddingHorizontal:24,marginTop:14,marginBottom:30}}>
        <Text style={{color:t.sub,fontSize:11,fontWeight:'700',letterSpacing:1,marginBottom:10}}>THEME</Text>
        <View style={{flexDirection:'row',gap:10}}>
          {Object.values(THEMES).map(th=>(
            <TouchableOpacity key={th.key} onPress={()=>{setThemeKey(th.key); AsyncStorage.setItem('themeKey', th.key).catch(()=>{});}} style={{flex:1,backgroundColor:th.card,borderRadius:12,borderWidth:themeKey===th.key?2:1,borderColor:themeKey===th.key?th.accent:t.border,padding:12,alignItems:'center'}}>
              <View style={{flexDirection:'row',gap:4,marginBottom:8}}>
                <View style={{width:14,height:14,borderRadius:7,backgroundColor:th.bg,borderWidth:1,borderColor:'rgba(128,128,128,0.3)'}}/>
                <View style={{width:14,height:14,borderRadius:7,backgroundColor:th.accent}}/>
                <View style={{width:14,height:14,borderRadius:7,backgroundColor:th.gold}}/>
              </View>
              <Text style={{color:th.text,fontSize:12,fontWeight:'600'}}>{th.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{paddingHorizontal:24,marginBottom:44}}>
        <Text style={{color:t.sub,fontSize:11,fontWeight:'700',letterSpacing:1,marginBottom:10}}>ACCOUNT</Text>
        <TouchableOpacity onPress={deleteAccount} style={{borderWidth:1,borderColor:t.danger,borderRadius:12,padding:14,alignItems:'center'}}>
          <Text style={{color:t.danger,fontSize:15,fontWeight:'600'}}>Delete Account</Text>
        </TouchableOpacity>
        <Text style={{color:t.sub,fontSize:11,marginTop:8,textAlign:'center'}}>Permanently deletes your account and all your data.</Text>
      </View>

      {/* Invoices now live in the Invoices list screen */}

      {/* Expenses and Bills now live in their own list screens */}

      {/* Invoices List Modal */}
      <Modal visible={showInvoiceList} animationType="slide" presentationStyle="pageSheet" onDismiss={()=>{
        if(pendingInvoiceNav?.type==='add'){ setEditingInvoice(false); setInvoiceForm({clientName:'',clientEmail:'',poNumber:'',notes:'',taxRate:'',shipping:'',discount:'',issueDate:new Date().toISOString().slice(0,10),dueDate:'',recurring:''}); setLines([{description:'',quantity:'1',unitPrice:'',service:'',taxable:true}]); setShowInvoice(true); }
        else if(pendingInvoiceNav?.type==='view'){ setSelectedInvoice(pendingInvoiceNav.inv); setShowDetail(true); }
        setPendingInvoiceNav(null);
      }}>
        <ScrollView style={{flex:1,backgroundColor:t.bg}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <Text style={{color:t.text,fontSize:24,fontWeight:'700'}}>Invoices</Text>
              <TouchableOpacity onPress={()=>setShowInvoiceList(false)}><Text style={{color:t.sub,fontSize:16}}>Close</Text></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={()=>{setPendingInvoiceNav({type:'add'});setShowInvoiceList(false);}} style={{backgroundColor:t.card,borderRadius:12,padding:16,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:t.border}}>
              <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>+ Add Invoice</Text>
            </TouchableOpacity>
            {invoices.length===0 ? <Text style={{color:t.sub,fontSize:14,textAlign:'center',marginTop:20}}>No invoices yet</Text> : invoices.map(inv => (
              <TouchableOpacity key={inv.id} onPress={()=>{setPendingInvoiceNav({type:'view',inv});setShowInvoiceList(false);}} style={{backgroundColor:t.card,borderColor:t.border,borderWidth:1,borderRadius:12,padding:16,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View>
                  <Text style={{color:t.text,fontWeight:'500'}}>{inv.contact?.name || 'Client'}</Text>
                  <Text style={{color:t.sub,fontSize:12,marginTop:2}}>{inv.invoiceNumber}{ruleForRecord('invoice',inv.id)?<Text style={{color:t.accent}}>  🔁 {freqLabel(ruleForRecord('invoice',inv.id).freq)}</Text>:null}</Text>
                </View>
                <View style={{alignItems:'flex-end'}}>
                  <Text style={{color: inv.status==='paid' ? t.accent : t.gold,fontWeight:'600'}}>{fmt(inv.total)}</Text>
                  <Text style={{color:t.sub,fontSize:11,marginTop:2,textTransform:'capitalize'}}>{inv.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Modal>

      {/* Expenses List Modal */}
      <Modal visible={showExpenseList} animationType="slide" presentationStyle="pageSheet" onDismiss={()=>{
        if(pendingExpenseNav?.type==='add'){ setEditingExpense(false); setExpenseForm({vendor:'',amount:'',description:'',category:'',date:new Date().toISOString().slice(0,10),paymentMethod:'',receiptNumber:''}); setShowExpense(true); }
        else if(pendingExpenseNav?.type==='view'){ setSelectedExpense(pendingExpenseNav.item); setShowExpenseDetail(true); }
        setPendingExpenseNav(null);
      }}>
        <ScrollView style={{flex:1,backgroundColor:t.bg}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <Text style={{color:t.text,fontSize:24,fontWeight:'700'}}>Expenses</Text>
              <TouchableOpacity onPress={()=>setShowExpenseList(false)}><Text style={{color:t.sub,fontSize:16}}>Close</Text></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={()=>{setPendingExpenseNav({type:'add'});setShowExpenseList(false);}} style={{backgroundColor:t.card,borderRadius:12,padding:16,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:t.border}}>
              <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>+ Add Expense</Text>
            </TouchableOpacity>
            {expenses.length===0 ? <Text style={{color:t.sub,fontSize:14,textAlign:'center',marginTop:20}}>No expenses yet</Text> : expenses.map(exp => (
              <TouchableOpacity key={exp.id} onPress={()=>{setPendingExpenseNav({type:'view',item:exp});setShowExpenseList(false);}} style={{backgroundColor:t.card,borderColor:t.border,borderWidth:1,borderRadius:12,padding:16,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                <View>
                  <Text style={{color:t.text,fontWeight:'500'}}>{exp.vendor}</Text>
                  <Text style={{color:t.sub,fontSize:12,marginTop:2}}>{exp.category}</Text>
                </View>
                <Text style={{color:t.accent,fontWeight:'600'}}>{fmt(exp.amount)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Modal>

      {/* Bills List Modal */}
      <Modal visible={showBillList} animationType="slide" presentationStyle="pageSheet" onDismiss={()=>{
        if(pendingBillNav?.type==='add'){ setEditingBill(false); setBillForm({vendor:'',amount:'',description:'',category:'',billDate:new Date().toISOString().slice(0,10),dueDate:'',recurring:''}); setShowBill(true); }
        else if(pendingBillNav?.type==='view'){ setSelectedBill(pendingBillNav.item); setShowBillDetail(true); }
        setPendingBillNav(null);
      }}>
        <ScrollView style={{flex:1,backgroundColor:t.bg}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <Text style={{color:t.text,fontSize:24,fontWeight:'700'}}>Bills</Text>
              <TouchableOpacity onPress={()=>setShowBillList(false)}><Text style={{color:t.sub,fontSize:16}}>Close</Text></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={()=>{setPendingBillNav({type:'add'});setShowBillList(false);}} style={{backgroundColor:t.card,borderRadius:12,padding:16,alignItems:'center',marginBottom:16,borderWidth:1,borderColor:t.border}}>
              <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>+ Add Bill</Text>
            </TouchableOpacity>
            {bills.length===0 ? <Text style={{color:t.sub,fontSize:14,textAlign:'center',marginTop:20}}>No bills yet</Text> : bills.map(bill => (
              <TouchableOpacity key={bill.id} onPress={()=>{setPendingBillNav({type:'view',item:bill});setShowBillList(false);}} style={{backgroundColor:t.card,borderColor:t.border,borderWidth:1,borderRadius:12,padding:16,marginBottom:8}}>
                <Text style={{color:t.text,fontWeight:'500',marginBottom:4}}>{bill.vendor}{ruleForRecord('bill',bill.id)?<Text style={{color:t.accent,fontSize:12}}>  🔁 {freqLabel(ruleForRecord('bill',bill.id).freq)}</Text>:null}</Text>
                <Text style={{color:t.sub,fontSize:12,marginBottom:8,textTransform:'capitalize'}}>{bill.status}</Text>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  {bill.dueDate && <Text style={{color:bill.status==='paid'?t.accent:t.gold,fontSize:11}}>Due: {new Date(bill.dueDate).toLocaleDateString()}</Text>}
                  <Text style={{color: bill.status==='paid' ? t.accent : t.gold,fontWeight:'600'}}>{fmt(bill.amount)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Modal>

      {/* Invoice Detail Modal */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:t.bg}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowDetail(false)}>
                <Text style={{color:t.accent,fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',gap:12}}>
                <TouchableOpacity onPress={()=>editInvoice(selectedInvoice)} style={{backgroundColor:t.card,borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:t.accent,fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteInvoice(selectedInvoice.id)} style={{backgroundColor:'#4a1a1a',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#F0A9A0',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedInvoice && (
              <View>
                <Text style={{color:t.text,fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedInvoice.invoiceNumber}</Text>
                <Text style={{color:t.sub,fontSize:14,marginBottom:12,textTransform:'capitalize'}}>{selectedInvoice.status}</Text>
                {selectedInvoice.status !== 'paid' && (
                  <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
                    <TouchableOpacity onPress={()=>markInvoicePaid(selectedInvoice.id)} style={{flex:1,backgroundColor:'#1a4a2a',borderRadius:8,padding:12,alignItems:'center'}}>
                      <Text style={{color:'#A8D4A8',fontSize:13,fontWeight:'600'}}>Mark as Paid</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>recordPartialPayment(selectedInvoice)} style={{flex:1,backgroundColor:'#2D3A1A',borderRadius:8,padding:12,alignItems:'center'}}>
                      <Text style={{color:'#FFD166',fontSize:13,fontWeight:'600'}}>Partial Payment</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedInvoice.status !== 'paid' && (
                  <TouchableOpacity onPress={()=>sendInvoice(selectedInvoice.id)} style={{backgroundColor:'#1a2a4a',borderRadius:8,padding:12,alignItems:'center',marginBottom:16}}>
                    <Text style={{color:'#A8C4D4',fontSize:13,fontWeight:'600'}}>Send Invoice by Email</Text>
                  </TouchableOpacity>
                )}
                <View style={{backgroundColor:t.card,borderRadius:12,padding:20,marginBottom:16}}>
                  <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>CLIENT</Text>
                  <Text style={{color:t.text,fontSize:16,fontWeight:'500'}}>{selectedInvoice.contact?.name || 'N/A'}</Text>
                  {selectedInvoice.contact?.email ? <Text style={{color:t.sub,fontSize:13,marginTop:2}}>{selectedInvoice.contact.email}</Text> : null}
                  {selectedInvoice.salesperson ? <Text style={{color:t.sub,fontSize:13,marginTop:8}}>Salesperson: <Text style={{color:t.accent}}>{selectedInvoice.salesperson}</Text></Text> : null}
                </View>
                {selectedInvoice.lines?.length > 0 && (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:20,marginBottom:16}}>
                    <Text style={{color:t.sub,fontSize:11,marginBottom:12}}>LINE ITEMS</Text>
                    {selectedInvoice.lines.map((l, i) => (
                      <View key={i} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                        <View style={{flex:1}}>
                          <Text style={{color:t.text,fontSize:14}}>{l.description}{Number(selectedInvoice.taxRate||0)>0?(l.taxable===false?<Text style={{color:t.sub,fontSize:11}}>  · Non-taxable</Text>:<Text style={{color:t.accent,fontSize:11}}>  · Taxable</Text>):null}</Text>
                          <Text style={{color:t.sub,fontSize:12}}>{l.quantity} x {fmt(l.unitPrice)}</Text>
                          {l.service ? <Text style={{color:t.accent,fontSize:11,marginTop:2}}>{l.service}</Text> : null}
                        </View>
                        <Text style={{color:t.accent,fontSize:14,fontWeight:'600'}}>{fmt(l.amount)}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <View style={{backgroundColor:t.card,borderRadius:12,padding:20,marginBottom:16}}>
                  <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                    <Text style={{color:t.sub,fontSize:14}}>Subtotal</Text>
                    <Text style={{color:t.text,fontSize:14}}>{fmt((selectedInvoice.lines||[]).reduce((s,l)=>s+Number(l.amount||0),0))}</Text>
                  </View>
                  {Number(selectedInvoice.taxAmount||0) > 0 && (
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                      <Text style={{color:t.sub,fontSize:14}}>Tax{Number(selectedInvoice.taxRate||0)>0?` (${Number(selectedInvoice.taxRate)}%)`:''}</Text>
                      <Text style={{color:t.text,fontSize:14}}>{fmt(selectedInvoice.taxAmount)}</Text>
                    </View>
                  )}
                  {Number(selectedInvoice.shipping||0) > 0 && (
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                      <Text style={{color:t.sub,fontSize:14}}>Shipping</Text>
                      <Text style={{color:t.text,fontSize:14}}>{fmt(selectedInvoice.shipping)}</Text>
                    </View>
                  )}
                  {Number(selectedInvoice.discount||0) > 0 && (
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                      <Text style={{color:t.sub,fontSize:14}}>Discount</Text>
                      <Text style={{color:t.danger,fontSize:14}}>-{fmt(selectedInvoice.discount)}</Text>
                    </View>
                  )}
                  <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:8,borderTopWidth:1,borderTopColor:t.chip}}>
                    <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>Total</Text>
                    <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>{fmt(selectedInvoice.total)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* Expense Detail Modal */}
      <Modal visible={showExpenseDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:t.bg}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowExpenseDetail(false)}>
                <Text style={{color:t.accent,fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',gap:12}}>
                <TouchableOpacity onPress={()=>editExpense(selectedExpense)} style={{backgroundColor:t.card,borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:t.accent,fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteExpense(selectedExpense.id)} style={{backgroundColor:'#4a1a1a',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#F0A9A0',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedExpense && (
              <View>
                <Text style={{color:t.text,fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedExpense.vendor}</Text>
                <Text style={{color:t.sub,fontSize:14,marginBottom:8,textTransform:'capitalize'}}>{selectedExpense.category}</Text>
                <View style={{backgroundColor:t.card,borderRadius:12,padding:20,marginBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:t.sub,fontSize:13}}>Amount</Text>
                  <Text style={{color:t.accent,fontSize:20,fontWeight:'700'}}>{fmt(selectedExpense.amount)}</Text>
                </View>
                {selectedExpense.date ? (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Date</Text>
                    <Text style={{color:t.text,fontSize:13}}>{new Date(selectedExpense.date).toLocaleDateString()}</Text>
                  </View>
                ) : null}
                {selectedExpense.paymentMethod ? (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Payment Method</Text>
                    <Text style={{color:t.text,fontSize:13}}>{selectedExpense.paymentMethod}</Text>
                  </View>
                ) : null}
                {selectedExpense.receiptNumber ? (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Receipt #</Text>
                    <Text style={{color:t.text,fontSize:13}}>{selectedExpense.receiptNumber}</Text>
                  </View>
                ) : null}
                {selectedExpense.description ? (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12}}>
                    <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                    <Text style={{color:t.text,fontSize:14}}>{selectedExpense.description}</Text>
                  </View>
                ) : null}
                {selectedExpense.receiptUrl ? (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12}}>
                    <Text style={{color:t.sub,fontSize:11,marginBottom:10}}>RECEIPT IMAGE</Text>
                    <Image source={{uri:selectedExpense.receiptUrl}} style={{width:'100%',height:300,borderRadius:8}} resizeMode="contain" />
                  </View>
                ) : (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,alignItems:'center'}}>
                    <Text style={{color:t.sub,fontSize:13}}>No receipt image attached</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* Bill Detail Modal */}
      <Modal visible={showBillDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:t.bg}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowBillDetail(false)}>
                <Text style={{color:t.accent,fontSize:16}}>Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',gap:12}}>
                <TouchableOpacity onPress={()=>editBill(selectedBill)} style={{backgroundColor:t.card,borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:t.accent,fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteBill(selectedBill.id)} style={{backgroundColor:'#4a1a1a',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#F0A9A0',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedBill && (
              <View>
                <Text style={{color:t.text,fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedBill.vendor}</Text>
                <Text style={{color:t.sub,fontSize:14,marginBottom:16,textTransform:'capitalize'}}>{selectedBill.category||'Bill'}</Text>
                <View style={{backgroundColor:t.card,borderRadius:12,padding:20,marginBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:t.sub,fontSize:13}}>Amount Due</Text>
                  <Text style={{color:t.danger,fontSize:20,fontWeight:'700'}}>{fmt(selectedBill.amount)}</Text>
                </View>
                <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:t.sub,fontSize:13}}>Status</Text>
                  <Text style={{color:selectedBill.status==='paid'?t.accent:t.gold,fontSize:13,fontWeight:'600',textTransform:'capitalize'}}>{selectedBill.status}</Text>
                </View>
                {selectedBill.status==='paid'
                  ? <TouchableOpacity onPress={()=>setBillStatus(selectedBill.id,'pending')} style={{backgroundColor:t.chip,borderRadius:12,padding:14,alignItems:'center',marginBottom:12}}><Text style={{color:t.accent,fontSize:15,fontWeight:'600'}}>Mark as Unpaid</Text></TouchableOpacity>
                  : <TouchableOpacity onPress={()=>setBillStatus(selectedBill.id,'paid')} style={{backgroundColor:'#1a4a2a',borderRadius:12,padding:14,alignItems:'center',marginBottom:12}}><Text style={{color:'#A8D4A8',fontSize:15,fontWeight:'600'}}>Mark as Paid</Text></TouchableOpacity>
                }
                {selectedBill.dueDate ? (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Due Date</Text>
                    <Text style={{color:t.text,fontSize:13}}>{new Date(selectedBill.dueDate).toLocaleDateString()}</Text>
                  </View>
                ) : null}
                {selectedBill.description ? (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12}}>
                    <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>DESCRIPTION</Text>
                    <Text style={{color:t.text,fontSize:14}}>{selectedBill.description}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* New Invoice Modal */}
      <Modal visible={showInvoice} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:t.bg}}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>{setShowInvoice(false);setEditingInvoice(false);}}>
                <Text style={{color:t.sub,fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:t.text,fontSize:17,fontWeight:'600'}}>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</Text>
              <TouchableOpacity onPress={saveInvoice}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>

            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>CLIENT NAME</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={invoiceForm.clientName} onChangeText={v=>setInvoiceForm(f=>({...f,clientName:v}))} placeholder="Acme Corp" placeholderTextColor="#7A9A7A" />

            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>CLIENT EMAIL</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={invoiceForm.clientEmail} onChangeText={v=>setInvoiceForm(f=>({...f,clientEmail:v}))} placeholder="client@example.com" placeholderTextColor="#7A9A7A" keyboardType="email-address" autoCapitalize="none" />

            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>PO / WORK ORDER NUMBER (OPTIONAL)</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={invoiceForm.poNumber} onChangeText={v=>setInvoiceForm(f=>({...f,poNumber:v}))} placeholder="PO-12345" placeholderTextColor="#7A9A7A" />

            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>SALESPERSON (OPTIONAL)</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:24,borderWidth:1,borderColor:t.chip}} value={invoiceForm.salesperson || ''} onChangeText={v=>setInvoiceForm(f=>({...f,salesperson:v}))} placeholder="Jane Smith" placeholderTextColor="#7A9A7A" />

            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>INVOICE DATE</Text>
            <TouchableOpacity onPress={()=>{setInvCalYear(new Date().getFullYear());setInvCalMonth(new Date().getMonth());setInvoiceDatePickerVisible(true);}} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:invoiceForm.issueDate?t.text:t.sub,fontSize:15}}>{invoiceForm.issueDate ? new Date(invoiceForm.issueDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>
            </TouchableOpacity>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>DUE DATE (OPTIONAL)</Text>
            <TouchableOpacity onPress={()=>{setInvDueCalYear(new Date().getFullYear());setInvDueCalMonth(new Date().getMonth());setInvoiceDueDatePickerVisible(true);}} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:24,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:invoiceForm.dueDate?t.text:t.sub,fontSize:15}}>{invoiceForm.dueDate ? new Date(invoiceForm.dueDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select due date'}</Text>
            </TouchableOpacity><Modal visible={invoiceDatePickerVisible} transparent animationType='fade'>
              <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',alignItems:'center',padding:24}}>
                <View style={{backgroundColor:t.card,borderRadius:16,padding:20,width:'100%',maxWidth:340}}>
                  {(()=>{
                    const mn=['January','February','March','April','May','June','July','August','September','October','November','December'];
                    const dn=['Su','Mo','Tu','We','Th','Fr','Sa'];
                    const fd=new Date(invCalYear,invCalMonth,1).getDay();
                    const dim=new Date(invCalYear,invCalMonth+1,0).getDate();
                    const cells=Array.from({length:fd+dim},(_,i)=>i<fd?null:i-fd+1);
                    const isSel=(d)=>d&&invoiceForm.issueDate===`${invCalYear}-${String(invCalMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===invCalYear&&t.getMonth()===invCalMonth&&t.getDate()===d;};
                    return(<View>
                      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                        <TouchableOpacity onPress={()=>{if(invCalMonth===0){setInvCalMonth(11);setInvCalYear(y=>y-1);}else setInvCalMonth(m=>m-1);}} style={{padding:8}}><Text style={{color:t.accent,fontSize:20}}>{'<'}</Text></TouchableOpacity>
                        <Text style={{color:t.text,fontSize:16,fontWeight:'600'}}>{mn[invCalMonth]} {invCalYear}</Text>
                        <TouchableOpacity onPress={()=>{if(invCalMonth===11){setInvCalMonth(0);setInvCalYear(y=>y+1);}else setInvCalMonth(m=>m+1);}} style={{padding:8}}><Text style={{color:t.accent,fontSize:20}}>{'>'}</Text></TouchableOpacity>
                      </View>
                      <View style={{flexDirection:'row',marginBottom:8}}>{dn.map(d=><View key={d} style={{flex:1,alignItems:'center'}}><Text style={{color:t.sub,fontSize:11,fontWeight:'600'}}>{d}</Text></View>)}</View>
                      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                        {cells.map((d,i)=>(
                          <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${invCalYear}-${String(invCalMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;setInvoiceForm(f=>({...f,issueDate:ds}));setInvoiceDatePickerVisible(false);}}} style={{width:'14.28%',aspectRatio:1,alignItems:'center',justifyContent:'center',marginBottom:2}}>
                            {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSel(d)?t.accent:'transparent',alignItems:'center',justifyContent:'center',borderWidth:isToday(d)&&!isSel(d)?1:0,borderColor:t.accent}}><Text style={{color:isSel(d)?t.bg:t.text,fontSize:14,fontWeight:isSel(d)||isToday(d)?'700':'400'}}>{d}</Text></View>:null}
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity onPress={()=>setInvoiceDatePickerVisible(false)} style={{marginTop:16,padding:12,alignItems:'center',borderTopWidth:1,borderTopColor:t.chip}}><Text style={{color:t.sub,fontSize:15}}>Cancel</Text></TouchableOpacity>
                    </View>);
                  })()}
                </View>
              </View>
            </Modal>
            <Modal visible={invoiceDueDatePickerVisible} transparent animationType='fade'>
              <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',alignItems:'center',padding:24}}>
                <View style={{backgroundColor:t.card,borderRadius:16,padding:20,width:'100%',maxWidth:340}}>
                  {(()=>{
                    const mn=['January','February','March','April','May','June','July','August','September','October','November','December'];
                    const dn=['Su','Mo','Tu','We','Th','Fr','Sa'];
                    const fd=new Date(invDueCalYear,invDueCalMonth,1).getDay();
                    const dim=new Date(invDueCalYear,invDueCalMonth+1,0).getDate();
                    const cells=Array.from({length:fd+dim},(_,i)=>i<fd?null:i-fd+1);
                    const isSel=(d)=>d&&invoiceForm.dueDate===`${invDueCalYear}-${String(invDueCalMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===invDueCalYear&&t.getMonth()===invDueCalMonth&&t.getDate()===d;};
                    return(<View>
                      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                        <TouchableOpacity onPress={()=>{if(invDueCalMonth===0){setInvDueCalMonth(11);setInvDueCalYear(y=>y-1);}else setInvDueCalMonth(m=>m-1);}} style={{padding:8}}><Text style={{color:t.accent,fontSize:20}}>{'<'}</Text></TouchableOpacity>
                        <Text style={{color:t.text,fontSize:16,fontWeight:'600'}}>{mn[invDueCalMonth]} {invDueCalYear}</Text>
                        <TouchableOpacity onPress={()=>{if(invDueCalMonth===11){setInvDueCalMonth(0);setInvDueCalYear(y=>y+1);}else setInvDueCalMonth(m=>m+1);}} style={{padding:8}}><Text style={{color:t.accent,fontSize:20}}>{'>'}</Text></TouchableOpacity>
                      </View>
                      <View style={{flexDirection:'row',marginBottom:8}}>{dn.map(d=><View key={d} style={{flex:1,alignItems:'center'}}><Text style={{color:t.sub,fontSize:11,fontWeight:'600'}}>{d}</Text></View>)}</View>
                      <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                        {cells.map((d,i)=>(
                          <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${invDueCalYear}-${String(invDueCalMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;setInvoiceForm(f=>({...f,dueDate:ds}));setInvoiceDueDatePickerVisible(false);}}} style={{width:'14.28%',aspectRatio:1,alignItems:'center',justifyContent:'center',marginBottom:2}}>
                            {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSel(d)?t.accent:'transparent',alignItems:'center',justifyContent:'center',borderWidth:isToday(d)&&!isSel(d)?1:0,borderColor:t.accent}}><Text style={{color:isSel(d)?t.bg:t.text,fontSize:14,fontWeight:isSel(d)||isToday(d)?'700':'400'}}>{d}</Text></View>:null}
                          </TouchableOpacity>
                        ))}
                      </View>
                      <TouchableOpacity onPress={()=>setInvoiceDueDatePickerVisible(false)} style={{marginTop:16,padding:12,alignItems:'center',borderTopWidth:1,borderTopColor:t.chip}}><Text style={{color:t.sub,fontSize:15}}>Cancel</Text></TouchableOpacity>
                    </View>);
                  })()}
                </View>
              </View>
            </Modal>
<Text style={{color:t.sub,fontSize:13,fontWeight:'600',marginBottom:12}}>LINE ITEMS</Text>
            {lines.map((line, i) => (
              <View key={i} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:12,borderWidth:1,borderColor:t.chip}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <Text style={{color:t.sub,fontSize:11}}>ITEM {i+1}</Text>
                  {lines.length > 1 && (
                    <TouchableOpacity onPress={()=>removeLine(i)}>
                      <Text style={{color:t.danger,fontSize:13}}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:14,marginBottom:8}} value={line.description} onChangeText={v=>updateLine(i,'description',v)} placeholder="Description" placeholderTextColor="#7A9A7A" />
                <Text style={{color:t.sub,fontSize:10,marginBottom:4}}>SERVICE (OPTIONAL)</Text>
                <TouchableOpacity onPress={()=>setServicePickerLine(i)} style={{backgroundColor:t.bg,borderRadius:8,padding:12,marginBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:line.service?t.text:t.sub,fontSize:14}}>{line.service||'Select service…'}</Text>
                  <Text style={{color:t.sub,fontSize:12}}>▼</Text>
                </TouchableOpacity>
                <View style={{flexDirection:'row',gap:8}}>
                  <View style={{flex:1}}>
                    <Text style={{color:t.sub,fontSize:10,marginBottom:4}}>QTY</Text>
                    <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:14}} value={line.quantity} onChangeText={v=>updateLine(i,'quantity',v)} keyboardType="decimal-pad" />
                  </View>
                  <View style={{flex:2}}>
                    <Text style={{color:t.sub,fontSize:10,marginBottom:4}}>UNIT PRICE ($)</Text>
                    <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:14}} value={line.unitPrice} onChangeText={v=>updateLine(i,'unitPrice',v)} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                  </View>
                  <View style={{flex:1.5,justifyContent:'flex-end'}}>
                    <Text style={{color:t.accent,fontSize:14,fontWeight:'600',textAlign:'right',padding:12}}>{fmt(Number(line.quantity||0)*Number(line.unitPrice||0))}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={()=>updateLine(i,'taxable',line.taxable===false)} style={{flexDirection:'row',alignItems:'center',marginTop:10,gap:8}}>
                  <View style={{width:22,height:22,borderRadius:6,borderWidth:2,borderColor:line.taxable===false?t.sub:t.accent,backgroundColor:line.taxable===false?'transparent':t.accent,alignItems:'center',justifyContent:'center'}}>
                    {line.taxable!==false ? <Text style={{color:t.bg,fontSize:14,fontWeight:'800'}}>✓</Text> : null}
                  </View>
                  <Text style={{color:t.text,fontSize:14}}>Taxable</Text>
                  <Text style={{color:t.sub,fontSize:12}}>{line.taxable===false?'— no tax on this item':''}</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addLine} style={{backgroundColor:t.card,borderRadius:10,padding:14,alignItems:'center',marginBottom:24,borderWidth:1,borderColor:t.chip,borderStyle:'dashed'}}>
              <Text style={{color:t.accent,fontSize:14}}>+ Add Line Item</Text>
            </TouchableOpacity>

            <Modal visible={servicePickerLine!==null} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setServicePickerLine(null)} />
              <View style={{backgroundColor:t.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Service</Text>
                <ScrollView keyboardShouldPersistTaps="handled">
                  <TouchableOpacity onPress={()=>{const li=servicePickerLine; Alert.prompt('New Service','Enter a service name',(text)=>{const s=(text||'').trim(); if(s){updateLine(li,'service',s);} setServicePickerLine(null);});}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,marginBottom:2}}>
                    <Text style={{color:t.gold,fontSize:15,fontWeight:'600'}}>+ Add new service…</Text>
                  </TouchableOpacity>
                  {servicePickerLine!==null && lines[servicePickerLine]?.service ? (
                    <TouchableOpacity onPress={()=>{updateLine(servicePickerLine,'service','');setServicePickerLine(null);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,marginBottom:2}}>
                      <Text style={{color:t.sub,fontSize:15}}>✕ Clear service</Text>
                    </TouchableOpacity>
                  ) : null}
                  {[...new Set(invoices.flatMap(inv=>(inv.lines||[])).map(l=>l.service).filter(Boolean))].sort((a,b)=>a.localeCompare(b)).map(sv=>(
                    <TouchableOpacity key={sv} onPress={()=>{updateLine(servicePickerLine,'service',sv);setServicePickerLine(null);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,backgroundColor:(servicePickerLine!==null&&lines[servicePickerLine]?.service===sv)?t.chip:'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:(servicePickerLine!==null&&lines[servicePickerLine]?.service===sv)?t.accent:t.text,fontSize:15}}>{sv}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>

            <View style={{backgroundColor:t.card,borderRadius:10,padding:16,marginBottom:16}}>
              <View style={{flexDirection:'row',gap:12,marginBottom:12}}>
                <View style={{flex:1}}>
                  <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>TAX RATE (%)</Text>
                  <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:14}} value={invoiceForm.taxRate} onChangeText={v=>setInvoiceForm(f=>({...f,taxRate:v}))} placeholder="0" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                </View>
                <View style={{flex:1}}>
                  <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>SHIPPING ($)</Text>
                  <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:14}} value={invoiceForm.shipping} onChangeText={v=>setInvoiceForm(f=>({...f,shipping:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                </View>
                <View style={{flex:1}}>
                  <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>DISCOUNT ($)</Text>
                  <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:14}} value={invoiceForm.discount} onChangeText={v=>setInvoiceForm(f=>({...f,discount:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
                </View>
              </View>
              {(() => {
                const sub = lines.reduce((s,l)=>s+Number(l.quantity||0)*Number(l.unitPrice||0),0);
                const taxableSub = lines.reduce((s,l)=>s+(l.taxable===false?0:Number(l.quantity||0)*Number(l.unitPrice||0)),0);
                const rate = Number(invoiceForm.taxRate||0);
                const tax = taxableSub * (rate/100);
                const anyNonTax = lines.some(l=>l.taxable===false);
                return (
                  <View style={{paddingTop:12,borderTopWidth:1,borderTopColor:t.chip}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                      <Text style={{color:t.sub,fontSize:14}}>Subtotal</Text>
                      <Text style={{color:t.text,fontSize:14}}>{fmt(sub)}</Text>
                    </View>
                    {rate>0 && (
                      <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                        <Text style={{color:t.sub,fontSize:14}}>Tax ({rate}%{anyNonTax?' on taxable items':''})</Text>
                        <Text style={{color:t.text,fontSize:14}}>{fmt(tax)}</Text>
                      </View>
                    )}
                    {Number(invoiceForm.shipping||0)>0 && (
                      <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                        <Text style={{color:t.sub,fontSize:14}}>Shipping</Text>
                        <Text style={{color:t.text,fontSize:14}}>{fmt(Number(invoiceForm.shipping))}</Text>
                      </View>
                    )}
                    {Number(invoiceForm.discount||0)>0 && (
                      <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
                        <Text style={{color:t.sub,fontSize:14}}>Discount</Text>
                        <Text style={{color:t.danger,fontSize:14}}>-{fmt(Number(invoiceForm.discount))}</Text>
                      </View>
                    )}
                    <View style={{flexDirection:'row',justifyContent:'space-between',paddingTop:8,marginTop:2,borderTopWidth:1,borderTopColor:t.chip}}>
                      <Text style={{color:t.accent,fontSize:16,fontWeight:'700'}}>Total</Text>
                      <Text style={{color:t.accent,fontSize:16,fontWeight:'700'}}>{fmt(invoiceTotal())}</Text>
                    </View>
                  </View>
                );
              })()}
            </View>

            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>NOTES (OPTIONAL)</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:24,borderWidth:1,borderColor:t.chip,minHeight:80}} value={invoiceForm.notes} onChangeText={v=>setInvoiceForm(f=>({...f,notes:v}))} placeholder="Payment terms, special instructions..." placeholderTextColor="#7A9A7A" multiline />

            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>REPEAT</Text>
            <TouchableOpacity onPress={()=>setShowInvoiceRepeatPicker(true)} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:8,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:invoiceForm.recurring?t.text:t.sub,fontSize:15}}>{invoiceForm.recurring?('🔁 '+freqLabel(invoiceForm.recurring)):'One-time (does not repeat)'}</Text>
              <Text style={{color:t.sub,fontSize:12}}>▼</Text>
            </TouchableOpacity>
            {invoiceForm.recurring ? <Text style={{color:t.sub,fontSize:12,marginBottom:24}}>You'll be asked before each new invoice is created.</Text> : <View style={{marginBottom:24}}/>}
            <Modal visible={showInvoiceRepeatPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowInvoiceRepeatPicker(false)} />
              <View style={{backgroundColor:t.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Repeat this invoice</Text>
                <ScrollView>
                  {FREQUENCIES.map(f=>(
                    <TouchableOpacity key={f.key||'once'} onPress={()=>{setInvoiceForm(fm=>({...fm,recurring:f.key}));setShowInvoiceRepeatPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,backgroundColor:invoiceForm.recurring===f.key?t.chip:'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:invoiceForm.recurring===f.key?t.accent:t.text,fontSize:15}}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>

          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Expense Modal */}
      <Modal visible={showExpense} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:t.bg}}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>{setShowExpense(false);setEditingExpense(false);}}>
                <Text style={{color:t.sub,fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:t.text,fontSize:17,fontWeight:'600'}}>{editingExpense ? 'Edit Expense' : 'New Expense'}</Text>
              <TouchableOpacity onPress={saveExpense} disabled={scanningReceipt}>
                <Text style={{color:scanningReceipt?'#5A7A5A':t.accent,fontSize:16,fontWeight:'600'}}>{scanningReceipt?'Scanning…':'Save'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={async()=>{
              const perm=await ImagePicker.requestMediaLibraryPermissionsAsync();
              if(perm.status!=='granted'){Alert.alert('Permission needed','Please allow photo access.');return;}
              const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,base64:true,quality:0.4});
              if(result.canceled)return;
              setScanningReceipt(true);
              try{
                const b64=result.assets[0].base64;
                const r=await fetch(API+'/orgs/'+org.id+'/receipts/scan',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({imageBase64:b64,mediaType:'image/jpeg'})});
                const j=await r.json();
                if(!j.success)throw new Error(j.message);
                const info=j.data;
                const safeDate = info.date && !isNaN(new Date(info.date)) ? info.date : new Date().toISOString().slice(0,10); setExpenseForm(f=>({...f,vendor:info.vendor||f.vendor,amount:String(info.amount||f.amount),date:safeDate,category:info.category||f.category}));
                pendingReceiptBase64.current = b64;
                try {
                  const fd = new FormData();
                  fd.append('file', 'data:image/jpeg;base64,'+b64);
                  fd.append('upload_preset', 'ledger_unsigned');
                  const cr = await fetch('https://api.cloudinary.com/v1_1/gxbce37f/image/upload', {method:'POST', body:fd});
                  const cj = await cr.json();
                  if (cj.secure_url) pendingReceiptUrl.current = cj.secure_url;
                  console.log('Cloudinary direct upload:', cj.secure_url||JSON.stringify(cj.error));
                } catch(ce){ console.log('Cloudinary error:', ce.message); }Alert.alert('Receipt scanned!','Please review the filled fields.');
              }catch(e){Alert.alert('Error','Could not read receipt. Fill in manually.');}
              finally{setScanningReceipt(false);}
            }} style={{backgroundColor:'#1C3A4A',borderRadius:12,padding:14,alignItems:'center',marginBottom:20,flexDirection:'row',justifyContent:'center',gap:8}}>
              <Text style={{color:scanningReceipt?t.sub:'#A8C4D4',fontSize:15,fontWeight:'600'}}>{scanningReceipt?'Scanning receipt...':'Scan Receipt'}</Text>
            </TouchableOpacity>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={expenseForm.vendor} onChangeText={v=>setExpenseForm(f=>({...f,vendor:v}))} placeholder="Amazon" placeholderTextColor="#7A9A7A" />
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>CATEGORY</Text>
            <TouchableOpacity onPress={()=>setShowExpenseCategoryPicker(true)} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:expenseForm.category?t.text:t.sub,fontSize:15}}>{expenseForm.category||'Select category...'}</Text>
              <Text style={{color:t.sub,fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showExpenseCategoryPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowExpenseCategoryPicker(false)} />
              <View style={{backgroundColor:t.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Category</Text>
                <ScrollView>
                  <TouchableOpacity onPress={()=>{Alert.prompt('New Category','Enter a category name',(text)=>{const t=(text||'').trim(); if(t){setExpenseForm(f=>({...f,category:t}));setShowExpenseCategoryPicker(false);}});}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,marginBottom:2}}>
                    <Text style={{color:'#A8C4D4',fontSize:15,fontWeight:'600'}}>+ Add new category…</Text>
                  </TouchableOpacity>
                  {[...EXPENSE_CATEGORIES, ...[...new Set([...expenses,...bills].map(x=>x.category).filter(Boolean))].filter(c=>!EXPENSE_CATEGORIES.includes(c))].sort((a,b)=>a==='Other'?1:b==='Other'?-1:a.localeCompare(b)).map(cat=>(
                    <TouchableOpacity key={cat} onPress={()=>{setExpenseForm(f=>({...f,category:cat}));setShowExpenseCategoryPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,backgroundColor:expenseForm.category===cat?t.chip:'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:expenseForm.category===cat?t.accent:t.text,fontSize:15}}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>AMOUNT ($)</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={expenseForm.amount} onChangeText={v=>setExpenseForm(f=>({...f,amount:v}))} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>DATE</Text>
            <TouchableOpacity onPress={()=>setShowDatePicker(true)} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:t.text,fontSize:15}}>{expenseForm.date ? new Date(expenseForm.date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>
              <Text style={{color:t.sub,fontSize:16}}>📅</Text>
            </TouchableOpacity>
            <Modal visible={showDatePicker} transparent animationType='fade'>
              <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',alignItems:'center',padding:24}}>
                <View style={{backgroundColor:t.card,borderRadius:16,padding:20,width:'100%',maxWidth:340}}>
                  {(()=>{
                    const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
                    const dayNames=['Su','Mo','Tu','We','Th','Fr','Sa'];
                    const firstDay=new Date(calViewYear,calViewMonth,1).getDay();
                    const daysInMonth=new Date(calViewYear,calViewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&expenseForm.date===`${calViewYear}-${String(calViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===calViewYear&&t.getMonth()===calViewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(calViewMonth===0){setCalViewMonth(11);setCalViewYear(y=>y-1);}else setCalViewMonth(m=>m-1);}} style={{padding:8}}>
                            <Text style={{color:t.accent,fontSize:20}}>‹</Text>
                          </TouchableOpacity>
                          <Text style={{color:t.text,fontSize:16,fontWeight:'600'}}>{monthNames[calViewMonth]} {calViewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(calViewMonth===11){setCalViewMonth(0);setCalViewYear(y=>y+1);}else setCalViewMonth(m=>m+1);}} style={{padding:8}}>
                            <Text style={{color:t.accent,fontSize:20}}>›</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:'row',marginBottom:8}}>
                          {dayNames.map(d=><View key={d} style={{flex:1,alignItems:'center'}}><Text style={{color:t.sub,fontSize:11,fontWeight:'600'}}>{d}</Text></View>)}
                        </View>
                        <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${calViewYear}-${String(calViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;setExpenseForm(f=>({...f,date:ds}));setShowDatePicker(false);}}} style={{width:'14.28%',aspectRatio:1,alignItems:'center',justifyContent:'center',marginBottom:2}}>
                              {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSelected(d)?t.accent:'transparent',alignItems:'center',justifyContent:'center',borderWidth:isToday(d)&&!isSelected(d)?1:0,borderColor:t.accent}}>
                                <Text style={{color:isSelected(d)?t.bg:t.text,fontSize:14,fontWeight:isSelected(d)||isToday(d)?'700':'400'}}>{d}</Text>
                              </View>:null}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={()=>setShowDatePicker(false)} style={{marginTop:16,padding:12,alignItems:'center',borderTopWidth:1,borderTopColor:t.chip}}>
                          <Text style={{color:t.sub,fontSize:15}}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Modal>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>PAYMENT METHOD</Text>
            <TouchableOpacity onPress={()=>setShowPaymentMethodPicker(true)} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:expenseForm.paymentMethod?t.text:t.sub,fontSize:15}}>{expenseForm.paymentMethod||'Select payment method...'}</Text>
              <Text style={{color:t.sub,fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showPaymentMethodPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowPaymentMethodPicker(false)} />
              <View style={{backgroundColor:t.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Payment Method</Text>
                <ScrollView>
                  {['Cash','Check','Credit Card','Debit Card','ACH / Bank Transfer','Wire Transfer','PayPal','Venmo','Zelle','Other'].map(pm=>(
                    <TouchableOpacity key={pm} onPress={()=>{setExpenseForm(f=>({...f,paymentMethod:pm}));setShowPaymentMethodPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,backgroundColor:expenseForm.paymentMethod===pm?t.chip:'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:expenseForm.paymentMethod===pm?t.accent:t.text,fontSize:15}}>{pm}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>RECEIPT NUMBER</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={expenseForm.receiptNumber} onChangeText={v=>setExpenseForm(f=>({...f,receiptNumber:v}))} placeholder="REC-001 (optional)" placeholderTextColor="#7A9A7A" />
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={expenseForm.description} onChangeText={v=>setExpenseForm(f=>({...f,description:v}))} placeholder="Office supplies" placeholderTextColor="#7A9A7A" />
            <TouchableOpacity onPress={()=>{setShowExpense(false);setEditingExpense(false);}} style={{backgroundColor:t.chip,borderRadius:12,padding:16,alignItems:'center',marginTop:8}}>
              <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Bill Modal */}
      <Modal visible={showBill} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:t.bg}}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <TouchableOpacity onPress={()=>{setShowBill(false);setEditingBill(false);}}>
                <Text style={{color:t.sub,fontSize:16}}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{color:t.text,fontSize:17,fontWeight:'600'}}>{editingBill ? 'Edit Bill' : 'New Bill'}</Text>
              <TouchableOpacity onPress={saveBill}>
                <Text style={{color:t.danger,fontSize:16,fontWeight:'600'}}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>VENDOR</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={billForm.vendor} onChangeText={v=>setBillForm(f=>({...f,vendor:v}))} placeholder="Landlord" placeholderTextColor="#7A9A7A" />
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>CATEGORY</Text>
            <TouchableOpacity onPress={()=>setShowBillCategoryPicker(true)} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:billForm.category?t.text:t.sub,fontSize:15}}>{billForm.category||'Select category...'}</Text>
              <Text style={{color:t.sub,fontSize:12}}>▼</Text>
            </TouchableOpacity>
            <Modal visible={showBillCategoryPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowBillCategoryPicker(false)} />
              <View style={{backgroundColor:t.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Select Category</Text>
                <ScrollView>
                  <TouchableOpacity onPress={()=>{Alert.prompt('New Category','Enter a category name',(text)=>{const t=(text||'').trim(); if(t){setBillForm(f=>({...f,category:t}));setShowBillCategoryPicker(false);}});}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,marginBottom:2}}>
                    <Text style={{color:'#A8C4D4',fontSize:15,fontWeight:'600'}}>+ Add new category…</Text>
                  </TouchableOpacity>
                  {[...BILL_CATEGORIES, ...[...new Set([...expenses,...bills].map(x=>x.category).filter(Boolean))].filter(c=>!BILL_CATEGORIES.includes(c))].sort((a,b)=>a==='Other'?1:b==='Other'?-1:a.localeCompare(b)).map(cat=>(
                    <TouchableOpacity key={cat} onPress={()=>{setBillForm(f=>({...f,category:cat}));setShowBillCategoryPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,backgroundColor:billForm.category===cat?t.chip:'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:billForm.category===cat?t.accent:t.text,fontSize:15}}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>AMOUNT ($)</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={billForm.amount?(()=>{const parts=billForm.amount.split('.');const intPart=Number(parts[0].replace(/,/g,'')||0).toLocaleString('en-US');return parts.length>1?intPart+'.'+parts[1]:intPart;})():''} onChangeText={v=>{const raw=v.replace(/,/g,'');if(raw===''||/^\d*\.?\d*$/.test(raw))setBillForm(f=>({...f,amount:raw}));}} placeholder="0.00" placeholderTextColor="#7A9A7A" keyboardType="decimal-pad" />
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>BILL DATE</Text>
            <TouchableOpacity onPress={()=>{setBillCalViewYear(new Date().getFullYear());setBillCalViewMonth(new Date().getMonth());setBillDatePickerVisible(true);}} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:billForm.billDate?t.text:t.sub,fontSize:15}}>{billForm.billDate ? new Date(billForm.billDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>
              <Text style={{color:t.sub,fontSize:16}}>📅</Text>
            </TouchableOpacity>
            <Modal visible={billDatePickerVisible} transparent animationType='fade'>
              <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',alignItems:'center',padding:24}}>
                <View style={{backgroundColor:t.card,borderRadius:16,padding:20,width:'100%',maxWidth:340}}>
                  {(()=>{
                    const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
                    const dayNames=['Su','Mo','Tu','We','Th','Fr','Sa'];
                    const firstDay=new Date(billCalViewYear,billCalViewMonth,1).getDay();
                    const daysInMonth=new Date(billCalViewYear,billCalViewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&billForm.dueDate===`${billCalViewYear}-${String(billCalViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===billCalViewYear&&t.getMonth()===billCalViewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(billCalViewMonth===0){setBillCalViewMonth(11);setBillCalViewYear(y=>y-1);}else setBillCalViewMonth(m=>m-1);}} style={{padding:8}}>
                            <Text style={{color:t.accent,fontSize:20}}>‹</Text>
                          </TouchableOpacity>
                          <Text style={{color:t.text,fontSize:16,fontWeight:'600'}}>{monthNames[billCalViewMonth]} {billCalViewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(billCalViewMonth===11){setBillCalViewMonth(0);setBillCalViewYear(y=>y+1);}else setBillCalViewMonth(m=>m+1);}} style={{padding:8}}>
                            <Text style={{color:t.accent,fontSize:20}}>›</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:'row',marginBottom:8}}>
                          {dayNames.map(d=><View key={d} style={{flex:1,alignItems:'center'}}><Text style={{color:t.sub,fontSize:11,fontWeight:'600'}}>{d}</Text></View>)}
                        </View>
                        <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${billCalViewYear}-${String(billCalViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;setBillForm(f=>({...f,billDate:ds}));setBillDatePickerVisible(false);}}} style={{width:'14.28%',aspectRatio:1,alignItems:'center',justifyContent:'center',marginBottom:2}}>
                              {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSelected(d)?t.accent:'transparent',alignItems:'center',justifyContent:'center',borderWidth:isToday(d)&&!isSelected(d)?1:0,borderColor:t.accent}}>
                                <Text style={{color:isSelected(d)?t.bg:t.text,fontSize:14,fontWeight:isSelected(d)||isToday(d)?'700':'400'}}>{d}</Text>
                              </View>:null}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={()=>setBillDatePickerVisible(false)} style={{marginTop:16,padding:12,alignItems:'center',borderTopWidth:1,borderTopColor:t.chip}}>
                          <Text style={{color:t.sub,fontSize:15}}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Modal>
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>DUE DATE (OPTIONAL)</Text>
            <TouchableOpacity onPress={()=>{setBillDueCalViewYear(new Date().getFullYear());setBillDueCalViewMonth(new Date().getMonth());setBillDueDatePickerVisible(true);}} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:billForm.dueDate?t.text:t.sub,fontSize:15}}>{billForm.dueDate ? new Date(billForm.dueDate+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select due date'}</Text>
              <Text style={{color:t.sub,fontSize:16}}>📅</Text>
            </TouchableOpacity>
            <Modal visible={billDueDatePickerVisible} transparent animationType='fade'>
              <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.6)',justifyContent:'center',alignItems:'center',padding:24}}>
                <View style={{backgroundColor:t.card,borderRadius:16,padding:20,width:'100%',maxWidth:340}}>
                  {(()=>{
                    const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
                    const dayNames=['Su','Mo','Tu','We','Th','Fr','Sa'];
                    const firstDay=new Date(billDueCalViewYear,billDueCalViewMonth,1).getDay();
                    const daysInMonth=new Date(billDueCalViewYear,billDueCalViewMonth+1,0).getDate();
                    const cells=Array.from({length:firstDay+daysInMonth},(_,i)=>i<firstDay?null:i-firstDay+1);
                    const isSelected=(d)=>d&&billForm.dueDate===`${billDueCalViewYear}-${String(billDueCalViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                    const isToday=(d)=>{const t=new Date();return d&&t.getFullYear()===billDueCalViewYear&&t.getMonth()===billDueCalViewMonth&&t.getDate()===d;};
                    return(
                      <View>
                        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                          <TouchableOpacity onPress={()=>{if(billDueCalViewMonth===0){setBillDueCalViewMonth(11);setBillDueCalViewYear(y=>y-1);}else setBillDueCalViewMonth(m=>m-1);}} style={{padding:8}}>
                            <Text style={{color:t.accent,fontSize:20}}>‹</Text>
                          </TouchableOpacity>
                          <Text style={{color:t.text,fontSize:16,fontWeight:'600'}}>{monthNames[billDueCalViewMonth]} {billDueCalViewYear}</Text>
                          <TouchableOpacity onPress={()=>{if(billDueCalViewMonth===11){setBillDueCalViewMonth(0);setBillDueCalViewYear(y=>y+1);}else setBillDueCalViewMonth(m=>m+1);}} style={{padding:8}}>
                            <Text style={{color:t.accent,fontSize:20}}>›</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={{flexDirection:'row',marginBottom:8}}>
                          {dayNames.map(d=><View key={d} style={{flex:1,alignItems:'center'}}><Text style={{color:t.sub,fontSize:11,fontWeight:'600'}}>{d}</Text></View>)}
                        </View>
                        <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                          {cells.map((d,i)=>(
                            <TouchableOpacity key={i} onPress={()=>{if(d){const ds=`${billDueCalViewYear}-${String(billDueCalViewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;setBillForm(f=>({...f,dueDate:ds}));setBillDueDatePickerVisible(false);}}} style={{width:'14.28%',aspectRatio:1,alignItems:'center',justifyContent:'center',marginBottom:2}}>
                              {d?<View style={{width:32,height:32,borderRadius:16,backgroundColor:isSelected(d)?t.accent:'transparent',alignItems:'center',justifyContent:'center',borderWidth:isToday(d)&&!isSelected(d)?1:0,borderColor:t.accent}}>
                                <Text style={{color:isSelected(d)?t.bg:t.text,fontSize:14,fontWeight:isSelected(d)||isToday(d)?'700':'400'}}>{d}</Text>
                              </View>:null}
                            </TouchableOpacity>
                          ))}
                        </View>
                        <TouchableOpacity onPress={()=>setBillDueDatePickerVisible(false)} style={{marginTop:16,padding:12,alignItems:'center',borderTopWidth:1,borderTopColor:t.chip}}>
                          <Text style={{color:t.sub,fontSize:15}}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
                </View>
              </View>
            </Modal>
<Text style={{color:t.sub,fontSize:11,marginBottom:6}}>DESCRIPTION</Text>
            <TextInput style={{backgroundColor:t.card,borderRadius:10,padding:14,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={billForm.description} onChangeText={v=>setBillForm(f=>({...f,description:v}))} placeholder="Monthly rent" placeholderTextColor="#7A9A7A" />
            <Text style={{color:t.sub,fontSize:11,marginBottom:6}}>REPEAT</Text>
            <TouchableOpacity onPress={()=>setShowBillRepeatPicker(true)} style={{backgroundColor:t.card,borderRadius:10,padding:14,marginBottom:8,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:billForm.recurring?t.text:t.sub,fontSize:15}}>{billForm.recurring?('🔁 '+freqLabel(billForm.recurring)):'One-time (does not repeat)'}</Text>
              <Text style={{color:t.sub,fontSize:12}}>▼</Text>
            </TouchableOpacity>
            {billForm.recurring ? <Text style={{color:t.sub,fontSize:12,marginBottom:8}}>You'll be asked before each new bill is created.</Text> : null}
            <Modal visible={showBillRepeatPicker} transparent animationType='slide'>
              <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.5)'}} onPress={()=>setShowBillRepeatPicker(false)} />
              <View style={{backgroundColor:t.card,borderTopLeftRadius:20,borderTopRightRadius:20,padding:20,maxHeight:'60%'}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'700',marginBottom:16,textAlign:'center'}}>Repeat this bill</Text>
                <ScrollView>
                  {FREQUENCIES.map(f=>(
                    <TouchableOpacity key={f.key||'once'} onPress={()=>{setBillForm(fm=>({...fm,recurring:f.key}));setShowBillRepeatPicker(false);}} style={{padding:14,borderBottomWidth:0.5,borderBottomColor:t.chip,backgroundColor:billForm.recurring===f.key?t.chip:'transparent',borderRadius:8,marginBottom:2}}>
                      <Text style={{color:billForm.recurring===f.key?t.accent:t.text,fontSize:15}}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Modal>
            <TouchableOpacity onPress={()=>{setShowBill(false);setEditingBill(false);}} style={{backgroundColor:t.chip,borderRadius:12,padding:16,alignItems:'center',marginTop:8}}>
              <Text style={{color:t.accent,fontSize:16,fontWeight:'600'}}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Reports Modal */}
      <Modal visible={showReports} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:'#ffffff'}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <Text style={{color:'#14281D',fontSize:28,fontWeight:'700'}}>Reports</Text>
              <TouchableOpacity onPress={()=>setShowReports(false)}>
                <Text style={{color:'#2D7A4A',fontSize:16,fontWeight:'600'}}>Done</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:'#8A9A8A',fontSize:14,marginBottom:20}}>Profit & Loss summary</Text>

            {/* Period toggle */}
            <View style={{flexDirection:'row',backgroundColor:'#EEF3EE',borderRadius:10,padding:4,marginBottom:24}}>
              {[{k:'month',l:'This Month'},{k:'ytd',l:'Year to Date'},{k:'all',l:'All Time'}].map(p=>(
                <TouchableOpacity key={p.k} onPress={()=>setReportPeriod(p.k)} style={{flex:1,paddingVertical:8,borderRadius:8,alignItems:'center',backgroundColor: reportPeriod===p.k ? '#ffffff' : 'transparent', shadowColor:'#000', shadowOpacity: reportPeriod===p.k?0.08:0, shadowRadius:3, shadowOffset:{width:0,height:1}}}>
                  <Text style={{fontSize:12.5,fontWeight:'600',color: reportPeriod===p.k ? '#14281D' : '#8A9A8A'}}>{p.l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {(() => {
              const fInv = invoices.filter(i=>inPeriod(i.issueDate,reportPeriod));
              const fExp = expenses.filter(e=>inPeriod(e.date,reportPeriod));
              const fPaidBills = bills.filter(b=>b.status==='paid' && inPeriod(b.billDate||b.dueDate||b.createdAt,reportPeriod));
              const invoiced = fInv.reduce((s,i)=>s+Number(i.total||0),0);
              const paid = fInv.filter(i=>i.status==='paid').reduce((s,i)=>s+Number(i.total||0),0);
              const outstanding = fInv.filter(i=>i.status!=='paid').reduce((s,i)=>s+Number(i.total||0),0);
              const costItems = [...fExp.map(e=>({category:e.category, amount:Number(e.amount||0)})), ...fPaidBills.map(b=>({category:b.category, amount:Number(b.amount||0)}))];
              const totalExp = costItems.reduce((s,x)=>s+x.amount,0);
              const owed = bills.filter(b=>b.status!=='paid').reduce((s,b)=>s+Number(b.amount||0),0);
              const net = paid - totalExp;
              const byCat = {};
              costItems.forEach(x=>{ const c=x.category||'Other'; byCat[c]=(byCat[c]||0)+x.amount; });
              const cats = Object.keys(byCat).sort((a,b)=>byCat[b]-byCat[a]);
              const svcRev = {};
              fInv.forEach(inv=>(inv.lines||[]).forEach(l=>{ const k=l.service||'Unassigned'; svcRev[k]=(svcRev[k]||0)+Number(l.amount||0); }));
              const svcKeys = Object.keys(svcRev).sort((a,b)=> a==='Unassigned'?1 : b==='Unassigned'?-1 : svcRev[b]-svcRev[a]);
              const hasServices = svcKeys.some(k=>k!=='Unassigned');
              const card = {backgroundColor:'#F7FAF7',borderRadius:14,padding:18,marginBottom:16,borderWidth:1,borderColor:'#E4ECE4'};
              const hdr = {color:'#8A9A8A',fontSize:12,fontWeight:'700',letterSpacing:1,marginBottom:10};
              const row = (label,val,color,bold)=>(
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:bold?0:12}}>
                  <Text style={{color: bold?'#14281D':'#5A6B5A',fontSize: bold?16:14,fontWeight: bold?'700':'400'}}>{label}</Text>
                  <Text style={{color:color,fontSize: bold?20:14,fontWeight: bold?'700':'600'}}>{fmt(val)}</Text>
                </View>
              );
              return (
                <View>
                  <Text style={hdr}>INCOME</Text>
                  <View style={card}>
                    {row('Total invoiced', invoiced, '#14281D')}
                    {row('Paid', paid, '#2D7A4A')}
                    {row('Outstanding', outstanding, '#B7791F')}
                  </View>

                  {hasServices && (
                    <View>
                      <Text style={hdr}>REVENUE BY SERVICE</Text>
                      <View style={card}>
                        {svcKeys.map((s,idx)=>(
                          <View key={s} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:idx===svcKeys.length-1?0:10}}>
                            <Text style={{color: s==='Unassigned'?'#B0BCB0':'#5A6B5A',fontSize:14,fontStyle: s==='Unassigned'?'italic':'normal'}}>{s}</Text>
                            <Text style={{color:'#2D7A4A',fontSize:14,fontWeight:'500'}}>{fmt(svcRev[s])}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={{color:'#B0BCB0',fontSize:11,marginTop:-6,marginBottom:16}}>Based on invoiced line items in this period.</Text>
                    </View>
                  )}

                  <Text style={hdr}>EXPENSES</Text>
                  <View style={card}>
                    {row('Total expenses', totalExp, '#C0392B')}
                    {cats.length>0 && <View style={{height:1,backgroundColor:'#E4ECE4',marginVertical:10}}/>}
                    {cats.map(c=>(
                      <View key={c} style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
                        <Text style={{color:'#8A9A8A',fontSize:13}}>{c}</Text>
                        <Text style={{color:'#9A5A52',fontSize:13,fontWeight:'500'}}>{fmt(byCat[c])}</Text>
                      </View>
                    ))}
                    {cats.length===0 && <Text style={{color:'#B0BCB0',fontSize:13,fontStyle:'italic'}}>No expenses in this period</Text>}
                  </View>

                  {owed > 0 ? <Text style={{color:'#B7791F',fontSize:12,marginBottom:16}}>Unpaid bills still owed (not counted in profit): {fmt(owed)}</Text> : null}
                  <Text style={hdr}>NET INCOME</Text>
                  <View style={[card,{backgroundColor: net>=0?'#EAF6EE':'#FBEEEC', borderColor: net>=0?'#CDE9D6':'#F3D6D1'}]}>
                    {row('Revenue (paid)', paid, '#2D7A4A')}
                    {row('Less expenses', totalExp, '#C0392B')}
                    <View style={{height:1,backgroundColor: net>=0?'#CDE9D6':'#F3D6D1',marginVertical:12}}/>
                    {row(net>=0?'Net profit':'Net loss', net, net>=0?'#2D7A4A':'#C0392B', true)}
                  </View>
                  <View style={{height:40}}/>
                </View>
              );
            })()}
          </View>
        </ScrollView>
      </Modal>
      {/* Customers Modal */}
      <Modal visible={showCustomers} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:t.bg}}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <Text style={{color:t.text,fontSize:22,fontWeight:'700'}}>Customers</Text>
              <TouchableOpacity onPress={()=>setShowCustomers(false)}>
                <Text style={{color:t.sub,fontSize:16}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:t.sub,fontSize:13,marginBottom:16}}>{customers.length} customer{customers.length!==1?'s':''}</Text>
            <TouchableOpacity onPress={()=>{setCustomerForm({name:'',email:'',phone:'',salesperson:'',notes:'',dateAdded:new Date().toISOString().slice(0,10),lastContact:''});setEditingCustomer(null);setShowCustomerForm(true);}} style={{backgroundColor:t.chip,borderRadius:12,padding:14,alignItems:'center',marginBottom:16}}>
              <Text style={{color:t.accent,fontSize:15,fontWeight:'600'}}>+ Add Customer</Text>
            </TouchableOpacity>
            <TextInput placeholder='Search Customers' placeholderTextColor={t.sub} value={customerSearch} onChangeText={setCustomerSearch} style={{backgroundColor:t.card,borderRadius:8,paddingVertical:11,paddingHorizontal:12,color:t.text,fontSize:14,marginBottom:16,borderWidth:1,borderColor:t.chip}} />
            {showCustomerForm&&(
              <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:16}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'600',marginBottom:12}}>{editingCustomer?'Edit Customer':'New Customer'}</Text>
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>COMPANY</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={customerForm.company||''} onChangeText={v=>setCustomerForm(f=>({...f,company:v}))} placeholder='Acme Corp' placeholderTextColor={t.sub} />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>CONTACT NAME *</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={customerForm.name} onChangeText={v=>setCustomerForm(f=>({...f,name:v}))} placeholder='John Smith' placeholderTextColor={t.sub} />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>CELL PHONE</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={customerForm.cellPhone||''} onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setCustomerForm(f=>({...f,cellPhone:p}));}} placeholder='(555) 000-0000' placeholderTextColor={t.sub} keyboardType='phone-pad' />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>OFFICE PHONE</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={customerForm.officePhone||''} onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setCustomerForm(f=>({...f,officePhone:p}));}} placeholder='(555) 000-0000' placeholderTextColor={t.sub} keyboardType='phone-pad' />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>EMAIL</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={customerForm.email} onChangeText={v=>setCustomerForm(f=>({...f,email:v}))} placeholder='billing@acme.com' placeholderTextColor={t.sub} keyboardType='email-address' />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>PHONE</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={customerForm.phone} onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setCustomerForm(f=>({...f,phone:p}));}} placeholder='(555) 000-0000' placeholderTextColor={t.sub} keyboardType='phone-pad' />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>SALESPERSON</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={customerForm.salesperson} onChangeText={v=>setCustomerForm(f=>({...f,salesperson:v}))} placeholder='Jane Smith' placeholderTextColor={t.sub} />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>DATE ADDED</Text>
                <TouchableOpacity onPress={()=>{setShowCustomerDatePicker(true);}} style={{backgroundColor:t.bg,borderRadius:8,padding:12,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between'}}>
                  <Text style={{color:customerForm.dateAdded?t.text:t.sub,fontSize:15}}>{customerForm.dateAdded ? new Date(customerForm.dateAdded+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>
                </TouchableOpacity>
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>NOTES</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip,minHeight:80}} value={customerForm.notes} onChangeText={v=>setCustomerForm(f=>({...f,notes:v}))} placeholder='Notes about this customer' placeholderTextColor={t.sub} multiline />
<View style={{flexDirection:'row',gap:10}}>
                  <TouchableOpacity onPress={()=>setShowCustomerForm(false)} style={{flex:1,backgroundColor:t.chip,borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:t.accent,fontSize:14}}>Cancel</Text>
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
                    <Text style={{color:t.text,fontSize:14,fontWeight:'600'}}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {customers.filter(c=>c.name?.toLowerCase().includes(customerSearch.toLowerCase())||c.email?.toLowerCase().includes(customerSearch.toLowerCase())).map(c=>(
              <View key={c.id} style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,borderWidth:1,borderColor:t.border,flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'}}>
                <View style={{flex:1}}>
                  <Text style={{color:t.text,fontSize:16,fontWeight:'600'}}>{c.company||'Company'}</Text>
                  <Text style={{color:t.sub,fontSize:14,marginTop:2}}>{c.contactName||c.name||'Contact'}</Text>
                  {c.cellPhone?<Text style={{color:t.sub,fontSize:12,marginTop:4}}>Cell: {c.cellPhone}</Text>:null}
                  {c.officePhone?<Text style={{color:t.sub,fontSize:12,marginTop:2}}>Office: {c.officePhone}</Text>:null}
                </View>
                <TouchableOpacity onPress={()=>{setSelectedCustomer(c);setShowCustomerDetail(true);}} style={{backgroundColor:t.accent,borderRadius:8,padding:12,alignItems:'center',marginLeft:12}}>
                  <Text style={{color:t.bg,fontSize:15,fontWeight:'600'}}>Open</Text>
                </TouchableOpacity>
              </View>
            ))}
            {customers.length===0&&<Text style={{color:t.sub,textAlign:'center',marginTop:40}}>No customers yet</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Vendors Modal */}
      <Modal visible={showVendors} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1,backgroundColor:t.bg}}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28}}>
              <Text style={{color:t.text,fontSize:22,fontWeight:'700'}}>Vendors</Text>
              <TouchableOpacity onPress={()=>setShowVendors(false)}>
                <Text style={{color:t.sub,fontSize:16}}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={{color:t.sub,fontSize:13,marginBottom:16}}>{vendors.length} vendor{vendors.length!==1?'s':''}</Text>
            <TouchableOpacity onPress={()=>{setVendorForm({name:'',email:'',phone:'',notes:'',dateAdded:new Date().toISOString().slice(0,10),lastContact:''});setEditingVendor(null);setShowVendorForm(true);}} style={{backgroundColor:t.chip,borderRadius:12,padding:14,alignItems:'center',marginBottom:16}}>
              <Text style={{color:t.accent,fontSize:15,fontWeight:'600'}}>+ Add Vendor</Text>
            </TouchableOpacity>
            <TextInput placeholder='Search Vendors' placeholderTextColor={t.sub} value={vendorSearch} onChangeText={setVendorSearch} style={{backgroundColor:t.card,borderRadius:8,paddingVertical:11,paddingHorizontal:12,color:t.text,fontSize:14,marginBottom:16,borderWidth:1,borderColor:t.chip}} />
            {showVendorForm&&(
              <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:16}}>
                <Text style={{color:t.accent,fontSize:16,fontWeight:'600',marginBottom:12}}>{editingVendor?'Edit Vendor':'New Vendor'}</Text>
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>NAME *</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={vendorForm.name} onChangeText={v=>setVendorForm(f=>({...f,name:v}))} placeholder='Vendor Name' placeholderTextColor={t.sub} />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>EMAIL</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:10,borderWidth:1,borderColor:t.chip}} value={vendorForm.email} onChangeText={v=>setVendorForm(f=>({...f,email:v}))} placeholder='vendor@example.com' placeholderTextColor={t.sub} keyboardType='email-address' />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>PHONE</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip}} value={vendorForm.phone} onChangeText={v=>{const d=v.replace(/\D/g,'').slice(0,10);let p=d;if(d.length>=7)p='('+d.slice(0,3)+') '+d.slice(3,6)+'-'+d.slice(6);else if(d.length>=4)p='('+d.slice(0,3)+') '+d.slice(3);setVendorForm(f=>({...f,phone:p}));}} placeholder='(555) 000-0000' placeholderTextColor={t.sub} keyboardType='phone-pad' />
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>DATE ADDED</Text>
                <TouchableOpacity style={{backgroundColor:t.bg,borderRadius:8,padding:12,marginBottom:16,borderWidth:1,borderColor:t.chip,flexDirection:'row',justifyContent:'space-between'}}>
                  <Text style={{color:vendorForm.dateAdded?t.text:t.sub,fontSize:15}}>{vendorForm.dateAdded ? new Date(vendorForm.dateAdded+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'Select date'}</Text>
                </TouchableOpacity>
                <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>NOTES</Text>
                <TextInput style={{backgroundColor:t.bg,borderRadius:8,padding:12,color:t.text,fontSize:15,marginBottom:16,borderWidth:1,borderColor:t.chip,minHeight:80}} value={vendorForm.notes} onChangeText={v=>setVendorForm(f=>({...f,notes:v}))} placeholder='Notes about this vendor' placeholderTextColor={t.sub} multiline />
<View style={{flexDirection:'row',gap:10}}>
                  <TouchableOpacity onPress={()=>setShowVendorForm(false)} style={{flex:1,backgroundColor:t.chip,borderRadius:10,padding:12,alignItems:'center'}}>
                    <Text style={{color:t.accent,fontSize:14}}>Cancel</Text>
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
                    <Text style={{color:t.text,fontSize:14,fontWeight:'600'}}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {vendors.filter(v=>v.name?.toLowerCase().includes(vendorSearch.toLowerCase())||v.email?.toLowerCase().includes(vendorSearch.toLowerCase())).map(v=>(
              <View key={v.id} style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12}}>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                  <Text style={{color:t.text,fontSize:16,fontWeight:'600'}}>{v.name}</Text>
                  <View style={{flexDirection:'row',gap:18}}>
                    <TouchableOpacity onPress={()=>{setVendorForm({name:v.name||'',email:v.email||'',phone:v.phone||''});setEditingVendor(v);setShowVendorForm(true);}}>
                      <Text style={{color:t.sub,fontSize:13}}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>deleteVendor(v)}>
                      <Text style={{color:t.danger,fontSize:13}}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {v.email?<Text style={{color:t.sub,fontSize:13,marginTop:4}}>{v.email}</Text>:null}
                {v.phone?<Text style={{color:t.sub,fontSize:13,marginTop:2}}>{v.phone}</Text>:null}
              </View>
            ))}
            {vendors.length===0&&<Text style={{color:t.sub,textAlign:'center',marginTop:40}}>No vendors yet</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Customer Detail Modal */}
      <Modal visible={showCustomerDetail} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={{flex:1,backgroundColor:t.bg}}>
          <View style={{padding:24,paddingTop:60}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
              <TouchableOpacity onPress={()=>setShowCustomerDetail(false)} style={{backgroundColor:t.card,borderRadius:8,paddingVertical:10,paddingHorizontal:16,borderWidth:1,borderColor:t.border}}>
                <Text style={{color:t.accent,fontSize:15,fontWeight:'600'}}>← Close</Text>
              </TouchableOpacity>
              <View style={{flexDirection:'row',gap:12}}>
                <TouchableOpacity onPress={()=>{if(selectedCustomer){setCustomerForm({name:selectedCustomer.name||'',company:selectedCustomer.company||'',contactName:selectedCustomer.contactName||'',email:selectedCustomer.email||'',phone:selectedCustomer.phone||'',cellPhone:selectedCustomer.cellPhone||'',officePhone:selectedCustomer.officePhone||'',salesperson:selectedCustomer.salesperson||'',notes:selectedCustomer.notes||'',dateAdded:selectedCustomer.dateAdded||''});setEditingCustomer(selectedCustomer);setShowCustomerForm(true);}}} style={{backgroundColor:t.card,borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:t.accent,fontSize:13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{if(selectedCustomer){deleteCustomer(selectedCustomer);}}} style={{backgroundColor:'#4a1a1a',borderRadius:8,padding:8,paddingHorizontal:12}}>
                  <Text style={{color:'#F0A9A0',fontSize:13}}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
            {selectedCustomer && (
              <View>
                <Text style={{color:t.text,fontSize:24,fontWeight:'700',marginBottom:4}}>{selectedCustomer.company||'Company'}</Text>
                <Text style={{color:t.sub,fontSize:14,marginBottom:16}}>{selectedCustomer.contactName||selectedCustomer.name||'Contact'}</Text>
                {selectedCustomer.cellPhone && (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Cell Phone</Text>
                    <Text style={{color:t.text,fontSize:13}}>{selectedCustomer.cellPhone}</Text>
                  </View>
                )}
                {selectedCustomer.officePhone && (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Office Phone</Text>
                    <Text style={{color:t.text,fontSize:13}}>{selectedCustomer.officePhone}</Text>
                  </View>
                )}
                {selectedCustomer.email && (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Email</Text>
                    <Text style={{color:t.text,fontSize:13}}>{selectedCustomer.email}</Text>
                  </View>
                )}
                {selectedCustomer.salesperson && (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12,flexDirection:'row',justifyContent:'space-between'}}>
                    <Text style={{color:t.sub,fontSize:13}}>Salesperson</Text>
                    <Text style={{color:t.text,fontSize:13}}>{selectedCustomer.salesperson}</Text>
                  </View>
                )}
                {selectedCustomer.notes && (
                  <View style={{backgroundColor:t.card,borderRadius:12,padding:16,marginBottom:12}}>
                    <Text style={{color:t.sub,fontSize:11,marginBottom:4}}>NOTES</Text>
                    <Text style={{color:t.text,fontSize:14}}>{selectedCustomer.notes}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

    </ScrollView>
  );
}



































































