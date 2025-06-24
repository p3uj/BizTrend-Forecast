class DateRelated {
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options); // "en-CA" ensures for 'Month DD, YYYY' format
    return formatter.format(date);
  }

  formatDateWithTime(dateString) {
    const date = new Date(dateString);
    const options = {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options); // "en-CA" ensures for 'Month DD, YYYY at hour:minute AM/PM' format
    return formatter.format(date);
  }
}

const dateRelated = new DateRelated();

export default dateRelated;
