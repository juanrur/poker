import { test } from '@playwright/test';

async function initAGame(browser: any) {
  const context1 = await browser.newContext();
  const page = await context1.newPage();
  
  const context2 = await browser.newContext();
  const page1 = await context2.newPage();
  
  await page.goto('http://localhost:3000/');
  await page.getByRole('textbox', { name: 'Enter your name' }).click();
  await page.getByRole('textbox', { name: 'Enter your name' }).fill('yo');
  await page.getByRole('textbox', { name: 'Enter your name' }).press('Enter');
  await page.getByRole('button', { name: 'Create a game' }).click();
  
  await page1.goto('http://localhost:3000/');
  await page1.getByRole('textbox', { name: 'Enter your name' }).click();
  await page1.getByRole('textbox', { name: 'Enter your name' }).fill('tu');
  await page1.getByRole('textbox', { name: 'Enter your name' }).press('Enter');
  await page1.getByRole('button', { name: 'Join a game' }).click();
  
  const gameID = await page.getByRole('heading', { name: 'ID:' }).textContent();
  await page1.getByRole('textbox', { name: 'Insert Game ID:' }).click();
  await page1.getByRole('textbox', { name: 'Insert Game ID:' }).fill(gameID!.slice(4));
  await page1.getByRole('textbox', { name: 'Insert Game ID:' }).press('Enter');
  await page1.getByRole('heading', { name: 'tu' }).click();
  await page1.getByRole('heading', { name: 'yo' }).click();
  
  return {page, page1, context1, context2};
}

test('Create and join a game', async ({ browser }) => {
  const {context1, context2} = await initAGame(browser);
  
  await context1.close();
  await context2.close();
});


test('Play a game', async ({ browser }) => {
  async function waitForTurnAndPass(page: any, playerName: string) {
    const turnIndicator = page.locator('header').filter({ hasText: playerName }).getByText('Turn');
    await turnIndicator.waitFor({ state: 'visible' });

    const passButton = page.getByRole('button', { name: 'Pasar' });
    await passButton.evaluate((btn: HTMLButtonElement) => btn.click());
  }
  
  const {page, page1, context1, context2} = await initAGame(browser);

  await page.getByRole('button', { name: 'Start Game' }).click();


  await page.getByText('Turn').first().waitFor();

  const pageHasTurn = await page
      .locator('header')
      .filter({ hasText: 'yo' })
      .getByText('Turn')
      .isVisible();

  if(pageHasTurn) {
    await page.getByRole('button', { name: 'Igualar' }).evaluate((btn: HTMLButtonElement) => btn.click());
    
    await page.getByRole('button', { name: 'Igualar' }).waitFor({ state: 'hidden' });
    
    const passButton = page.getByRole('button', { name: 'Pasar' });
    await passButton.waitFor({ state: 'visible' }); 
    await passButton.evaluate((btn: HTMLButtonElement) => btn.click());
    
  } else {
    await page1.getByRole('button', { name: 'Igualar' }).evaluate((btn: HTMLButtonElement) => btn.click());
    
    await page1.getByRole('button', { name: 'Igualar' }).waitFor({ state: 'hidden' });

    const passButton = page1.getByRole('button', { name: 'Pasar' });
    await passButton.waitFor({ state: 'visible' }); 
    await passButton.evaluate((btn: HTMLButtonElement) => btn.click());
  }

  if (pageHasTurn) {
    await waitForTurnAndPass(page1, 'tu');
    await waitForTurnAndPass(page, 'yo')

    await waitForTurnAndPass(page1, 'tu');
    await waitForTurnAndPass(page, 'yo')

    await waitForTurnAndPass(page1, 'tu');
    await waitForTurnAndPass(page, 'yo')
  } else {
    await waitForTurnAndPass(page, 'yo');
    await waitForTurnAndPass(page1, 'tu')

    await waitForTurnAndPass(page, 'yo');
    await waitForTurnAndPass(page1, 'tu')

    await waitForTurnAndPass(page, 'yo');
    await waitForTurnAndPass(page1, 'tu')
  }

  await context1.close();
  await context2.close();
})