/****************************************************************************//**
 * @fileoverview the purpose of this file is to store testing-related constants
 * ****************************************************************************/

export const longString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam facilisis elementum orci, a pellentesque nisl dapibus ac placerat.';
export const testUsername = 'johnnykarate';
export const testEmail = 'johnnykarate@pawnee.gov';
export const testPassword = 'parksandrec';

//This is a sanity test to ensure that the test packages are working as intended
describe('Sample Test', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})
  