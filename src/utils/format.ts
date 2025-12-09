export const formatPrice = (value: number) => {
  if (!value || isNaN(value)) return "₦0.00";

  return "₦" + Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
