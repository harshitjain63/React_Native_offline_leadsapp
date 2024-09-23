import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {getLeads, deleteLead, updateLead} from '../database/Database';
import {generatePDF} from './pdfGenerator';
import RNFS from 'react-native-fs';
import {useAtom} from 'jotai';
import {leadsAtom} from '../Atoms/LeadAtom';
import axios from 'axios';
import {Picker} from '@react-native-picker/picker';
// import {Buffer} from 'buffer';

interface Lead {
  id: number;
  name: string;
  mobileNumber: string;
  description: string;
  status: string;
}

interface Printer {
  id: number;
  name: string;
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

  // New state for printers
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selectedPrinterId, setSelectedPrinterId] = useState('');
  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const fetchPrinters = async () => {
    try {
      const apiKey = 'T91ha3WpU_DI5Kq4exi4hK_UpfDNFCCQWQ-v1xXjJpo';
      const response = await axios.get('https://api.printnode.com/printers', {
        auth: {
          username: apiKey,
          password: 'printnode@123',
        },
      });
      setPrinters(response.data);
      // eslint-disable-next-line no-catch-shadow
    } catch (error) {
      console.error('Error fetching printers', error);
      Alert.alert('Error', 'Failed to load printers');
    }
  };

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
    fetchPrinters();
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
        await updateLead(
          editingLead.id,
          name,
          mobileNumber,
          description,
          status,
        );
        const updatedLeads = leads.map(lead =>
          lead.id === editingLead.id
            ? {...lead, name, mobileNumber, description, status}
            : lead,
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
      const filePath = await generatePDF();
      const downloadpath = `${RNFS.DownloadDirectoryPath}/LeadDocuments.pdf`;
      await RNFS.copyFile(filePath, downloadpath);
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

  const handlePrint = async () => {
    try {
      const apiKey = 'T91ha3WpU_DI5Kq4exi4hK_UpfDNFCCQWQ-v1xXjJpo';
      const printerId = selectedPrinterId;

      if (!printerId) {
        Alert.alert('Error', 'Please select a printer before printing');
        return;
      }

      const filePath = await generatePDF();

      const pdfBase64 = await RNFS.readFile(filePath, 'base64');

      const response = await axios.post(
        'https://api.printnode.com/printjobs',
        {
          printerId: printerId,
          title: 'Leads PDF Print',
          contentType: 'pdf_base64',
          content: pdfBase64,
        },
        {
          auth: {
            username: apiKey,
            password: '',
          },
        },
      );

      if (response.data) {
        Alert.alert('Success', 'PDF sent to printer successfully');
      }
      // eslint-disable-next-line no-catch-shadow, @typescript-eslint/no-shadow
    } catch (error) {
      Alert.alert('Error', 'Failed to print PDF');
      console.error('Printing Error: ', error);
    }
  };

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
        renderItem={({item}) => (
          <View style={styles.leadItem}>
            <Text style={styles.txt}>Name: {item.name}</Text>
            <Text style={styles.txt}>Mobile: {item.mobileNumber}</Text>
            <Text style={styles.txt}>Status: {item.status}</Text>
            <Text style={styles.txt}>Description: {item.description}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => startEditing(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttondelete}
                onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={handleDownloadPDF}>
        <Text style={styles.downloadButtonText}>Download PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
        <Text style={styles.printButtonText}>Print Leads</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.printButton}
        onPress={() => setShowPrinterModal(true)}>
        <Text style={styles.printButtonText}>Select Printer</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={showPrinterModal}
        onRequestClose={() => setShowPrinterModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Printer</Text>
            <Picker
              selectedValue={selectedPrinterId}
              onValueChange={(itemValue: React.SetStateAction<string>) =>
                setSelectedPrinterId(itemValue)
              }
              style={styles.picker}>
              {printers.map(printer => (
                <Picker.Item
                  key={printer.id}
                  label={printer.name}
                  value={printer.id}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowPrinterModal(false);
                handlePrint();
              }}>
              <Text style={styles.modalButtonText}>Print</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowPrinterModal(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    borderRadius: 4,
    padding: 12,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  printButton: {
    backgroundColor: '#007BFF',
    borderRadius: 4,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  printButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
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
