import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { insertLead } from '../database/Database';
import { leadsAtom } from '../Atoms/LeadAtom';
import { useAtom } from 'jotai';


const LeadForm: React.FC = () => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [, setLeads] = useAtom(leadsAtom);

  const handleAddLead = async () => {
    if (!name || !mobileNumber || !status) {
      Alert.alert('Please fill in all required fields');
      return;
    }

    try {
      await insertLead(name, mobileNumber, description, status);
      Alert.alert('Success', 'Lead added successfully');
      setName('');
      setMobileNumber('');
      setDescription('');
      setStatus('');
      // Update leadsAtom to trigger FlatList re-render
      setLeads((prev) => !prev);
    } catch (error) {
      Alert.alert('Error', 'Error inserting lead');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Status"
        value={status}
        onChangeText={setStatus}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddLead}>
        <Text style={styles.buttonText}>Add Lead</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'grey',
    color: 'black',
  },
  button: {
    backgroundColor: 'green',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default LeadForm;
