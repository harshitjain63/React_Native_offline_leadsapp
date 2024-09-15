import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { getLeads } from '../database/Database';

export const generatePDF = async (): Promise<string> => {
  try {
    // Ensure RNHTMLtoPDF is properly imported
    if (!RNHTMLtoPDF) {
      throw new Error('RNHTMLtoPDF is not available');
    }

    // Fetch leads data
    const leads = await getLeads();

    // Generate HTML content for the PDF
    const htmlContent = `
      <h1>Lead List</h1>
      <table border="1" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${leads.map(lead => `
            <tr>
              <td>${lead.name}</td>
              <td>${lead.mobileNumber}</td>
              <td>${lead.description}</td>
              <td>${lead.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Generate PDF
    const options = {
      html: htmlContent,
      fileName: 'LeadList',
      directory: 'Documents',
      base64:true,
    };

    const file = await RNHTMLtoPDF.convert(options);
    console.log(file);

    // Check if filePath is defined
    if (!file.filePath) {
      throw new Error('File path is undefined');
    }

    console.log('PDF file created at:', file.filePath);
    return file.filePath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Could not generate PDF');
  }
};
