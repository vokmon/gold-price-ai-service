create or replace function get_aggregated_gold_prices_by_period(
  period text,
  start_ts timestamptz,
  end_ts timestamptz
)
returns table (
  date_time timestamptz,
  min_sell bigint,
  max_sell bigint
)
as $$
begin
  return query
  select
    date_trunc(period, created_time) as date_time,
    min(sell) as min_sell,
    max(sell) as max_sell
  from goldprice
  where created_time between start_ts and end_ts
  group by date_time
  order by date_time;
end;
$$ language plpgsql;
