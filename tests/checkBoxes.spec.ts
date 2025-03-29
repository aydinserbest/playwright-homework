import { test, expect } from '@playwright/test';
import { assert } from 'console';

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})
test('Validate selected specialties', async ({ page }) => {
    await page.getByRole('button', { name: 'Veterinarians' }).click()
    await page.getByRole('link', { name: 'All' }).click()
    await expect(page.getByRole('heading')).toHaveText('Veterinarians')
    await page.locator('tr', { hasText: "Helen Leary" }).getByRole('button', { name: 'Edit Vet' }).click()
    const selectedSpecialtiesField = page.locator('.selected-specialties');
    await expect(selectedSpecialtiesField).toHaveText('radiology');
    await selectedSpecialtiesField.click()
    await expect(page.getByLabel('radiology')).toBeChecked()
    await expect(page.getByLabel('surgery')).not.toBeChecked()
    await expect(page.getByLabel('dentistry')).not.toBeChecked()
    await page.getByLabel('surgery').check()
    await page.getByLabel('radiology').uncheck()
    await expect(selectedSpecialtiesField).toHaveText('surgery')
    await page.getByLabel('dentistry').check()
    await expect(selectedSpecialtiesField).toHaveText('surgery, dentistry')
})
test('Select all specialties', async ({ page }) => {
    await page.getByRole('button', { name: 'Veterinarians' }).click()
    await page.getByRole('link', { name: 'All' }).click()
    await page.locator('tr', { hasText: 'Rafael Ortega' }).getByRole('button', { name: 'Edit Vet' }).click()
    const selectedSpecialtiesField = page.locator('.selected-specialties')
    await expect(selectedSpecialtiesField).toHaveText('surgery')
    await selectedSpecialtiesField.click()

    const allSpecialtyCheckboxes = page.getByRole('checkbox')
    for (const box of await allSpecialtyCheckboxes.all()) {
        await box.check()
        await expect(box).toBeChecked()
    }
    await expect(selectedSpecialtiesField).toHaveText('surgery, radiology, dentistry')
})
test('Unselect all specialties', async ({ page }) => {
    await page.getByRole('button', { name: 'Veterinarians' }).click()
    await page.getByRole('link', { name: 'All' }).click()
    await page.locator('tr', { hasText: 'Linda Douglas' }).getByRole('button', { name: 'Edit Vet' }).click()
    const selectedSpecialtiesField = page.locator('.selected-specialties')
    await expect(selectedSpecialtiesField).toHaveText('dentistry, surgery')
    await selectedSpecialtiesField.click()

    const allSpecialtyCheckboxes = page.getByRole('checkbox')
    for (const box of await allSpecialtyCheckboxes.all()) {
        await box.uncheck()
        await expect(box).not.toBeChecked()
    }
    await expect(selectedSpecialtiesField).toHaveText('')
})