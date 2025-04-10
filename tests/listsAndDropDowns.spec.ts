import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Owners' }).click()
    await page.getByRole('link', { name: ' Search' }).click()
    await expect(page.getByRole('heading')).toHaveText('Owners')
})
test('Validate selected pet types from the list', async ({ page }) => {
    await page.getByRole('link', { name: 'George Franklin' }).click()
    await expect(page.locator('b.ownerFullName')).toHaveText('George Franklin')
    await page.locator('app-pet-list', { hasText: 'Leo' }).getByRole('button', { name: 'Edit Pet' }).click()
    await expect(page.getByRole('heading')).toHaveText(' Pet ')
    await expect(page.locator('#owner_name')).toHaveValue('George Franklin')
    const typeDisplayField = page.locator('#type1')
    await expect(typeDisplayField).toHaveValue('cat')
    const typeSelectField = page.getByLabel('Type')
    const typeOptions = await typeSelectField.locator('option').allTextContents()

    for (const option of typeOptions) {
        await typeSelectField.selectOption(option)
        await expect(typeDisplayField).toHaveValue(option)
    }
})
test('Validate the pet type update', async ({ page }) => {
    await page.getByRole('link', { name: 'Eduardo Rodriquez' }).click()
    const rosyPetDetails = page.locator('app-pet-list', { hasText: 'Rosy' })
    await rosyPetDetails.getByRole('button', { name: 'Edit Pet' }).click()
    await expect(page.getByLabel('Name')).toHaveValue('Rosy')
    const typeDisplayField = page.locator('#type1')
    await expect(typeDisplayField).toHaveValue('dog')
    const typeSelectField = page.getByLabel('Type')
    await typeSelectField.selectOption('bird')
    await expect(typeDisplayField).toHaveValue('bird')
    await expect(typeSelectField).toHaveValue('bird')
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(rosyPetDetails.locator('dd').nth(2)).toHaveText('bird')
    await rosyPetDetails.getByRole('button', { name: 'Edit Pet' }).click()
    await expect(typeDisplayField).toHaveValue('bird')
    await typeSelectField.selectOption('dog')
    await expect(typeDisplayField).toHaveValue('dog')
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(rosyPetDetails.locator('dd').nth(2)).toHaveText('dog')
})