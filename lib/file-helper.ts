import { AxiosResponse } from 'axios';

export const fileHelper = {
  download: (res: AxiosResponse, defaultName: string = 'export-data.xlsx') => {
    try {
      const contentDisposition = res.headers['content-disposition'];
      let fileName = defaultName;

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      const blob = new Blob([res.data], { 
        type: res.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  prepareImport: (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    
    return formData;
  }
};