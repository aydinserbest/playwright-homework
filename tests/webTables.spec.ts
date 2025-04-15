import { test, expect, Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('Owners table validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByText('Owners').click()
    await page.getByText('Search').click()
  })
  test('Validate the pet name city of the owner', async ({ page }) => {
    const targetRow = page.getByRole('row', { name: 'Jeff Black' })
    await expect(targetRow.locator('td').nth(2)).toHaveText('Monona')
    await expect(targetRow.locator('td').nth(4)).toContainText('Lucky')
  })
  test('Validate owners count of the Madison city', async ({ page }) => {
    await expect(page.getByRole('row', { name: 'Madison' })).toHaveCount(4)
  })
  test('Validate search by Last Name', async ({ page }) => {
    const lastNamesToCheck = ['Black', 'Davis', 'Es']

    for (const lastName of lastNamesToCheck) {
      await page.locator('#lastName').fill(lastName)
      await page.getByRole('button', { name: 'Find Owner' }).click()
      await page.waitForResponse(`**/api/owners?lastName=${lastName}`)
      const targetRows = page.locator('tbody > tr')
      for(const row of await targetRows.all()) {
      await expect(row.locator('td').first()).toContainText(lastName)
    }
  }
    await page.locator('#lastName').fill('Playwright')
    await page.getByRole('button', { name: 'Find Owner' }).click()
    await expect(page.getByText('No owners with LastName starting with "Playwright"')).toBeVisible()
  })
  test('Validate phone number and pet name on the Owner Information page', async ({ page }) => {
    const rowByPhone = page.getByRole('row', { name: '6085552765' })
    const petNameField = await rowByPhone.getByRole('row', { name: ' George ' }).textContent()!
    await rowByPhone.getByRole('link').click()
    await expect(page.getByRole('row', { name: 'Telephone' }).locator('td')).toHaveText('6085552765')
    await expect(page.locator('dd').first()).toHaveText(petNameField)
  })
  test('Validate pets of the Madison city', async ({ page }) => {
    await page.waitForResponse('**/api/owners')
    const expectedPets = ["Leo", "George", "Mulligan", "Freddy"]
    const actualPets: string[] = []
    const madisonRows = page.getByRole('row', { name: 'Madison' })


    for (const row of await madisonRows.all()) {
      const petNameOfOwner = await row.locator('td').last().textContent()!
      actualPets.push(petNameOfOwner.trim())
    }
    expect(actualPets).toEqual(expectedPets)
  })
})
test('Validate specialty update', async ({ page }) => {
  await page.getByRole('button', { name: 'Veterinarians' }).click()
  await page.getByText('All').click()
  await expect(page.getByRole('row', { name: 'Rafael Ortega ' }).locator('td').nth(1)).toContainText('surgery')
  await page.getByRole('link', { name: 'Specialties' }).click()
  await expect(page.getByRole('heading', { name: 'Specialties' })).toBeVisible()
  await page.getByRole('row', { name: 'surgery' }).getByRole('button', { name: 'Edit' }).click()
  await expect(page.getByRole('heading', { name: 'Edit Specialty' })).toBeVisible()
  await page.waitForResponse('**/api/specialties/*')
  await page.locator('#name').fill('dermatology')
  await page.getByRole('button', { name: 'Update' }).click()
  await expect(page.getByRole('row', { name: 'surgery' })).toHaveCount(0)
  await expect(page.getByRole('row', { name: 'dermatology' })).toBeVisible()
  await page.getByRole('button', { name: 'Veterinarians' }).click()
  await page.getByText('All').click()
  await expect(page.getByRole('row', { name: 'Rafael Ortega' }).locator('td').nth(1)).toContainText('dermatology')
  await page.getByRole('link', { name: 'Specialties' }).click()
  await page.getByRole('row', { name: 'dermatology' }).getByRole('button', { name: 'Edit' }).click()
  await page.waitForResponse('**/api/specialties/*')
  await page.locator('#name').fill('surgery')
  await page.getByRole('button', { name: 'Update' }).click()
  await expect(page.getByRole('row', { name: 'dermatology' })).toHaveCount(0)
  await expect(page.getByRole('row', { name: 'surgery' })).toBeVisible()
})
test('Validate specialty lists', async ({ page }) => {
  const specialtiesMenuItem = page.getByRole('link', { name: 'Specialties' })
  const veterinariansMenuItem = page.getByRole('button', { name: 'Veterinarians' })
  const allVetsButton = page.getByText('All')

  await specialtiesMenuItem.click()
  await page.getByRole('button', { name: 'Add' }).click()
  await page.locator('#name').fill('oncology')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.waitForResponse('**/api/specialties')
  const specialties: string[] = []
  const specialtyRows = page.locator('input[name="spec_name"]')
  for (const row of await specialtyRows.all()) {
    const value = await row.inputValue();
    specialties.push(value)
  }
  await veterinariansMenuItem.click()
  await allVetsButton.click()
  await page.getByRole('row', { name: 'Sharon Jenkins' }).getByRole('button', { name: 'Edit Vet' }).click()
  await page.locator('.dropdown-display').click()
  const dropdownSpecialties = page.locator('.dropdown-content label')
  const dropdownSpecialtiesArray: string[] = []
  for (const row of await dropdownSpecialties.all()) {
    const value = await row.textContent()!
    dropdownSpecialtiesArray.push(value)
  }
  expect(dropdownSpecialtiesArray).toEqual(specialties)
  await page.getByRole('checkbox', { name: 'oncology' }).check()
  await page.locator('.dropdown-display').click()
  await page.getByRole('button', { name: 'Save Vet' }).click()
  await veterinariansMenuItem.click()
  await allVetsButton.click()
  await expect(page.getByRole('row', { name: 'Sharon Jenkins' }).locator('td').nth(1)).toContainText('oncology')
  await specialtiesMenuItem.click()
  await page.getByRole('row', { name: 'oncology' }).getByRole('button', { name: 'Delete' }).click()
  await veterinariansMenuItem.click()
  await allVetsButton.click()
  await expect(page.getByRole('row', { name: 'Sharon Jenkins' }).locator('td').nth(1)).toBeEmpty()
})