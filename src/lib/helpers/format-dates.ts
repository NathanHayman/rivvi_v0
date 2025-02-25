export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateForTable = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const daysAgo = (date: string) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatTimeAgo = (date: string) => {
  // if the date is less then 1 minutes return the value in seconds with `seconds ago` alongside the value
  // if the date is less then 1 hour return the value in minutes with `minutes ago` alongside the value
  // if the date is less then 1 day return the value in hours with `hours ago` alongside the value
  // if the date is less then 1 week return the value in days with `days ago` alongside the value
  // if the date is less then 1 month return the value in weeks with `weeks ago` alongside the value
  // if the date is less then 1 year return the value in months with `months ago` alongside the value
  const now = new Date();

  const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
  const diffSeconds = Math.ceil(diffTime / 1000);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
  const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));

  if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks} weeks ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} months ago`;
  }
  return `${diffYears} years ago`;
};

// create a function that is an algorithm that will intake a birth date like 5/2/47.
// it needs to turn the year into either 1947 or 2047 depending on the algorithm
// the algorithm is if the year is less than 25 add 2000 to the year
// if the year is greater than 25 add 1900 to the year

export const formatBirthDate = (date: string) => {
  const year = date.split("/")[2];
  if (Number(year) < 25) {
    return `${date.split("/")[0]}/${date.split("/")[1]}/20${year}`;
  }
  return `${date.split("/")[0]}/${date.split("/")[1]}/19${year}`;
};
