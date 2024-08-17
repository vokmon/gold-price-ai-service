## Gold Price AI Service

This service leverages the power of artificial intelligence (AI), specifically utilizing the Langchain library, to predict gold prices in Thailand, focusing on the 96.5% gold bar. By combining web scraping and AI analysis, it empowers traders and investors with valuable insights.

Additionally, the system offers real-time price monitoring, providing instant notifications when gold prices fluctuate beyond user-defined thresholds. This feature enables users to make informed decisions and seize opportunities effectively.

* **Example:**

![alt text](./images/goldprice-log.png)

<img src="./images/gold-price-line-notification-alert.jpg" alt="gold price Line Notify" width="400"/>
Summary
<br/>
<br/>


<img src="./images/line-price-monitoring.jpg" alt="gold price Line Notify" width="400"/>
Price monitoring

<br/>
<br/>
<br/>

**Features:**

* **AI-Powered Gold Price Prediction:** Employing advanced AI algorithms, the service analyzes historical data and market trends to predict the most likely future prices for 96.5% gold bars in Thailand.
* **Data-Driven Insights:** The service meticulously scrapes gold price information from reliable web sources, ensuring AI models are trained on comprehensive and up-to-date data.
* **AI-Generated Market Summaries:** Beyond prediction, the service employs AI to intelligently summarize market movements and key factors influencing gold prices, offering valuable context to your investment decisions.

* **Price Monitoring:** The system provides real-time alerts when gold prices change significantly, helping users make timely decisions.

* **Line Notify Integration:** Receive timely notifications about significant price changes, market summaries, and predictions directly to your Line app for quick decision-making.

**Setup:**

To utilize this service, you'll need to acquire API keys from the following providers:

* **Gemini AI:** Obtain your API key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey). Gemini AI provides the essential AI infrastructure for training and using our prediction models.
* **Serp API (Optional):** If you wish to integrate web scraping functionalities for real-time data acquisition, procure an API key from [https://serpapi.com/dashboard](https://serpapi.com/dashboard).

**Output:**
 - Teminal
 - Line Notify

**Installation:**

1. Clone this repository.
2. Install required dependencies: `bun install`
3. Configure your API keys in the appropriate environment variables in /config folder.

**Usage:**

### Single run
1. Run the `bun start` script (or equivalent script in your project).
2. The service will automatically scrape data (if using Serp API), analyze it using AI, and present the predicted gold price along with supporting summaries.

### Start with cron
1. Setup the variable name as shown in config/env.example
For example
```
  export GOOGLE_API_KEY="get the key from https://aistudio.google.com/app/apikey"
  export GOOGLE_AI_MODEL="gemini-1.5-flash"
```
2. Run the `bun run start-cron` to start the service as a cron job

**Usage in Docker:**
1. Build the image
```
  docker build -t goldpriceai:latest .
```

2. Running the Image
Please find the variable name in config/env.example
```
  docker run -e VARIABLE_NAME=value -p 8888:8888 goldpriceai:latest
```

**Setup cronjob:**
1. Update the environment variable CRON_SUMMARY_SCHEDULE and CRON_MONITOR_PRICE

2. By default it runs on Mon to Sat at 9am and 5pm

3. Setup the price threshold

```
0 9,17 * * 1-6 /opt/app/runscript.sh
```

**Tests with Vitest:**
Test with Vitest framework

<img src="./images/tests.png" alt="Tests" width="500"/>

<img src="./images/test-coverage.png" alt="Test coverage" width="500"/>
