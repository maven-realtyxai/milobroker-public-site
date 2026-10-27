import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('docs/previews', { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL });
try {
  const page = await browser.newPage();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const viewports = [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
    ['small-phone', 320, 740],
    ['tablet', 768, 1024],
  ];
  for (const [name, width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173');
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.locator('#home img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await page.locator('img[alt*="QR code"]').waitFor();
    await page.screenshot({ path: `docs/previews/${name}.png`, fullPage: true });
  }
} finally {
  await browser.close();
}
