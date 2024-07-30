# Create a timestamp in YYYY_mm_dd format
timestamp=$(date +"%Y_%m_%d_%H:%M:%S")
mkdir -p logs
npm run start-prod > ./logs/log_${timestamp}.txt  