import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportAsImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#E4E3E0', // archive-bg
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = image;
    link.click();
  } catch (error) {
    console.error('Error exporting image:', error);
  }
};

export const exportAsPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#E4E3E0',
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
};
