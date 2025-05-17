CREATE OR REPLACE FUNCTION public.get_aggregated_gold_prices_by_period(
  period text,
  start_ts timestamptz,
  end_ts timestamptz
)
RETURNS TABLE (
  date_time timestamptz,
  min_sell bigint,
  max_sell bigint
)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc(period, created_time) AS date_time,
    MIN(sell) AS min_sell,
    MAX(sell) AS max_sell
  FROM goldprice
  WHERE created_time BETWEEN start_ts AND end_ts
  GROUP BY date_time
  ORDER BY date_time;
END;
$$ LANGUAGE plpgsql;