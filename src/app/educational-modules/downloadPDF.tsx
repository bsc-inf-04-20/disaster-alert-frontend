import { PDFDocument, StandardFonts } from "pdf-lib";

type EducationModule = {
  id: number;
  title: string;
  disasterType: string;
  description: string;
  sections: {
    heading: string;
    content: string;
  }[];
};
 export const downloadPDF = async (module:EducationModule) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      
      // Add first page
      let page = pdfDoc.addPage([600, 800]);
      let yPosition = 750;
      
      // Title
      page.drawText(module.title, {
        x: 50,
        y: yPosition,
        font: timesBoldFont,
        size: 24,
        color: rgb(0, 0, 0)
      });
      yPosition -= 40;
      
      // Disaster Type
      page.drawText(`Disaster Type: ${module.disasterType}`, {
        x: 50,
        y: yPosition,
        font: timesBoldFont,
        size: 16,
        color: rgb(0, 0, 0)
      });
      yPosition -= 30;
      
      // Description - Handle text wrapping
      const description = module.description;
      const wrappedDescription = wrapText(description, 60); // Wrap at 60 chars
      
      wrappedDescription.forEach(line => {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          font: timesRomanFont,
          size: 12,
          color: rgb(0, 0, 0)
        });
        yPosition -= 20;
      });
      
      yPosition -= 20; // Add some space
      
      // Add sections
      for (const section of module.sections) {
        // Check if we need a new page
        if (yPosition < 100) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = 750;
        }
        
        // Section heading
        page.drawText(section.heading, {
          x: 50,
          y: yPosition,
          font: timesBoldFont,
          size: 16,
          color: rgb(0, 0, 0)
        });
        yPosition -= 30;
        
        // Section content with text wrapping
        const content = section.content;
        const wrappedContent = wrapText(content, 70);
        
        wrappedContent.forEach(line => {
          // Check if we need a new page
          if (yPosition < 100) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = 750;
          }
          
          page.drawText(line, {
            x: 50,
            y: yPosition,
            font: timesRomanFont,
            size: 12,
            color: rgb(0, 0, 0)
          });
          yPosition -= 20;
        });
        
        yPosition -= 30; // Add space between sections
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${module.title.replace(/\s+/g, '-')}.pdf`;
      link.click();
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };