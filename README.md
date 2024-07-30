## Gold Price AI Service

This service leverages the power of artificial intelligence (AI) to predict gold prices in Thailand, specifically for the 96.5% gold bar. By combining web scraping and AI analysis, it empowers traders and investors with valuable insights.

**Features:**

* **AI-Powered Gold Price Prediction:** Employing advanced AI algorithms, the service analyzes historical data and market trends to predict the most likely future prices for 96.5% gold bars in Thailand.
* **Data-Driven Insights:** The service meticulously scrapes gold price information from reliable web sources, ensuring AI models are trained on comprehensive and up-to-date data.
* **AI-Generated Market Summaries:** Beyond prediction, the service employs AI to intelligently summarize market movements and key factors influencing gold prices, offering valuable context to your investment decisions.

**Setup:**

To utilize this service, you'll need to acquire API keys from the following providers:

* **Gemini AI:** Obtain your API key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). Gemini AI provides the essential AI infrastructure for training and using our prediction models.
* **Serp API (Optional):** If you wish to integrate web scraping functionalities for real-time data acquisition, procure an API key from [https://serpapi.com/dashboard](https://serpapi.com/dashboard).

**Output:**
 - Teminal
 - Line Notify

**Installation:**

1. Clone this repository.
2. Install required dependencies: `npm install`
3. Configure your API keys in the appropriate environment variables in /config folder.

**Usage:**

1. Run the `npm start` script (or equivalent script in your project).
2. The service will automatically scrape data (if using Serp API), analyze it using AI, and present the predicted gold price along with supporting summaries.
3. Setup a cron job to run the scrip periodically.
