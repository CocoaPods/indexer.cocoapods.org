WITH latest_version AS (
  SELECT id, pod_id FROM (
    SELECT
      id,
      pod_id,
      rank() OVER (PARTITION by pod_id ORDER BY created_at desc) AS version_rank
      FROM pod_versions
    ) AS ranked_versions
  WHERE version_rank = 1
)

SELECT
  pods.normalized_name AS "objectID",
  commits.specification_data AS "specificationData",
  json_build_object(
    'lastMonth', stats_metrics.download_month,
    'total', stats_metrics.download_total,
    'appsTouched', stats_metrics.app_total
  ) AS downloads

FROM pods
LEFT JOIN latest_version ON latest_version.pod_id = pods.id
LEFT JOIN stats_metrics ON stats_metrics.pod_id = pods.id
LEFT JOIN commits ON commits.pod_version_id = latest_version.id;
