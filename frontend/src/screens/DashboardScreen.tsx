import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Employee, KMeansTier } from '../types/types';

export default function DashboardScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [kmeansTiers, setKmeansTiers] = useState<KMeansTier[]>([]);
  
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const fetchData = async () => {
    try {
      const empRes = await fetch('http://localhost:3000/api/employees');
      setEmployees(await empRes.json());

      const kmRes = await fetch('http://localhost:3000/api/analytics/kmeans');
      setKmeansTiers(await kmRes.json());
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!name || !position || !salary) return;
    await fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, position, salary: Number(salary) }),
    });
    setName(''); setPosition(''); setSalary('');
    fetchData();
  };

  const handleUpdate = async () => {
    if (!editingEmp) return;
    await fetch(`http://localhost:3000/api/employees/${editingEmp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingEmp.name,
        position: editingEmp.position,
        salary: Number(editingEmp.salary),
      }),
    });
    setEditingEmp(null);
    fetchData();
  };

  const handleToggle = async (id: number) => {
    await fetch(`http://localhost:3000/api/employees/${id}/toggle`, { method: 'PATCH' });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    await fetch(`http://localhost:3000/api/employees/${id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerBadge}>LUXURY CORPORATE</Text>
        <Text style={styles.headerTitle}>Executive HR Dashboard</Text>
      </View>

      <Text style={styles.sectionTitle}>1D K-Means Salary Clustering (k=3)</Text>
      <View style={styles.tierGrid}>
        {kmeansTiers.map((tier, idx) => (
          <View key={idx} style={styles.tierCard}>
            <Text style={styles.tierName}>{tier.tierName}</Text>
            <Text style={styles.tierCentroid}>${tier.centroid?.toLocaleString() || 0}</Text>
            <Text style={styles.tierCount}>{tier.members?.length || 0} Members</Text>
          </View>
        ))}
      </View>

      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>Add New Employee</Text>
        <View style={styles.formRow}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Name" placeholderTextColor="#6b7280" value={name} onChangeText={setName} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Position" placeholderTextColor="#6b7280" value={position} onChangeText={setPosition} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Salary" placeholderTextColor="#6b7280" keyboardType="numeric" value={salary} onChangeText={setSalary} />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}><Text style={styles.btnText}>Add</Text></TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Employee Management</Text>
      {employees.map(emp => (
        <View key={emp.id} style={styles.empCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{emp.name.charAt(0)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.empName}>{emp.name}</Text>
            <Text style={styles.empSub}>{emp.position} • ${emp.salary.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={[styles.statusBadge, { backgroundColor: emp.isActive ? '#065f46' : '#991b1b' }]} onPress={() => handleToggle(emp.id)}>
            <Text style={styles.statusText}>{emp.isActive ? 'Active' : 'Inactive'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditingEmp(emp)}><Text style={styles.btnText}>Edit</Text></TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(emp.id)}><Text style={styles.btnText}>Delete</Text></TouchableOpacity>
        </View>
      ))}

      {editingEmp && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.cardTitle}>Edit Employee</Text>
              <TextInput style={styles.input} value={editingEmp.name} onChangeText={text => setEditingEmp({ ...editingEmp, name: text })} />
              <TextInput style={styles.input} value={editingEmp.position} onChangeText={text => setEditingEmp({ ...editingEmp, position: text })} />
              <TextInput style={styles.input} keyboardType="numeric" value={String(editingEmp.salary)} onChangeText={text => setEditingEmp({ ...editingEmp, salary: Number(text) })} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.addBtn} onPress={handleUpdate}><Text style={styles.btnText}>Save</Text></TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => setEditingEmp(null)}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 20 },
  header: { marginBottom: 24 },
  headerBadge: { color: '#d97706', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  headerTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold' },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '600', marginVertical: 14 },
  tierGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  tierCard: { flex: 1, backgroundColor: '#111827', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' },
  tierName: { color: '#9ca3af', fontSize: 12 },
  tierCentroid: { color: '#d97706', fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
  tierCount: { color: '#6b7280', fontSize: 12 },
  formCard: { backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 20 },
  cardTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  formRow: { flexDirection: 'row', gap: 8 },
  input: { backgroundColor: '#1f2937', color: '#ffffff', borderRadius: 8, padding: 10, marginBottom: 8 },
  addBtn: { backgroundColor: '#d97706', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  empCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', padding: 12, borderRadius: 10, marginBottom: 8, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#ffffff', fontWeight: 'bold' },
  empName: { color: '#ffffff', fontWeight: 'bold' },
  empSub: { color: '#9ca3af', fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' },
  editBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtn: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 320, backgroundColor: '#111827', padding: 20, borderRadius: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
});