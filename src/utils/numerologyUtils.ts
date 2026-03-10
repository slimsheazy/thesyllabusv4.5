export function calculateLifePath(dateString: string): number {
  // Expected format: YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length !== 3) return 0;

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  const reduce = (num: number | string): number => {
    let sum = String(num)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    
    // Master numbers 11, 22, 33 are usually not reduced in the first steps
    if (sum === 11 || sum === 22 || sum === 33) return sum;
    if (sum > 9) return reduce(sum);
    return sum;
  };

  const rMonth = reduce(month);
  const rDay = reduce(day);
  const rYear = reduce(year);

  let total = rMonth + rDay + rYear;
  
  const finalReduce = (num: number): number => {
    if (num === 11 || num === 22 || num === 33) return num;
    if (num > 9) {
      let sum = String(num)
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
      return finalReduce(sum);
    }
    return num;
  };

  return finalReduce(total);
}
