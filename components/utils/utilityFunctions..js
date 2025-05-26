export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber.length !== 11) {
    return phoneNumber;
  }
  return `${phoneNumber.slice(0, 4)}-${phoneNumber.slice(4)}`;
}

export function getOrdinal(number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = number % 100;
  return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}


export function formatDate(dateString) {
  const date = new Date(dateString);

  // Define the months
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Get day, month, and year
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Get ordinal suffix
  const ordinalSuffix = (day) => {
    if (day % 10 === 1 && day !== 11) return "st";
    if (day % 10 === 2 && day !== 12) return "nd";
    if (day % 10 === 3 && day !== 13) return "rd";
    return "th";
  };

  // Format the date
  return `${day}${ordinalSuffix(day)} ${month}, ${year}`;
}
