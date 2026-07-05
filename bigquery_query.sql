-- Weekly Growth Intelligence Agent — BigQuery Node
-- Purpose: Pull unsampled GA4 purchase data by channel and week
-- Partition pruning via _TABLE_SUFFIX reduces scan cost vs event_date filter

SELECT
  CASE
    WHEN traffic_source.medium = 'cpc'      THEN 'Paid'
    WHEN traffic_source.medium = 'organic'  THEN 'Organic'
    WHEN traffic_source.source = '(direct)' THEN 'Direct'
    ELSE 'Other'
  END AS channel,
  COUNT(*) AS total_purchases,
  EXTRACT(WEEK FROM PARSE_DATE('%Y%m%d', event_date)) AS week_number
FROM `bigquery-public-data.ga4_obfuscated_sample_ecommerce.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20210101' AND '20210131'
  AND event_name = 'purchase'
GROUP BY channel, week_number
ORDER BY week_number, total_purchases DESC
