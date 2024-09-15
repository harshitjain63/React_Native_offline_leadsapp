import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

// Enable promise-based API
SQLite.enablePromise(true);

let db: SQLiteDatabase | null = null;

// Open the database connection
export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  if (!db) {
    try {
      db = await SQLite.openDatabase({ name: 'LeadManagerDB', location: 'default' });
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Error opening database:', error);
      throw Error('Could not open database');
    }
  }
  return db;
};

// Create table for leads if it doesn't exist
export const createTable = async (): Promise<void> => {
  try {
    const dbConnection = await getDBConnection();
    await dbConnection.executeSql(
      `CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        mobileNumber TEXT,
        description TEXT,
        status TEXT
      );`
    );
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

// Insert a new lead
export const insertLead = async (
  name: string,
  mobileNumber: string,
  description: string,
  status: string
): Promise<void> => {
  try {
    const dbConnection = await getDBConnection();
    await dbConnection.executeSql(
      'INSERT INTO leads (name, mobileNumber, description, status) VALUES (?, ?, ?, ?)',
      [name, mobileNumber, description, status]
    );
    console.log('Lead inserted successfully');
  } catch (error) {
    console.error('Error inserting lead:', error);
  }
};

// Fetch all leads
export const getLeads = async (): Promise<any[]> => {
  try {
    const dbConnection = await getDBConnection();
    const results = await dbConnection.executeSql('SELECT * FROM leads');
    const leads: any[] = [];

    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) {
        leads.push(result.rows.item(i));
      }
    });

    return leads;
  } catch (error) {
    console.error('Error fetching leads', error);
    throw Error('Could not fetch leads');
  }
};

// Delete a lead by ID
export const deleteLead = async (id: number): Promise<void> => {
  try {
    const dbConnection = await getDBConnection();
    await dbConnection.executeSql('DELETE FROM leads WHERE id = ?', [id]);
    console.log('Lead deleted successfully');
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw Error('Could not delete lead');
  }
};

// Update a lead by ID
export const updateLead = async (
  id: number,
  name: string,
  mobileNumber: string,
  description: string,
  status: string
): Promise<void> => {
  try {
    const dbConnection = await getDBConnection();
    await dbConnection.executeSql(
      'UPDATE leads SET name = ?, mobileNumber = ?, description = ?, status = ? WHERE id = ?',
      [name, mobileNumber, description, status, id]
    );
    console.log('Lead updated successfully');
  } catch (error) {
    console.error('Error updating lead:', error);
    throw Error('Could not update lead');
  }
};
