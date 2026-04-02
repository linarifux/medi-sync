/**
 * Calculates stock depletion and predicts the best reorder date.
 * * @param {number} stockLeft - Current stock available (e.g., 23)
 * @param {number} consumptionRate - Dosage taken per period (e.g., 2)
 * @param {string} frequency - 'daily' or 'weekly'
 * @returns {object} Calculated dates and status flags
 */
export const calculateNextOrderDate = (stockLeft, consumptionRate, frequency) => {
  // Handle empty or invalid inputs gracefully
  if (stockLeft === undefined || stockLeft === null || !consumptionRate) {
    return null;
  }

  let daysOfStockLeft = 0;

  // 1. Calculate raw days left
  if (frequency === 'daily') {
    daysOfStockLeft = stockLeft / consumptionRate;
  } else if (frequency === 'weekly') {
    daysOfStockLeft = (stockLeft / consumptionRate) * 7;
  }

  // Round down to be safe (partial days don't count as a full dose)
  daysOfStockLeft = Math.floor(daysOfStockLeft);

  // 2. Calculate when it will run out completely
  const depletionDate = new Date();
  depletionDate.setDate(depletionDate.getDate() + daysOfStockLeft);

  // 3. Calculate next order date (5-day safety buffer)
  const orderDate = new Date(depletionDate);
  orderDate.setDate(orderDate.getDate() - 5);

  return {
    daysLeft: daysOfStockLeft,
    estimatedDepletion: depletionDate,
    nextOrderDate: orderDate,
    // 4. Boolean flag to easily trigger UI warnings (Red text/badges)
    needsRestock: daysOfStockLeft <= 5, 
  };
};