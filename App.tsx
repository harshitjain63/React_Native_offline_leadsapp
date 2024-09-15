import React , {useEffect} from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Text, View } from 'react-native';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import { createTable } from './database/Database';

const App: React.FC = () => {
  useEffect(() => {
    createTable();
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerText}>Lead Manager</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add New Lead</Text>
          <LeadForm />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Existing Leads</Text>
          <LeadList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0', 
  },
  scrollContent: {
    padding: 20,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2, 
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#007BFF',
  },
});

export default App;
