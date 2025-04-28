import { test, expect, Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('Owners').click()
    await page.getByText('Search').click()
})

test('Select the desired date in the calendar', async ({ page }) => {
    await page.getByRole('link', { name: 'Harold Davis' }).click()
    await page.waitForResponse('**/owners/*')
    await page.getByRole('button', { name: 'Add New Pet' }).click()
    await page.getByLabel('Name').fill('Tom')
    await expect(page.locator('.form-group', { hasText: 'Name' }).locator('.form-control-feedback')).toHaveClass(/.*glyphicon-ok.*/)
    await page.getByRole('button', { name: 'Open calendar' }).click()
    await page.getByRole('button', { name: 'Choose month and year' }).click()
    await page.getByRole('button', { name: 'Previous 24 years' }).click()
    await page.getByRole('gridcell', { name: '2014' }).click()
    await page.getByRole('button', { name: '05 2014' }).click()
    await page.getByRole('button', { name: '2014/05/02' }).click()
    await expect(page.locator('input[name="birthDate"]')).toHaveValue('2014/05/02')
    await page.getByLabel('Type').selectOption('dog')
    await page.getByRole('button', { name: 'Save Pet' }).click()
    const petTomSection = page.locator('app-pet-list', { hasText: 'Tom' })
    await expect(petTomSection).toContainText('Tom')
    await expect(petTomSection).toContainText('2014-05-02')
    await expect(petTomSection).toContainText('dog')
    await page.locator('app-pet-list', { hasText: 'Tom' }).getByRole('button', { name: 'Delete Pet' }).click()
    await expect(page.getByText('Tom')).toHaveCount(0)
})
test('Select the dates of visits and validate dates order', async ({ page }) => {
    await page.getByRole('link', { name: 'Jean Coleman' }).click()
    await page.locator('app-pet-list', { hasText: 'Samantha' }).getByRole('button', { name: 'Add Visit' }).click()
    await expect(page.getByRole('heading', { name: 'New Visit' })).toBeVisible()
    const petDataRow = page.locator('.table-striped > tr')
    await expect(petDataRow.locator('td').nth(0)).toHaveText('Samantha')
    await expect(petDataRow.locator('td').nth(3)).toHaveText('Jean Coleman')
    await page.getByRole('button', { name: 'Open calendar' }).click()
    await page.locator('.mat-calendar-body-active').click()
    const todayDate = new Date()
    const expectedYear = todayDate.getFullYear()
    const expectedMonth = todayDate.toLocaleString('en-US', { month: '2-digit' })
    const expectedDay = todayDate.toLocaleString('en-US', { day: '2-digit' })
    const expectedVisitDateSlashFormat = `${expectedYear}/${expectedMonth}/${expectedDay}`
    await expect(page.locator('input[name="date"]')).toHaveValue(expectedVisitDateSlashFormat)
    await page.locator('#description').fill('dermatologists visit')
    await page.getByRole('button', { name: 'Add Visit' }).click()
    const expectedVisitDateDashFormat = `${expectedYear}-${expectedMonth}-${expectedDay}`
    const visitRowsForSamantha = page
        .locator('app-pet-list', { hasText: 'Samantha' })
        .locator('.table-condensed tr')
    await expect(visitRowsForSamantha.filter({ hasText: 'dermatologists visit' })).toContainText(expectedVisitDateDashFormat)
    await page.locator('app-pet-list', { hasText: 'Samantha' }).getByRole('button', { name: 'Add Visit' }).click()
    await page.getByRole('button', { name: 'Open calendar' }).click()
    const fortyFiveDaysAgoDate = new Date(todayDate)
    fortyFiveDaysAgoDate.setDate(todayDate.getDate() - 45)
    const expectedPastYear = fortyFiveDaysAgoDate.getFullYear()
    const expectedPastMonth = (fortyFiveDaysAgoDate.getMonth() + 1).toString().padStart(2, '0')
    const expectedPastDay = fortyFiveDaysAgoDate.getDate().toString()
    const expectedPastVisitDateDashFormat = `${expectedPastYear}-${expectedPastMonth}-${expectedPastDay}`
    const expectedMonthYearText = `${expectedPastMonth} ${expectedPastYear}`
    let calendarMonthYear = await page.getByRole('button', { name: 'Choose month and year' }).textContent()
    while (!calendarMonthYear?.includes(expectedMonthYearText)) {
        await page.getByRole('button', { name: 'Previous month' }).click()
        calendarMonthYear = await page.locator('.mat-calendar-period-button').textContent()
    }
    await page.getByRole('button', { name: expectedPastDay }).click()
    await page.locator('#description').fill('massage therapy')
    await page.getByRole('button', { name: 'Add Visit' }).click()

    const currentVisitDateText = (await visitRowsForSamantha
        .filter({ hasText: 'dermatologists visit' })
        .locator('td').nth(0)
        .textContent())!
    const pastVisitDateText = (await visitRowsForSamantha
        .filter({ hasText: 'massage therapy' })
        .locator('td').nth(0)
        .textContent())!
    const currentVisitDateSamantha = new Date(currentVisitDateText)
    const pastVisitDateSamantha = new Date(pastVisitDateText)
    expect(currentVisitDateSamantha > pastVisitDateSamantha).toBeTruthy()
    await visitRowsForSamantha
        .filter({ hasText: 'dermatologists visit' })
        .locator('button', { hasText: 'Delete Visit' })
        .click()
    await visitRowsForSamantha
        .filter({ hasText: 'massage therapy' })
        .locator('button', { hasText: 'Delete Visit' })
        .click()
    await expect(
        page.locator('app-pet-list', { hasText: 'Samantha' }).locator('.table-condensed')
    ).not.toContainText(`${expectedVisitDateDashFormat} dermatologists visit`)
    await expect(
        page.locator('app-pet-list', { hasText: 'Samantha' }).locator('.table-condensed')
    ).not.toContainText(`${expectedPastVisitDateDashFormat} massage therapy`)
})