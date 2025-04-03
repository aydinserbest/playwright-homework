import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})
test('Add and delete pet type with dialogBoxes', async ({ page }) => {
    await page.getByRole('link', { name: ' Pet Types' }).click()
    await expect(page.getByRole('heading', { name: 'Pet Types' })).toBeVisible()
    await page.getByRole('button', { name: ' Add ' }).click()
    await expect(page.getByRole('heading', { name: 'New Pet Type' })).toBeVisible()
    await expect(page.locator('.control-label', { hasText: 'Name' })).toBeVisible()
    await expect(page.locator('#name')).toBeVisible()
    await page.locator('#name').fill('pig')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('table').locator('input').last()).toHaveValue('pig')
    const petTypeInputs = page.getByRole('table').locator('input');
    const initialInputCount = await petTypeInputs.count();
    page.on('dialog', async dialog => {
        expect(dialog.message()).toEqual('Delete the pet type?')
        await dialog.accept()
    })
    await page.getByRole('table').locator('tr').last().getByRole('button', { name: 'Delete' }).click()
    await expect(petTypeInputs).toHaveCount(initialInputCount - 1)
    await expect(page.getByRole('table').locator('input').last()).not.toHaveValue('pig')
})