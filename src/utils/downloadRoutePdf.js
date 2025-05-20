import jsPDF from 'jspdf'

export async function downloadPdfRoute(addresses, mapElementId = 'map') {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text('Route Summary', 14, 20)

  // Address list
  doc.setFontSize(12)
  addresses.forEach((address, index) => {
    const label = String.fromCharCode(65 + index)
    doc.text(`${label}. ${address}`, 14, 30 + index * 8)
  })

  doc.save('route.pdf')
}
