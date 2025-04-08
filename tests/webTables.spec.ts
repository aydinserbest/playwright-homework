import { test, expect, Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('Owners table validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByText('Owners').click()
    await page.getByText('Search').click()
  })
  async function assertOwnersLastNameContains(page: Page, lastName: string) {
    await page.locator('#lastName').fill(lastName);
    await page.getByRole('button', { name: 'Find Owner' }).click()
    await page.waitForResponse(`**/api/owners?lastName=${lastName}`)

    const nameRows = page.locator('tbody > tr')
    const rowCount = await nameRows.count()

    if (rowCount === 0) {
      await expect(
        page.getByText(`No owners with LastName starting with "${lastName}"`)
      ).toBeVisible()
    } else {
      for (const row of await nameRows.all()) {
        await expect(row.locator('td').first()).toContainText(lastName)
      }
    }
  }

  test('Validate the pet name city of the owner', async ({ page }) => {
    const targetRow = page.getByRole('row', { name: 'Jeff Black' })
    await expect(targetRow.locator('td').nth(2)).toHaveText('Monona')
    await expect(targetRow.locator('td').nth(4)).toContainText('Lucky')
  })
  test('Validate owners count of the Madison city', async ({ page }) => {
    await expect(page.getByRole('row', { name: 'Madison' })).toHaveCount(4)
  })
  test('Validate search by Last Name', async ({ page }) => {
    await assertOwnersLastNameContains(page, 'Black')
    await assertOwnersLastNameContains(page, 'Davis')
    await assertOwnersLastNameContains(page, 'Es')
    await assertOwnersLastNameContains(page, 'Playwright')
  })
  test('Validate phone number and pet name on the Owner Information page', async ({ page }) => {
    const rowByPhone = page.getByRole('row', { name: '6085552765' })
    const petOfOwner = await rowByPhone.locator('td').last().textContent() || ''
    await rowByPhone.locator('td').first().locator('a').click()
    await expect(page.getByRole('row', { name: 'Telephone' }).locator('td')).toHaveText('6085552765')
    await expect(page.locator('dd').first()).toContainText(petOfOwner)
  })
  test('Validate pets of the Madison city', async ({ page }) => {
    await page.waitForResponse('**/api/owners')
    const expectedPets = ["Leo", "George", "Mulligan", "Freddy"]
    const actualPets: string[] = []
    const madisonRows = page.locator('tbody > tr').filter({
      has: page.locator('td', { hasText: 'Madison' })
    })

    for (const row of await madisonRows.all()) {
      const petName = await row.locator('td').nth(4).locator('tr').textContent() || ''
      actualPets.push(petName.trim())
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
  await page.waitForResponse('**/api/specialties/3046')
  await page.locator('#name').fill('dermatology')
  await page.getByRole('button', { name: 'Update' }).click()
  await expect(page.locator("[id='1']")).not.toHaveValue('surgery')
  await expect(page.locator("[id='1']")).toHaveValue('dermatology')
  await page.getByRole('button', { name: 'Veterinarians' }).click()
  await page.getByText('All').click()
  await expect(page.getByRole('row', { name: 'Rafael Ortega' }).locator('td').nth(1)).toContainText('dermatology')
  await page.getByRole('link', { name: 'Specialties' }).click()
  await page.getByRole('row', { name: 'dermatology' }).getByRole('button', { name: 'Edit' }).click()
  await page.waitForResponse('**/api/specialties/3046')
  await page.locator('#name').fill('surgery')
  await page.getByRole('button', { name: 'Update' }).click()
  await expect(page.locator("[id='1']")).not.toHaveValue('dermatology')
  await expect(page.locator("[id='1']")).toHaveValue('surgery')
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
    const value = await row.textContent() || ''
    dropdownSpecialtiesArray.push(value)
  }
  expect(dropdownSpecialtiesArray).toEqual(specialties)
  await page.locator('#oncology').check()
  await page.mouse.click(0, 0) // Sayfanın sol üst köşesine tıkla
  await page.getByRole('button', { name: 'Save Vet' }).click()
  await veterinariansMenuItem.click()
  await allVetsButton.click()
  await expect(page.getByRole('row', { name: 'Sharon Jenkins' }).locator('td').nth(1)).toContainText('oncology')
  await specialtiesMenuItem.click()
  await page.getByRole('row', { name: 'oncology' }).getByRole('button', { name: 'Delete' }).click()
  await veterinariansMenuItem.click()
  await allVetsButton.click()
  await expect(page.getByRole('row', { name: 'Sharon Jenkins' })).toContainText('')
})