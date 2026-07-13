import * as xlsx from 'xlsx';

export const exportToExcel = (data, columns, filename, sheetName = "Sheet1") => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }
  
  // Format data based on columns
  const formattedData = data.map(row => {
    const formattedRow = {};
    columns.forEach(col => {
      // Handle nested or complex data with accessor function if provided
      if (col.accessor) {
        formattedRow[col.header] = col.accessor(row);
      } else {
        formattedRow[col.header] = row[col.key];
      }
    });
    return formattedRow;
  });

  // Create a new workbook and worksheet
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(formattedData);

  // Set column widths
  const wscols = columns.map(col => ({
    wch: col.width || 15 // default width
  }));
  ws['!cols'] = wscols;

  // Add worksheet to workbook
  xlsx.utils.book_append_sheet(wb, ws, sheetName);

  // Export
  xlsx.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
