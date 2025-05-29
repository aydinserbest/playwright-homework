import { test, expect } from '@playwright/test';
import pet from '../../test-data/pet.json';

test.beforeEach(async ({ page }) => {
  await page.route('**/petclinic/api/owners', async route => {
    await route.fulfill({
      body: JSON.stringify(pet)
    })
  })
  await page.route('**/petclinic/api/owners/1001', async route => {
    await route.fulfill({
      body: JSON.stringify(pet[0])
    })
  })
  await page.route('**/petclinic/api/owners/1035', async route => {
    await route.fulfill({
      body: JSON.stringify(pet[1])
    })
  })
  await page.goto('https://petclinic.bondaracademy.com/owners');
})
test('Mocked owners list and detail validation', async ({ page }) => {
  const rowsOfOwners = page.locator('table > tbody > tr')
  await expect(rowsOfOwners).toHaveCount(2)

  const firstOwnerRow = page.getByRole('row', { name: 'John Walker' })
  await expect(firstOwnerRow.locator('td').nth(4).locator('tr')).toHaveCount(2)
  const name = await firstOwnerRow.locator('td a').textContent()
  const address = await firstOwnerRow.locator('td').nth(1).textContent()
  const city = await firstOwnerRow.locator('td').nth(2).textContent()
  const telephone = await firstOwnerRow.locator('td').nth(3).textContent()
  const firstOwnerInfoFromList = { name, address, city, telephone }
  const firstOwnerPets = (await firstOwnerRow.locator('td').nth(4).locator('tr').allTextContents())
    .map(pet => pet.trim())
  expect(firstOwnerPets).toEqual(['Max', 'Bella'])

  const secondOwnerRow = page.getByRole('row', { name: 'Emily Stone' })
  await expect(secondOwnerRow.locator('td').nth(4).locator('tr')).toHaveCount(5)
  const secondOwnerPets = (await secondOwnerRow.locator('td').nth(4).locator('tr').allTextContents())
    .map(pet => pet.trim())
  expect(secondOwnerPets).toEqual(['Milo', 'Luna', 'Rocky', 'Tweety', 'Goldie'])

  await page.getByRole('link', { name: 'John Walker' }).click()

  const firstOwnerInformationTable = page.locator('table').first()
  const detailName = await firstOwnerInformationTable.locator('tr').nth(0).locator('td b').textContent()
  const detailAddress = await firstOwnerInformationTable.locator('tr').nth(1).locator('td').textContent()
  const detailCity = await firstOwnerInformationTable.locator('tr').nth(2).locator('td').textContent()
  const detailTelephone = await firstOwnerInformationTable.locator('tr').nth(3).locator('td').textContent()

  const firstOwnerInfoFromDetails = {
    name: detailName,
    address: detailAddress,
    city: detailCity,
    telephone: detailTelephone
  }
  expect(firstOwnerInfoFromDetails).toEqual(firstOwnerInfoFromList)
  await expect(page.locator('app-pet-list').getByRole('row', { name: 'Type' })).toHaveCount(2)
  const petNames: string[] = [];
  const petLists = page.locator('app-pet-list')
  for (let i = 0; i < await petLists.count(); i++) {
    const name = await petLists.nth(i).locator('td dd').nth(0).textContent()
    if (name !== null && name !== undefined) {
      petNames.push(name.trim())
    }
  }
  expect(petNames).toEqual(firstOwnerPets)
  await expect(page.locator('app-visit-list').getByRole('row', { name: 'Delete Visit' })).toHaveCount(10)
})