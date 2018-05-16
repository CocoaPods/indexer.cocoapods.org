-- Reference: https://gist.github.com/jugutier/62d1da6fc8edc3d6efe88223b33f5032
SELECT
  pods.normalized_name AS "objectID",
  specification_data AS "specificationData",
  json_build_object(
    'lastMonth', stats_metrics.download_month,
    'total', stats_metrics.download_total,
    'appsTouched', stats_metrics.app_total) AS downloads

FROM
  pods,
  stats_metrics,
  -- get the last version of a pod
  (
    SELECT
      latest_version_per_pod.pod_id,
      all_pods.specification_data

    FROM (
        SELECT
          latest_version,
          pod_versions.id AS version_id,
          latest_pods.pod_id

        FROM pod_versions

        JOIN (
            SELECT
              max(pod_versions.name) AS latest_version,
              pod_id

            FROM pod_versions

            GROUP BY pod_id
          ) AS latest_pods ON pod_versions.pod_id = latest_pods.pod_id
          AND pod_versions.name = latest_pods.latest_version
      ) AS latest_version_per_pod

      LEFT JOIN LATERAL

      (
        SELECT
          pod_versions.name AS VERSION,
          commits.specification_data,
          pod_versions.pod_id,
          pod_versions.id AS version_id

        FROM commits

        JOIN pod_versions ON commits.pod_version_id = pod_versions.id

        WHERE
          pod_versions.pod_id = latest_version_per_pod.pod_id
          AND version_id = latest_version_per_pod.version_id

        LIMIT 1
      ) AS all_pods ON TRUE
  ) as latest_version

WHERE
  pods.id = latest_version.pod_id
  AND pods.id = stats_metrics.pod_id
  AND NOT pods.deleted
