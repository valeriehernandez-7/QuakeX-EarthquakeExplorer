-- =============================================
-- Apache Drill - Example Queries for QuakeX
-- =============================================
-- Place earthquake JSON files in /data folder
-- Query syntax: dfs.quakex.`filename.json`
-- =============================================

-- =============================================
-- BASIC QUERIES
-- =============================================

-- View all earthquakes
SELECT * 
FROM dfs.quakex.`sample-earthquakes.json`
LIMIT 100;

-- Count total earthquakes
SELECT COUNT(*) as total_earthquakes
FROM dfs.quakex.`sample-earthquakes.json`;

-- Show available schemas (workspaces)
SHOW SCHEMAS;

-- View sample data structure
SELECT *
FROM dfs.quakex.`sample-sample-earthquakes.json`;

-- =============================================
-- FILTERING
-- =============================================

-- Earthquakes with magnitude >= 5.0
SELECT id, magnitude, place, depth, time
FROM dfs.quakex.`sample-earthquakes.json`
WHERE magnitude >= 5.0
ORDER BY magnitude DESC;

-- Earthquakes in specific date range
SELECT *
FROM dfs.quakex.`sample-earthquakes.json`
WHERE CAST(`time` AS TIMESTAMP) >= TIMESTAMP '2024-10-01 00:00:00'
  AND CAST(`time` AS TIMESTAMP) <= TIMESTAMP '2024-10-31 23:59:59';

-- Shallow earthquakes (depth < 70km)
SELECT place, magnitude, depth
FROM dfs.quakex.`sample-earthquakes.json`
WHERE depth < 70
ORDER BY magnitude DESC;

-- High significance events
SELECT place, magnitude, significance, time
FROM dfs.quakex.`sample-earthquakes.json`
WHERE significance > 600
ORDER BY significance DESC;

-- =============================================
-- AGGREGATIONS & STATISTICS
-- =============================================

-- Overall statistics
SELECT 
  COUNT(*) as total_earthquakes,
  ROUND(AVG(magnitude), 2) as avg_magnitude,
  MAX(magnitude) as max_magnitude,
  MIN(magnitude) as min_magnitude,
  ROUND(AVG(depth), 0) as avg_depth_km,
  MAX(significance) as max_significance
FROM dfs.quakex.`sample-earthquakes.json`;

-- Strongest earthquake
SELECT place, magnitude, depth, time, url
FROM dfs.quakex.`sample-earthquakes.json`
ORDER BY magnitude DESC
LIMIT 1;

-- Top 10 strongest earthquakes
SELECT place, magnitude, depth, time
FROM dfs.quakex.`sample-earthquakes.json`
ORDER BY magnitude DESC
LIMIT 10;

-- =============================================
-- GROUPING & CATEGORIZATION
-- =============================================

-- Count by depth category
SELECT 
  CASE 
    WHEN depth < 70 THEN 'SHALLOW (<70km)'
    WHEN depth < 300 THEN 'INTERMEDIATE (70-300km)'
    ELSE 'DEEP (>300km)'
  END as depth_category,
  COUNT(*) as count,
  ROUND(AVG(magnitude), 2) as avg_magnitude,
  MIN(magnitude) as min_magnitude,
  MAX(magnitude) as max_magnitude
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY 
  CASE 
    WHEN depth < 70 THEN 'SHALLOW (<70km)'
    WHEN depth < 300 THEN 'INTERMEDIATE (70-300km)'
    ELSE 'DEEP (>300km)'
  END
ORDER BY count DESC;

-- Count by magnitude category
SELECT 
  CASE 
    WHEN magnitude < 4.0 THEN 'Minor (0-3.9)'
    WHEN magnitude < 5.0 THEN 'Light (4.0-4.9)'
    WHEN magnitude < 6.0 THEN 'Moderate (5.0-5.9)'
    WHEN magnitude < 7.0 THEN 'Strong (6.0-6.9)'
    ELSE 'Major (7.0+)'
  END as magnitude_category,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY 
  CASE 
    WHEN magnitude < 4.0 THEN 'Minor (0-3.9)'
    WHEN magnitude < 5.0 THEN 'Light (4.0-4.9)'
    WHEN magnitude < 6.0 THEN 'Moderate (5.0-5.9)'
    WHEN magnitude < 7.0 THEN 'Strong (6.0-6.9)'
    ELSE 'Major (7.0+)'
  END
ORDER BY count DESC;

-- Daily earthquake count
SELECT 
  CAST(`time` AS DATE) as event_date,
  COUNT(*) as daily_count,
  ROUND(AVG(magnitude), 2) as avg_magnitude,
  MAX(magnitude) as max_magnitude
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY CAST(`time` AS DATE)
ORDER BY event_date DESC;

-- Hourly distribution (what time of day earthquakes occur)
SELECT 
  EXTRACT(HOUR FROM CAST(`time` AS TIMESTAMP)) as hour_of_day,
  COUNT(*) as count
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY EXTRACT(HOUR FROM CAST(`time` AS TIMESTAMP))
ORDER BY hour_of_day;

-- =============================================
-- ADVANCED QUERIES
-- =============================================

-- Combined depth and magnitude analysis
SELECT 
  CASE 
    WHEN depth < 70 THEN 'SHALLOW'
    WHEN depth < 300 THEN 'INTERMEDIATE'
    ELSE 'DEEP'
  END as depth_category,
  CASE 
    WHEN magnitude < 5.0 THEN 'MINOR'
    WHEN magnitude < 6.0 THEN 'MODERATE'
    ELSE 'MAJOR'
  END as magnitude_category,
  COUNT(*) as count
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY 
  CASE 
    WHEN depth < 70 THEN 'SHALLOW'
    WHEN depth < 300 THEN 'INTERMEDIATE'
    ELSE 'DEEP'
  END,
  CASE 
    WHEN magnitude < 5.0 THEN 'MINOR'
    WHEN magnitude < 6.0 THEN 'MODERATE'
    ELSE 'MAJOR'
  END
ORDER BY count DESC;

-- Earthquakes with above-average magnitude
SELECT place, magnitude, depth, time
FROM dfs.quakex.`sample-earthquakes.json`
WHERE magnitude > (
  SELECT AVG(magnitude) 
  FROM dfs.quakex.`sample-earthquakes.json`
)
ORDER BY magnitude DESC;

-- Geographic clustering (simple latitude ranges)
SELECT 
  CASE 
    WHEN latitude >= 60 THEN 'Far North (60°+)'
    WHEN latitude >= 30 THEN 'Mid North (30°-60°)'
    WHEN latitude >= 0 THEN 'Tropics North (0°-30°)'
    WHEN latitude >= -30 THEN 'Tropics South (0° to -30°)'
    WHEN latitude >= -60 THEN 'Mid South (-30° to -60°)'
    ELSE 'Far South (-60° and below)'
  END as latitude_zone,
  COUNT(*) as count,
  ROUND(AVG(magnitude), 2) as avg_magnitude
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY 
  CASE 
    WHEN latitude >= 60 THEN 'Far North (60°+)'
    WHEN latitude >= 30 THEN 'Mid North (30°-60°)'
    WHEN latitude >= 0 THEN 'Tropics North (0°-30°)'
    WHEN latitude >= -30 THEN 'Tropics South (0° to -30°)'
    WHEN latitude >= -60 THEN 'Mid South (-30° to -60°)'
    ELSE 'Far South (-60° and below)'
  END
ORDER BY count DESC;

-- =============================================
-- TEMPORAL ANALYSIS
-- =============================================

-- Recent earthquakes (last 7 days)
SELECT place, magnitude, time
FROM dfs.quakex.`sample-earthquakes.json`
WHERE CAST(`time` AS TIMESTAMP) >= CURRENT_DATE - INTERVAL '7' DAY
ORDER BY time DESC;

-- Weekly trend
SELECT 
  EXTRACT(WEEK FROM CAST(`time` AS TIMESTAMP)) as week_number,
  EXTRACT(YEAR FROM CAST(`time` AS TIMESTAMP)) as year,
  COUNT(*) as count,
  ROUND(AVG(magnitude), 2) as avg_magnitude
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY 
  EXTRACT(WEEK FROM CAST(`time` AS TIMESTAMP)),
  EXTRACT(YEAR FROM CAST(`time` AS TIMESTAMP))
ORDER BY year DESC, week_number DESC;

-- Monthly summary
SELECT 
  EXTRACT(YEAR FROM CAST(`time` AS TIMESTAMP)) as year,
  EXTRACT(MONTH FROM CAST(`time` AS TIMESTAMP)) as month,
  COUNT(*) as total_events,
  ROUND(AVG(magnitude), 2) as avg_magnitude,
  MAX(magnitude) as max_magnitude
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY 
  EXTRACT(YEAR FROM CAST(`time` AS TIMESTAMP)),
  EXTRACT(MONTH FROM CAST(`time` AS TIMESTAMP))
ORDER BY year DESC, month DESC;

-- =============================================
-- FOR VUE APP INTEGRATION
-- =============================================

-- Filtered earthquakes (for map display)
-- This is the pattern your drillService.js will use
SELECT 
  id,
  magnitude,
  depth,
  latitude,
  longitude,
  place,
  `time`,
  url,
  significance
FROM dfs.quakex.`sample-earthquakes.json`
WHERE magnitude >= 2.5 
  AND magnitude <= 10.0
ORDER BY time DESC
LIMIT 1000;

-- Statistics for dashboard cards
SELECT 
  COUNT(*) as total,
  ROUND(AVG(magnitude), 2) as avgMagnitude,
  ROUND(AVG(depth), 0) as avgDepth
FROM dfs.quakex.`sample-earthquakes.json`;

-- Temporal chart data (grouped by date)
SELECT 
  CAST(`time` AS DATE) as date,
  COUNT(*) as count
FROM dfs.quakex.`sample-earthquakes.json`
GROUP BY CAST(`time` AS DATE)
ORDER BY date;

-- =============================================
-- PERFORMANCE TIPS
-- =============================================

-- Always use LIMIT for large datasets
-- Push filters as close to the data as possible
-- Select only needed columns instead of SELECT *
-- Use indexes if available (check Drill documentation)

-- Example: Efficient query
SELECT id, magnitude, place, time
FROM dfs.quakex.`sample-earthquakes.json`
WHERE magnitude >= 6.0
LIMIT 100;

-- Instead of:
-- SELECT * FROM dfs.quakex.`sample-earthquakes.json`;
-- (then filtering in application)