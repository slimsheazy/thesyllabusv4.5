import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const exportAsImage = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Small delay to ensure animations are settled
    await new Promise(resolve => setTimeout(resolve, 300));

    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' 
      ? style.backgroundColor 
      : '#E4E3E0';

    const canvas = await html2canvas(element, {
      backgroundColor: bgColor,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });
    
    const image = canvas.toDataURL('image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = image;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting image:', error);
  }
};

export const exportAsPDF = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Small delay to ensure animations are settled
    await new Promise(resolve => setTimeout(resolve, 300));

    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' 
      ? style.backgroundColor 
      : '#E4E3E0';

    const canvas = await html2canvas(element, {
      backgroundColor: bgColor,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
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
