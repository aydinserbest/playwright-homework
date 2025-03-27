import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})
test('Update pet type', async ({ page }) => {
    await page.getByRole('link', { name: 'Pet Types' }).click()
    await expect(page.getByRole('heading')).toHaveText('Pet Types')
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await expect(page.getByRole('heading')).toHaveText('Edit Pet Type')
    const petNameInputField = page.locator('#name')
    await petNameInputField.click()
    await petNameInputField.clear()
    await petNameInputField.fill('rabit')
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(page.locator('input[name="pettype_name"]').first()).toHaveValue('rabit');
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await petNameInputField.click()
    await petNameInputField.clear()
    await petNameInputField.fill('cat')
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(page.locator('input[name="pettype_name"]').first()).toHaveValue('cat')
});
test('Cancel pet type update', async ({ page }) => {
    await page.getByRole('link', { name: 'Pet Types' }).click()
    await expect(page.getByRole('heading')).toHaveText('Pet Types')
    await page.getByRole('button', { name: 'Edit' }).nth(1).click()
    const petNameInputField = page.locator('#name')
    await petNameInputField.click()
    await petNameInputField.clear()
    await petNameInputField.fill('moose')
    await expect(page.locator('#name')).toHaveValue('moose');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('textbox').nth(1)).toHaveValue('dog');
});
test('Pet type name is required validation', async ({ page }) => {
    await page.getByRole('link', { name: 'Pet Types' }).click()
    await expect(page.getByRole('heading')).toHaveText('Pet Types')
    await page.getByRole('button', { name: 'Edit' }).nth(2).click()
    const petNameInputField = page.locator('#name')
    await petNameInputField.click()
    await petNameInputField.clear()
    await expect(page.locator('.help-block')).toHaveText('Name is required')
    await page.getByRole('button', { name: 'Update' }).click()
    await expect(page.getByRole('heading')).toHaveText('Edit Pet Type')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading')).toHaveText('Pet Types')
});