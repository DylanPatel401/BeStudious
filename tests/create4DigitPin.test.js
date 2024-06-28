import { create4DigitPin } from "../utils/utils";

describe('create4DigitPin', () => {
  it('should generate a random 4-digit PIN', () => {
    const pin = create4DigitPin();

    // Assertions
    expect(pin).toBeGreaterThanOrEqual(1000); // Ensure the generated PIN is at least 1000
    expect(pin).toBeLessThan(10000); // Ensure the generated PIN is less than 10000
    expect(Number.isInteger(pin)).toBe(true); // Ensure the generated PIN is an integer
    expect(pin.toString().length).toBe(4); // Ensure the generated PIN has 4 digits
  });
});
