import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface CertificateData {
  userName: string;
  courseName: string;
  completionDate: string;
  enrollmentId: string;
  grade: string;
}

const generateCertificate = async (
  certificateData: CertificateData
): Promise<void> => {
  try {
    const loadKalamFont = async () => {
      if (!document.querySelector('link[href*="Kalam"]')) {
        const fontLink = document.createElement("link");
        fontLink.href =
          "https://fonts.googleapis.com/css2?family=Kalam:wght@700&display=swap";
        fontLink.rel = "stylesheet";
        document.head.appendChild(fontLink);

        return new Promise((resolve) => setTimeout(resolve, 500));
      }
      return Promise.resolve();
    };

    await loadKalamFont();

    const certificateContainer = document.createElement("div");
    certificateContainer.style.width = "1000px";
    certificateContainer.style.height = "700px";
    certificateContainer.style.position = "absolute";
    certificateContainer.style.left = "-9999px";
    certificateContainer.style.top = "-9999px";

    certificateContainer.innerHTML = `
      <div style="
        width: 1000px;
        height: 700px;
        padding: 20px;
        text-align: center;
        border: 10px solid #787878;
        background-color: #ffffff;
        position: relative;
        font-family: Arial, sans-serif;
      ">
        <div style="
          width: 960px;
          height: 660px;
          padding: 20px;
          text-align: center;
          border: 5px solid #787878;
          background-color: #ffffff;
        ">
          <div style="font-size: 50px; font-weight: bold; color: #4a86e8; margin-top: 30px;">Certificate of Completion</div>
          <div style="font-size: 25px; margin: 30px 0;">This is to certify that</div>
          <div style="font-size: 30px; font-style: italic; color: #000; margin: 20px 0;">
            ${certificateData.userName}
          </div>
          <div style="font-size: 25px; margin: 30px 0;">has successfully completed the course</div>
          <div style="font-size: 30px; font-weight: bold; color: #4a86e8; margin: 20px 0;">
            ${certificateData.courseName}
          </div>
          <div style="font-size: 20px; margin: 20px 0;">
            with ${certificateData.grade} grade
          </div>
          <div style="font-size: 20px; margin: 20px 0;">
            on ${certificateData.completionDate}
          </div>
          <div style="margin: 50px 0; display: flex; justify-content: center;">
            <div>
              <h1 style="font-size: 36px; color: #333; font-family: 'Kalam', cursive; font-weight: 700; margin-top: 10px;">SkillForge</h1>
            </div>
          </div>
          <div style="font-size: 14px; margin-top: 40px; color: #787878;">
            Certificate ID: ${certificateData.enrollmentId}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(certificateContainer);

    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("Rendering certificate to canvas...");

    const canvas = await html2canvas(certificateContainer, {
      scale: 2,
      backgroundColor: null,
      logging: true,
      useCORS: true,
      allowTaint: true,
    });

    console.log("Canvas rendered, creating PDF...");

    // create pdf.
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);

    console.log("PDF created, initiating download...");

    const pdfBlob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${certificateData.courseName}_Certificate.pdf`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 100);

    console.log("Certificate download initiated");
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw new Error("Failed to generate certificate");
  } finally {
    const tempContainer = document.querySelector('div[style*="-9999px"]');
    if (tempContainer && tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};

export default generateCertificate;
