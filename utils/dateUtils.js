module.exports.calculateWarrantyEndDate = (purchaseDate, duration) => {
  const date = new Date(purchaseDate);
  date.setMonth(date.getMonth() + parseInt(duration));
  return date;
};