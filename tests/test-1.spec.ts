import { test, expect } from '@playwright/test';

// test('test', async ({bro) => {
//   await page.goto('http://localhost:3000/');
//   await page1.goto('http://localhost:3000/');
//   await page.getByRole('textbox', { name: 'Enter your name' }).click();
//   await page.getByRole('textbox', { name: 'Enter your name' }).fill('yo');
//   await page.getByRole('textbox', { name: 'Enter your name' }).press('Enter');
//   await page1.getByRole('textbox', { name: 'Enter your name' }).click();
//   await page1.getByRole('textbox', { name: 'Enter your name' }).fill('tu');
//   await page1.getByRole('textbox', { name: 'Enter your name' }).press('Enter');
//   await page1.getByRole('button', { name: 'Create a game' }).click();
//   await page1.getByRole('button', { name: 'copy' }).click();
//   await page.getByRole('button', { name: 'Join a game' }).click();
//   await page.getByRole('dialog').click();
//   await page.getByRole('textbox', { name: 'Insert Game ID:' }).click();
//   await page.getByRole('textbox', { name: 'Insert Game ID:' }).click();
//   await page.getByRole('textbox', { name: 'Insert Game ID:' }).fill('6da88c10-710e-4607-9443-d29a97a629fd');
//   await page.getByRole('textbox', { name: 'Insert Game ID:' }).press('Enter');
//   await page.getByRole('button', { name: 'Start Game' }).click();
//   await page1.getByRole('button', { name: 'Igualar' }).click();
//   await page1.getByRole('button', { name: 'Pasar' }).click();
//   await page.getByRole('button', { name: 'Pasar' }).click();
//   await page1.getByRole('button', { name: 'Pasar' }).click();
//   await page.getByRole('button', { name: 'Pasar' }).click();
//   await page1.getByRole('button', { name: 'Pasar' }).click();
//   await page.getByRole('button', { name: 'Pasar' }).click();
// });