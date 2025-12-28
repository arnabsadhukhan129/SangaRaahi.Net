import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  //  exportToExcel(data: any[], fileName: string): void {
  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

  //   // Add fixed headings
  //   const headings = ['contact_name', 'contact_email', 'phone_code', 'phone_no']; // Customize as needed
  //   let range: XLSX.Range | undefined = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : undefined;
  //   if (range) {
  //     for (let i = range.s.c; i <= range.e.c; ++i) {
  //       const address = XLSX.utils.encode_cell({ r: 0, c: i });
  //       if (worksheet[address]) {
  //         worksheet[address].v = headings[i];
  //         worksheet[address].s = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00' } } }; // Added font style
  //       }
  //     }
  //   }
  //   // Add a row at the beginning of the worksheet
  //   XLSX.utils.sheet_add_aoa(worksheet, [['Please don’t change the header name of the column']], { origin: -1 }); // '-1' adds the row before the header row
  //   const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //   XLSX.writeFile(workbook, `${fileName}.xlsx`);
  // }


  exportToExcel(data: any[], fileName: string): void {
    // Convert the data into an array of arrays
    const dataWithHeader: any[][] = [
        ['Please don’t change the header name of the column'],
        ['contact_name', 'contact_email', 'phone_code', 'phone_no'],
        ...data.map(item => [item.contact_name, item.contact_email, item.phone_code, item.phone_no])
    ];

    // Convert the array of arrays to a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataWithHeader);

    // Merge cells A1 to D1
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    // Apply styles to the header row
    const headerRowRange: XLSX.Range = XLSX.utils.decode_range('A1:D1'); // Targeting the first row (header)
    for (let i = headerRowRange.s.c; i <= headerRowRange.e.c; i++) {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRowRange.s.r, c: i }); // Header row starts at index 0
        if (worksheet[cellAddress]) {
            // worksheet[cellAddress].s = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00' } } }; // Setting fill color to yellow
            const cellStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'FFFF00' } } }; // Setting fill color to yellow
            worksheet[cellAddress].s = cellStyle;
        }
    }

    // Create workbook and write to file
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

  
  
  
  
  

  importFromExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const data: Uint8Array = new Uint8Array(e.target.result);
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
        const worksheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];
        const importedData: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });
        resolve(importedData);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }
}
