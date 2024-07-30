import { getCurrentDate } from "./date-utils.ts";

const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
};

const getAdditionalLinks = () => {
  // Add extra links
  const huasenghengLink = `https://www.huasengheng.com/news/daily-recap-gold-spot-${getCurrentDate(
    "th-TH",
    "2-digit"
  ).replace(/\//g, "-")}`;

  const huasenghengLinkWeekly = `https://www.huasengheng.com/news/market-focus-weekly-${getCurrentDate(
    "th-TH",
    "2-digit"
  ).replace(/\//g, "-")}`;

  const huasenghengLinkHolidayReport = `https://www.huasengheng.com/news/holiday-report-${getCurrentDate(
    "th-TH",
    "2-digit"
  ).replace(/\//g, "-")}`;

  const interGoldLink = `https://www.intergold.co.th/investor_core/analyze-${getCurrentDate(
    "en-GB"
  )
    .replace(/ /g, "-")
    .toLocaleLowerCase()}`;

  return [
    interGoldLink,
    huasenghengLink,
    huasenghengLinkWeekly,
    huasenghengLinkHolidayReport,
  ];
};
export { isValidUrl, getAdditionalLinks };
