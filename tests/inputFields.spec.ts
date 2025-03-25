import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/')
})

//Test Case 1: Update pet type
test('Update pet type', async ({ page }) => {
    //Select the PET TYPES menu item in the navigation bar
    await page.getByRole('link', { name: 'Pet Types' }).click()

    //Add assertion of the "Pet Types" text displayed above the table with the list of pet types
    const sectionTitle = page.getByRole('heading', { name: 'Pet Types' });
    await expect(sectionTitle).toHaveText('Pet Types')


    //Click on "Edit" button for the "cat" pet type
    await page.getByRole('button', { name: 'Edit' }).first().click();

    //const catPetType = page.locator('tr:has(input[id="0"])');
    //await catPetType.getByText('Edit').click()

    //Add assertion of the "Edit Pet Type" text displayed
    const heading = page.getByRole('heading', { name: 'Edit Pet Type' });
    await expect(heading).toHaveText('Edit Pet Type')

    //Change the pet type name from "cat" to "rabbit" and click "Update" button
    const petName = page.locator('#name')
    await petName.click()
    await petName.clear()
    await petName.fill('rabit')
    const updateButton = page.getByRole('button', { name: 'Update' })
    await updateButton.click();

    //Add the assertion that the first pet type in the list of types has a value "rabbit" 
    const firstPetInput = page.locator('input[name="pettype_name"]').first();
    await expect(firstPetInput).toHaveValue('rabit');

    //Click on "Edit" button for the same "rabbit" pet type
    await page.getByRole('button', { name: 'Edit' }).first().click();

    //Change the pet type name back from "rabbit" to "cat" and click "Update" button
    await petName.click()
    await petName.fill('cat')
    await updateButton.click()

    //Add the assertion that the first pet type in the list of names has a value "cat" 
    await expect(firstPetInput).toHaveValue('cat')
});
//Test Case 2: Update pet type
test('Cancel pet type update', async ({ page }) => {
    //Select the PET TYPES menu item in the navigation bar
    await page.getByRole('link', { name: 'Pet Types' }).click()

    //Add assertion of the "Pet Types" text displayed above the table with the list of pet types
    const sectionTitle = page.getByRole('heading', { name: 'Pet Types' });
    await expect(sectionTitle).toHaveText('Pet Types')


    //Click on "Edit" button for the "dog" pet type
    const dogEditButton = page.getByRole('button', { name: 'Edit' }).nth(1);
    await dogEditButton.click();

    //Type the new pet type name "moose"
    const petName = page.locator('#name')
    await petName.click()
    await petName.clear()
    await petName.fill('moose')

    //Add assertion the value "moose" is displayed in the input field of the "Edit Pet Type" page
    await expect(petName).toHaveValue('moose');

    //Click on "Cancel" button
    await page.getByRole('button', { name: 'Cancel' }).click();

    //Add the assertion the value "dog" is still displayed in the list of pet types
    const dogInput = page.getByRole('textbox').nth(1);
    await expect(dogInput).toHaveValue('dog');
});
//Test Case 3: Update pet type
test('Pet type name is required validation', async ({ page }) => {
    //Select the PET TYPES menu item in the navigation bar
    await page.getByRole('link', { name: 'Pet Types' }).click()

    //Add assertion of the "Pet Types" text displayed above the table with the list of pet types
    const sectionTitle = page.getByRole('heading', { name: 'Pet Types' });
    await expect(sectionTitle).toHaveText('Pet Types')


    //Click on "Edit" button for the "lizard" pet type
    const dogEditButton = page.getByRole('button', { name: 'Edit' }).nth(2);
    await dogEditButton.click();

    //On the Edit Pet Type page, clear the input field
    const petName = page.locator('#name')
    await petName.click()
    await petName.clear()

    //Add the assertion for the "Name is required" message below the input field
    const requiredMessage = page.getByText('Name is required');
    await expect(requiredMessage).toHaveText('Name is required');

    //Click on "Update" button
    const updateButton = page.getByRole('button', { name: 'Update' })
    await updateButton.click();

    // Add assertion that "Edit Pet Type" page is still displayed
    const heading = page.getByRole('heading', { name: 'Edit Pet Type' });
    await expect(heading).toHaveText('Edit Pet Type')

    //Click on "Cancel" button
    await page.getByRole('button', { name: 'Cancel' }).click();

    //Add assertion that "Pet Types" page is displayed
    await expect(sectionTitle).toHaveText('Pet Types')
});