import { getCurrentDate, getFormattedDate } from "./date-utils.ts";

const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
};

const getHuasenghengDailyRecapLink = (date: Date) => {
  const formattedDate = getFormattedDate(date, "th-TH", "2-digit");
  return `https://www.huasengheng.com/news/daily-recap-gold-spot-${formattedDate.replace(
    /\//g,
    "-"
  )}`;
};

const getHuasenghengMarketFocusWeeklyLink = (date: Date) => {
  const formattedDate = getFormattedDate(date, "th-TH", "2-digit");

  const day = formattedDate.substring(0, 2);
  const month = formattedDate.substring(3, 5);
  const year = formattedDate.substring(8, 10);
  const formattedShortDate = `${day}-${month}-${year}`;

  return `https://www.huasengheng.com/news/market-focus-weekly-${formattedShortDate}`;
};

const getHuasenghengHolidayReportLink = (date: Date) => {
  const formattedDate = getFormattedDate(date, "th-TH", "2-digit");
  return `https://www.huasengheng.com/news/holiday-report-${formattedDate.replace(
    /\//g,
    "-"
  )}`;
};

const getInterGoldDailyRecapLink = (date: Date) => {
  const formattedDate = getFormattedDate(date, "en-GB");
  return `https://www.intergold.co.th/investor_core/analyze-${formattedDate
    .replace(/ /g, "-")
    .toLocaleLowerCase()}`;
};

const getAdditionalLinks = () => {
  const currentDate = new Date();

  // Add extra links
  const huasenghengLink = getHuasenghengDailyRecapLink(currentDate);

  const huasenghengLinkWeekly =
    getHuasenghengMarketFocusWeeklyLink(currentDate);

  const huasenghengLinkHolidayReport =
    getHuasenghengHolidayReportLink(currentDate);

  const interGoldLink = getInterGoldDailyRecapLink(currentDate);

  return [
    interGoldLink,
    huasenghengLink,
    huasenghengLinkWeekly,
    huasenghengLinkHolidayReport,
  ];
};

const getArticleLinks = (startDate: Date, endDate: Date) => {
  const links: string[] = [];

  // Loop through each day from start to end
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const huasenghengLink = getHuasenghengDailyRecapLink(currentDate);
    const interGoldLink = getInterGoldDailyRecapLink(currentDate);
    links.push(huasenghengLink);
    links.push(interGoldLink);
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  links.push(getHuasenghengMarketFocusWeeklyLink(endDate));
  links.push(getHuasenghengHolidayReportLink(endDate));

  const sortedLinks = links.sort();
  return sortedLinks;
};

export { isValidUrl, getAdditionalLinks, getArticleLinks };
