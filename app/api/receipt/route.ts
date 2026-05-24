import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }
    
    // Fetch registration from Firestore
    const docRef = doc(db, 'registrations', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    const data = docSnap.data();
    
    // Generate PDF receipt bytes
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // Standard A4 Dimensions
    const { width, height } = page.getSize();
    
    // Brand Colors
    const primaryColor = rgb(1.0, 0.094, 0.549); // #FF188C Bold Pink
    const darkColor = rgb(0.012, 0.016, 0.016);  // #030404 Ink Black
    const lightGray = rgb(0.961, 0.945, 0.898);  // #F5F1E5 Cloud White
    const successColor = rgb(0.051, 0.129, 0.867); // #0D21DD Electric Blue
    const greyColor = rgb(0.4, 0.4, 0.4);

    // 1. Left Logo: JKLU Logo (Colored PNG variant)
    let jkluScaledWidth = 0;
    let jkluScaledHeight = 0;
    let jkluLogoImage;
    try {
      const jkluLogoPath = path.join(
        process.cwd(), 
        'public', 
        'AARAMBH\'26 Design Assets', 
        'JKLU Logo.png'
      );
      const jkluLogoBytes = await fs.readFile(jkluLogoPath);
      jkluLogoImage = await pdfDoc.embedPng(jkluLogoBytes);
      const targetHeight = 46;
      const scaleFactor = targetHeight / jkluLogoImage.height;
      jkluScaledWidth = jkluLogoImage.width * scaleFactor;
      jkluScaledHeight = jkluLogoImage.height * scaleFactor;
    } catch (error) {
      console.warn('PDF Left Logo (JKLU) load failed:', error);
    }

    // 2. Right Logo: AARAMBH Main Logo (Transparent removebg PNG variant)
    let aarambhScaledWidth = 0;
    let aarambhScaledHeight = 0;
    let aarambhLogoImage;
    try {
      const aarambhLogoPath = path.join(
        process.cwd(), 
        'public', 
        'AARAMBH\'26 Design Assets', 
        'Main_Logo', 
        'AARAMBH_26_Logo-removebg.png'
      );
      const aarambhLogoBytes = await fs.readFile(aarambhLogoPath);
      aarambhLogoImage = await pdfDoc.embedPng(aarambhLogoBytes);
      const targetHeight = 44;
      const scaleFactor = targetHeight / aarambhLogoImage.height;
      aarambhScaledWidth = aarambhLogoImage.width * scaleFactor;
      aarambhScaledHeight = aarambhLogoImage.height * scaleFactor;
    } catch (error) {
      console.warn('PDF Right Logo (Aarambh) load failed:', error);
    }

    // Draw Left Logo (JKLU Logo) directly on white background
    if (jkluLogoImage) {
      page.drawImage(jkluLogoImage, {
        x: 40,
        y: height - 95,
        width: jkluScaledWidth,
        height: jkluScaledHeight,
      });
    }

    // Draw Right Logo (AARAMBH Logo) directly on white background
    if (aarambhLogoImage) {
      page.drawImage(aarambhLogoImage, {
        x: width - 40 - aarambhScaledWidth,
        y: height - 95,
        width: aarambhScaledWidth,
        height: aarambhScaledHeight,
      });
    }

    // Center-aligned Header Title text on white background
    page.drawText('Registration Receipt', {
      x: 200,
      y: height - 70,
      size: 20,
      color: darkColor,
    });
    page.drawText('Aarambh Registration · JK Lakshmipat University', {
      x: 185,
      y: height - 85,
      size: 8.5,
      color: greyColor,
    });

    // Solid Black Divider line under header
    page.drawLine({
      start: { x: 40, y: height - 110 },
      end: { x: 555, y: height - 110 },
      thickness: 2,
      color: darkColor
    });

    // QR Code Verification Box
    const qrDataUrl = await QRCode.toDataURL(id, { margin: 1, width: 300 });
    const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    
    // Draw outer QR Card Border
    page.drawImage(qrImage, {
      x: 257,
      y: 647,
      width: 80,
      height: 80
    });

    // Metadata Row
    // Receipt No
    page.drawText('Receipt No.'.toUpperCase(), { x: 40, y: 590, size: 7.5, color: greyColor });
    page.drawText(`AARAMBH2026-${data.rollNumber || id.slice(-4).toUpperCase()}`, { x: 40, y: 575, size: 10.5, color: darkColor });

    // Date of Issue
    page.drawText('Date of Issue'.toUpperCase(), { x: 250, y: 590, size: 7.5, color: greyColor });
    page.drawText(data.dateOfPayment || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), { x: 250, y: 575, size: 10.5, color: darkColor });

    // Payment Status
    page.drawText('Payment Status'.toUpperCase(), { x: 450, y: 590, size: 7.5, color: greyColor });
    page.drawRectangle({
      x: 450,
      y: 570,
      width: 50,
      height: 16,
      color: rgb(0.85, 0.95, 0.85),
      borderColor: rgb(0.1, 0.5, 0.2),
      borderWidth: 1
    });
    page.drawText('PAID', { x: 462, y: 574, size: 9, color: rgb(0.1, 0.5, 0.2) });

    // Horizontal separator line
    page.drawLine({
      start: { x: 40, y: 550 },
      end: { x: 555, y: 550 },
      thickness: 1,
      color: rgb(0.88, 0.9, 0.94)
    });

    const clean = (text: string) => (text || '').replace(/[^\x20-\x7E]/g, '');

    // Helper function to draw a section header
    const drawSectionHeader = (title: string, y: number) => {
      page.drawText(title.toUpperCase(), { x: 40, y, size: 9.5, color: darkColor });
      page.drawLine({ start: { x: 40, y: y - 5 }, end: { x: 555, y: y - 5 }, thickness: 1.5, color: darkColor });
    };

    // Helper function to draw grid cells
    const drawField = (label: string, value: string, x: number, y: number) => {
      page.drawText(label.toUpperCase(), { x, y, size: 7.5, color: greyColor });
      page.drawText(clean(value), { x, y: y - 13, size: 10.5, color: darkColor });
    };

    // 1. STUDENT INFORMATION Section
    drawSectionHeader('STUDENT INFORMATION', 525);
    drawField('Full Name', data.name || 'N/A', 40, 502);
    drawField('Enrollment No.', data.rollNumber || 'N/A', 300, 502);
    
    drawField('Branch / Programme', data.course || 'B.Tech', 40, 469);
    
    drawField('Email Address', data.email || 'N/A', 40, 436);
    drawField('Mobile Number', data.phone || 'N/A', 300, 436);

    // 2. PARENT DETAILS Section
    drawSectionHeader('PARENT DETAILS', 395);
    drawField('Parent Name', data.parentName || data.fatherName || 'N/A', 40, 372);
    drawField('Parent Phone', data.parentPhone || data.fatherMobile || 'N/A', 300, 372);
    
    drawField('Parent Email', data.parentEmail || data.fatherEmail || 'N/A', 40, 339);

    // 3. PERMANENT ADDRESS Section
    drawSectionHeader('PERMANENT ADDRESS', 298);
    drawField('Street / Locality', data.address || 'N/A', 40, 275);
    drawField('City / State / PIN', `Jaipur, Rajasthan - ${data.pincode || (data.address ? (data.address.match(/\b\d{6}\b/)?.[0] || '302017') : '302017')}`, 40, 242);

    // 4. PAYMENT SUMMARY Section
    drawSectionHeader('PAYMENT SUMMARY', 201);
    drawField('Amount Paid', `Rs. ${data.paymentAmount ? Number(data.paymentAmount).toFixed(2) : '1,500.00'}`, 40, 178);
    drawField('Mode of Payment', 'Online Transfer / UPI', 220, 178);
    
    page.drawText('TRANSACTION STATUS', { x: 410, y: 178, size: 7.5, color: greyColor });
    page.drawText('Confirmed', { x: 410, y: 165, size: 10.5, color: rgb(0.1, 0.5, 0.2) });

    // Disclaimer Notes
    page.drawText('This receipt confirms successful registration and payment for Aarambh 2026. Please retain this document for your records.', {
      x: 40,
      y: 110,
      size: 7,
      color: greyColor
    });
    page.drawText('For queries, contact the university administration.', {
      x: 40,
      y: 99,
      size: 7,
      color: greyColor
    });

    // Bottom Footer Line
    page.drawLine({
      start: { x: 40, y: 80 },
      end: { x: 555, y: 80 },
      thickness: 1,
      color: rgb(0.88, 0.9, 0.94)
    });

    // Footer Content
    page.drawText('JK Lakshmipat University · www.jklu.edu.in · +91-141-5117000', {
      x: 40,
      y: 65,
      size: 7.5,
      color: greyColor
    });
    page.drawText('This is a system-generated receipt.', {
      x: 420,
      y: 65,
      size: 7.5,
      color: greyColor
    });

    const pdfBytes = await pdfDoc.save();
    
    // Return PDF stream directly
    return new Response(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Aarambh_Receipt_${data.name ? data.name.replace(/ /g, '_') : id}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Receipt generation API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
