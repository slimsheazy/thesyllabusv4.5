export const logCalculation = (type: string, intent: string, result: any) => {
  console.log(`Calculation logged: ${type}`, { intent, result });
  // In a real app, this would interact with a database.
};
