// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({ name: 'jsonToHtml' })
// export class JsonToHtmlPipe implements PipeTransform {
//   transform(data: Record<string, any>): string {
//     if (!data || typeof data !== 'object') return '';
//     return Object.entries(data)
//       .filter(([key]) => 
//         !key.toLowerCase().includes('_id') && 
//         !key.toLowerCase().includes('__v')
//       ) // skip unwanted keys
//       .map(([key, value]) => {
//         return `<div class="card mb-2 shadow-sm">
//                 <div class="card-header bg-dark text-white">${this.formatKey(key)}</div>
//                 <div class="card-body">
//                  <p class="card-text">${this.escapeHtml(value)}</p>
//                 </div>
//               </div>`;
//       })
//       .join('');
//   }

//   private escapeHtml(value: any): string {
//     if (value === null || value === undefined) return '';
//     return String(value)
//       .replace(/&/g, '&amp;')
//       .replace(/</g, '&lt;')
//       .replace(/>/g, '&gt;')
//       .replace(/"/g, '&quot;')
//       .replace(/'/g, '&#039;');
//   }

//   private formatKey(key: string): string {
//     return key
//       .replace(/_/g, ' ')                  // replace underscores with spaces
//       .replace(/\w\S*/g, (w) => 
//         w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
//       );                                   // capitalize each word
//   }
// }


import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'jsonToHtml' })
export class JsonToHtmlPipe implements PipeTransform {
  transform(data: Record<string, any>): string {
    if (!data || typeof data !== 'object') return '';

    return Object.entries(data)
      .filter(([key]) =>
        !key.toLowerCase().includes('_id') &&
        !key.toLowerCase().includes('__v')
      )
      .map(([key, value]) => {
        return `
          <div class="card mb-2 shadow-sm">
            <div class="card-header bg-dark text-white small">
              ${this.formatKey(key)}
            </div>
            <div class="card-body text-dark">
              ${this.formatValue(value)}
            </div>
          </div>`;
      })
      .join('');
  }

  //Handle complex data types (Array, Object, Date, etc.)
  private formatValue(value: any): string {
    if (value === null || value === undefined) return 'N/A';

    // Empty array
    if (Array.isArray(value) && value.length === 0) return 'N/A';

    // Non-empty array
    if (Array.isArray(value)) {
      return value
        .map(
          (v, i) => `
          <div class="border rounded p-2 mb-2 bg-light">
            <strong>Item ${i + 1}</strong><br>
            ${this.formatValue(v)}
          </div>`
        )
        .join('');
    }

    // Object handling
    if (typeof value === 'object') {
      const entries = Object.entries(value)
        .filter(([k]) =>
          !k.toLowerCase().includes('_id') &&
          !k.toLowerCase().includes('__v')
        );

      if (entries.length === 0) return 'N/A';

      return entries
        .map(
          ([k, v]) => `
          <div class="mb-1">
            <strong>${this.formatKey(k)}:</strong> ${this.formatValue(v)}
          </div>`
        )
        .join('');
    }

    // Date detection
    if (this.isIsoDate(value)) {
      const date = new Date(value);
      return date.toLocaleString(); // local timezone
    }

    // Boolean
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    // String or number
    const strVal = String(value).trim();
    return strVal ? strVal : 'N/A';
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  private isIsoDate(value: any): boolean {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
  }
}

