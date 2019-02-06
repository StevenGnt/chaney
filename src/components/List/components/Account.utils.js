export function getTransactionDays(day) {
  return Array.isArray(day) ? day : [day];
}

function getMinimum(values) {
  return values.reduce((finalValue, value) =>
    finalValue === false || value < finalValue
      ? value : finalValue
    , false);
}

/**
 * Sort method used to sort monthly and weelky transaction.
 * Sort with positive transactions first, then sort by day.
 * @param {Object} a 
 * @param {Object} b 
 * @returns {Number}
 */
export function sortMultipleDays(a, b) {
  const aPositive = a.amount > 0;
  const bPositive = b.amount > 0;

  if (aPositive && !bPositive) {
    return -1;
  } else if (bPositive && !aPositive) {
    return 1;
  }

  const aDays = getTransactionDays(a.day);
  const bDays = getTransactionDays(b.day);

  return getMinimum(aDays) > getMinimum(bDays) ? 1 : -1;
}

/**
 * Sort method used to sort daily transactions
 * @param {Object} a 
 * @param {Object} b 
 * @returns {Number}
 */
export function sortDaily(a, b) {
  if (a.date === b.date) {
    return a.name.localeCompare(b.name);
  }

  return a.date > b.date ? 1 : -1;
}


export default { getTransactionDays, sortMultipleDays, sortDaily };
