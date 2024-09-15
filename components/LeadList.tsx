import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { getLeads, deleteLead, updateLead } from '../database/Database';
import { generatePDF } from './pdfGenerator';
import RNFS from 'react-native-fs';
import { useAtom } from 'jotai';
import { leadsAtom } from '../Atoms/LeadAtom';

interface Lead {
  id: number;
  name: string;
  mobileNumber: string;
  description: string;
  status: string;
}

const LeadList: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [leadsUpdate] = useAtom(leadsAtom);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const fetchedLeads = await getLeads();
        setLeads(fetchedLeads);
      // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
      } catch (error) {
        console.error('Error fetching leads', error);
        setError('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [leadsUpdate]);

  const handleDelete = async (id: number) => {
    try {
      await deleteLead(id);
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
      Alert.alert('Success', 'Lead deleted successfully');
    // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
    } catch (error) {
      Alert.alert('Error', 'Error deleting lead');
    }
  };

  const handleUpdate = async () => {
    if (editingLead) {
      try {
        await updateLead(editingLead.id, name, mobileNumber, description, status);
        const updatedLeads = leads.map(lead =>
          lead.id === editingLead.id
            ? { ...lead, name, mobileNumber, description, status }
            : lead
        );
        setLeads(updatedLeads);
        setEditingLead(null);
        setName('');
        setMobileNumber('');
        setDescription('');
        setStatus('');
        Alert.alert('Success', 'Lead updated successfully');
      // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
      } catch (error) {
        Alert.alert('Error', 'Error updating lead');
      }
    }
  };

  const startEditing = (lead: Lead) => {
    setEditingLead(lead);
    setName(lead.name);
    setMobileNumber(lead.mobileNumber);
    setDescription(lead.description);
    setStatus(lead.status);
  };

  const handleDownloadPDF = async () => {
    try {
      const filePath = await generatePDF(); // Call the generatePDF function
      const downloadpath = `${RNFS.DownloadDirectoryPath}/LeadDocument.pdf`;
      await RNFS.copyFile(filePath , downloadpath);
      Alert.alert('Success', `PDF downloaded successfully at ${downloadpath}`);
    // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
    } catch (error) {
      Alert.alert('Error', 'Could not generate PDF');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {editingLead && (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            value={mobileNumber}
            onChangeText={setMobileNumber}
            placeholder="Mobile Number"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            value={status}
            onChangeText={setStatus}
            placeholder="Status"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.button} onPress={handleUpdate}>
            <Text style={styles.buttonText}>Update Lead</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={leads}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.leadItem}>
            <Text style={styles.txt}>Name: {item.name}</Text>
            <Text style={styles.txt}>Mobile: {item.mobileNumber}</Text>
            <Text style={styles.txt}>Status: {item.status}</Text>
            <Text style={styles.txt}>Description: {item.description}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => startEditing(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttondelete} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add "Download PDF" button */}
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
        <Text style={styles.downloadButtonText}>Download PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  leadItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    gap: 10,
  },
  txt: {
    color: '#333',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  editContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  button: {
    flex: 1,
    backgroundColor: 'green',
    borderRadius: 4,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttondelete: {
    flex: 1,
    backgroundColor: 'red',
    borderRadius: 4,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: '#007BFF',
    borderRadius: 4,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LeadList;
