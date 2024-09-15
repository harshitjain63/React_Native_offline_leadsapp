import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import LeadForm from '../components/LeadForm';
import LeadList from '../components/LeadList';

const HomeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <LeadForm />
      <LeadList />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
