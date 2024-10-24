/**
 * @iamdual/html2pdf
 * @author Ekin Karadeniz <iamdual@icloud.com>
 * @source https://github.com/iamdual/html2pdf
 */

import Config from "../config";
import puppeteer from "puppeteer";

let args: string[] = [];
if (process.env.HTML2PDF_NO_SANDBOX) {
  args.push("--no-sandbox");
}

export default async (config: Config): Promise<Uint8Array> => {
  // Create a browser instance
  const browser = await puppeteer.launch({
    headless: true,
    args: args,
  });

  // Create a new page
  const page = await browser.newPage();

  // Set timeout
  page.setDefaultNavigationTimeout(config.timeout);

  // Set JavaScript enabled
  await page.setJavaScriptEnabled(config.javascript);

  // Set CSS media type
  await page.emulateMediaType(config.mediaType);

  if (config.userAgent) {
    // Set user-agent
    await page.setUserAgent(config.userAgent);
  }

  if (config.isUrl) {
    // https://pptr.dev/api/puppeteer.page.goto
    await page.goto(config.source, { waitUntil: "networkidle2" });
  } else {
    // https://pptr.dev/api/puppeteer.page.setcontent
    await page.setContent(config.source, { waitUntil: "networkidle2" });
  }

  await page.waitForSelector('body.previewer-ready-to-pdf');

  // 删除特定类名的元素
  await page.evaluate(() => {
      const elements = document.querySelectorAll('.trayTips');
      elements.forEach(element => element.remove());
  });

  // https://pptr.dev/api/puppeteer.pdfoptions
  const pdf = await page.pdf({
    timeout: config.timeout,
    pageRanges: config.pageRanges,
    printBackground: config.printBackground,
    format: config.format,
    width: config.width,
    height: config.height,
    scale: config.scale,
    landscape: config.landscape,
    margin: config.margin,
  });

  // Close the browser instance
  await browser.close();

  return pdf;
};
