import { Injectable } from '@nestjs/common';
import * as ejs from 'ejs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly templatePath: string = path.join(
    process.cwd(),
    'src',
    'pdf',
    'templates',
    'invoice.ejs',
  );

  async generateInvoicePdf(data: any): Promise<Buffer> {
    const html: string = await ejs.renderFile(
      this.templatePath,
      { ...data, isRtl: false },
      { async: true },
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.25in',
        bottom: '0.25in',
        left: '0.25in',
        right: '0.25in',
      },
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
