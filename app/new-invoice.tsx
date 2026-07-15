import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const API = 'http://192.168.1.190:3001/api';

export default function NewInvoiceScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ clientName:'', clientEmail:'', description:'', quantity:'1', price:'' });
  const [loading, setLoading] = useState(false);
  const total = (Number(form.quantity) * Number(form.price)).toFixed(2);

  async function save() {
    if (!form.clientName || !form.price) return Alert.alert('Please fill in client name and price');
    setLoading(true);
    try {
      const org = JSON.parse(global.ledgerOrg || '{}');
      const token = global.ledgerToken;
      const r = await fetch(API+'/orgs/'+org.id+'/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer '+token },
        body: JSON.stringify(form)
      });
      const j = await r.json();
      if (j.success) { Alert.alert('Invoice saved!'); router.back(); }
      else Alert.alert('Error', j.message);
    } catch(e) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Invoice</Text>
        <View style={{width:60}} />
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>CLIENT NAME</Text>
        <TextInput style={styles.input} value={form.clientName} onChangeText={v=>setForm(f=>({...f,clientName:v}))} placeholder='Acme Corp' placeholderTextColor='#7A9A7A' />
        <Text style={styles.label}>CLIENT EMAIL</Text>
        <TextInput style={styles.input} value={form.clientEmail} onChangeText={v=>setForm(f=>({...f,clientEmail:v}))} placeholder='billing@acme.com' placeholderTextColor='#7A9A7A' keyboardType='email-address' autoCapitalize='none' />
        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput style={styles.input} value={form.description} onChangeText={v=>setForm(f=>({...f,description:v}))} placeholder='Web design services' placeholderTextColor='#7A9A7A' />
        <View style={styles.row}>
          <View style={{flex:1}}>
            <Text style={styles.label}>QTY</Text>
            <TextInput style={styles.input} value={form.quantity} onChangeText={v=>setForm(f=>({...f,quantity:v}))} keyboardType='numeric' />
          </View>
          <View style={{flex:1,marginLeft:12}}>
            <Text style={styles.label}>PRICE ($)</Text>
            <TextInput style={styles.input} value={form.price} onChangeText={v=>setForm(f=>({...f,price:v}))} placeholder='0.00' placeholderTextColor='#7A9A7A' keyboardType='decimal-pad' />
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total}</Text>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Invoice'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#1C2E1C' },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:24, paddingTop:60 },
  back: { color:'#A8D4A8', fontSize:16 },
  title: { fontSize:18, fontWeight:'600', color:'#fff' },
  form: { padding:24 },
  label: { fontSize:11, fontWeight:'600', color:'#7A9A7A', letterSpacing:0.5, marginBottom:6, marginTop:16 },
  input: { backgroundColor:'#2D4A35', borderRadius:10, padding:14, color:'#fff', fontSize:15, borderWidth:1, borderColor:'#3D5A45' },
  row: { flexDirection:'row', marginTop:4 },
  totalRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'#2D4A35', borderRadius:10, padding:16, marginTop:20 },
  totalLabel: { color:'#7A9A7A', fontSize:14 },
  totalValue: { color:'#A8D4A8', fontSize:24, fontWeight:'700' },
  saveBtn: { backgroundColor:'#A8D4A8', borderRadius:12, padding:16, alignItems:'center', marginTop:20 },
  saveBtnText: { color:'#2D4A35', fontSize:16, fontWeight:'600' },
});
