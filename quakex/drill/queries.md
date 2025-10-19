# **ANALYTICS QUERIES**

### **Flow**

```javascript
// AnalyticsView.vue - Lifecycle
async mounted() {
  this.loading = true
  
  // 1. Load all 3 months of data
  await this.loadMonthlyData()
  
  // 2. Calculate ALL analytics upfront
  await this.calculateAnalytics()
  
  this.loading = false
  // NOW user can switch tabs instantly - no waiting
}
```

### **QUERY SET 1: GLOBAL STATISTICS (Para Header + Tab 2)**

#### **Q1.1: Total Events & Basic Stats**
```sql
-- Global overview statistics
-- Global overview statistics with explicit column specification
SELECT 
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    MIN(`magnitude`) AS min_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    MAX(`depth`) AS max_depth,
    MIN(`depth`) AS min_depth,
    '2025-07' AS month
FROM dfs.`/data/earthquakes-2025-07.json`

UNION ALL

SELECT 
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    MIN(`magnitude`) AS min_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    MAX(`depth`) AS max_depth,
    MIN(`depth`) AS min_depth,
    '2025-08' AS month
FROM dfs.`/data/earthquakes-2025-08.json`

UNION ALL

SELECT 
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    MIN(`magnitude`) AS min_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    MAX(`depth`) AS max_depth,
    MIN(`depth`) AS min_depth,
    '2025-09' AS month
FROM dfs.`/data/earthquakes-2025-09.json`;
```

**Resultado esperado:**
```
total_events | avg_magnitude | max_magnitude | avg_depth | total_countries
847          | 5.1           | 7.2           | 65.3      | 45
1002         | 5.0           | 6.8           | 68.1      | 52
998          | 5.2           | 7.8           | 62.7      | 48
```

---

#### **Q1.2: Strongest Event (For Header Display)**
```sql
-- Find the strongest earthquake across all months
-- Find the strongest earthquake across all months
SELECT 
    `id`,
    `magnitude`,
    `depth`,
    `place`,
    `time`,
    `country`['name'] AS country_name,
    `country`['region'] AS region
FROM (
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `place`,
        `time`,
        `country`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `place`,
        `time`,
        `country`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `place`,
        `time`,
        `country`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
ORDER BY `magnitude` DESC
LIMIT 1;
```

---

### **QUERY SET 2: TOP COUNTRIES (Tab 1 & Tab 2)**

#### **Q2.1: Top 20 Countries with Full Stats**
```sql
-- Top countries by earthquake count with comprehensive statistics
SELECT 
    `country`['name'] AS country_name,
    `country`['region'] AS region,
    `country`['subregion'] AS subregion,
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    MIN(`magnitude`) AS min_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    SUM(CASE WHEN `tsunami` = true THEN 1 ELSE 0 END) AS tsunami_events,
    SUM(CASE WHEN `magnitude` >= 6.0 THEN 1 ELSE 0 END) AS major_events,
    SUM(CASE WHEN `felt` IS NOT NULL THEN CAST(`felt` AS INTEGER) ELSE 0 END) AS total_felt_reports
FROM (
    SELECT 
        `magnitude`,
        `depth`,
        `tsunami`,
        `felt`,
        `country`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `tsunami`,
        `felt`,
        `country`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `tsunami`,
        `felt`,
        `country`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
WHERE `country`['name'] IS NOT NULL 
GROUP BY 
    `country`['name'],
    `country`['region'],
    `country`['subregion']
ORDER BY total_events DESC
LIMIT 20;
```

---

#### **Q2.2: All Countries List (For Dropdown)**
```sql
-- Get distinct countries for dropdown selector
SELECT DISTINCT
    `country`['name'] AS country_name,
    `country`['region'] AS region
FROM (
    SELECT `country`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT `country`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT `country`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
WHERE `country`['name'] IS NOT NULL
ORDER BY country_name ASC;
```

---

### **QUERY SET 3: COUNTRY-SPECIFIC (Tab 1)**

#### **Q3.1: All Events for Specific Country**
```sql
-- Get all earthquakes for Costa Rica
SELECT 
    `id`,
    `magnitude`,
    `depth`,
    `latitude`,
    `longitude`,
    `place`,
    `time`,
    `significance`,
    `status`,
    `felt`,
    `alert`,
    `tsunami`,
    `url`
FROM (
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `latitude`,
        `longitude`,
        `place`,
        `time`,
        `significance`,
        `status`,
        `felt`,
        `alert`,
        `tsunami`,
        `url`,
        `country`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `latitude`,
        `longitude`,
        `place`,
        `time`,
        `significance`,
        `status`,
        `felt`,
        `alert`,
        `tsunami`,
        `url`,
        `country`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `latitude`,
        `longitude`,
        `place`,
        `time`,
        `significance`,
        `status`,
        `felt`,
        `alert`,
        `tsunami`,
        `url`,
        `country`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
WHERE `country`['name'] = 'Costa Rica'
ORDER BY `time` DESC;
```

---

#### **Q3.2: Country Statistics**
```sql
-- Comprehensive statistics for Costa Rica
SELECT 
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    MIN(`magnitude`) AS min_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    MAX(`depth`) AS max_depth,
    MIN(`depth`) AS min_depth,
    SUM(CASE WHEN `magnitude` >= 5.0 THEN 1 ELSE 0 END) AS moderate_plus,
    SUM(CASE WHEN `magnitude` >= 6.0 THEN 1 ELSE 0 END) AS strong_plus,
    SUM(CASE WHEN `depth` < 70 THEN 1 ELSE 0 END) AS shallow_events,
    SUM(CASE WHEN `tsunami` = true THEN 1 ELSE 0 END) AS tsunami_events
FROM (
    SELECT 
        `magnitude`,
        `depth`,
        `tsunami`,
        `country`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `tsunami`,
        `country`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `tsunami`,
        `country`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
WHERE `country`['name'] = 'Costa Rica';
```

---

### **QUERY SET 4: MAGNITUDE DISTRIBUTION (Tab 2)**

#### **Q4.1: Magnitude Histogram Data**
```sql
-- Distribution of earthquakes by magnitude ranges
SELECT 
    CASE 
        WHEN `magnitude` >= 4.5 AND `magnitude` < 5.0 THEN '4.5-4.9'
        WHEN `magnitude` >= 5.0 AND `magnitude` < 5.5 THEN '5.0-5.4'
        WHEN `magnitude` >= 5.5 AND `magnitude` < 6.0 THEN '5.5-5.9'
        WHEN `magnitude` >= 6.0 AND `magnitude` < 6.5 THEN '6.0-6.4'
        WHEN `magnitude` >= 6.5 AND `magnitude` < 7.0 THEN '6.5-6.9'
        WHEN `magnitude` >= 7.0 THEN '7.0+'
        ELSE 'other'
    END AS magnitude_range,
    COUNT(*) AS event_count,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    ROUND(AVG(`significance`), 0) AS avg_significance
FROM (
    SELECT 
        `magnitude`,
        `depth`,
        `significance`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `significance`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `significance`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
GROUP BY 
    CASE 
        WHEN `magnitude` >= 4.5 AND `magnitude` < 5.0 THEN '4.5-4.9'
        WHEN `magnitude` >= 5.0 AND `magnitude` < 5.5 THEN '5.0-5.4'
        WHEN `magnitude` >= 5.5 AND `magnitude` < 6.0 THEN '5.5-5.9'
        WHEN `magnitude` >= 6.0 AND `magnitude` < 6.5 THEN '6.0-6.4'
        WHEN `magnitude` >= 6.5 AND `magnitude` < 7.0 THEN '6.5-6.9'
        WHEN `magnitude` >= 7.0 THEN '7.0+'
        ELSE 'other'
    END
ORDER BY magnitude_range ASC;
```

---

### **QUERY SET 5: TIMELINE DATA (Tab 2)**

#### **Q5.1: Daily Event Count**
```sql
-- Events per day for timeline chart
SELECT 
    CAST(`time` AS DATE) AS event_date,
    COUNT(*) AS event_count,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude
FROM (
    SELECT 
        `time`,
        `magnitude`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `time`,
        `magnitude`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `time`,
        `magnitude`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
GROUP BY CAST(`time` AS DATE)
ORDER BY event_date ASC;
```

---

### **QUERY SET 6: SIGNIFICANT EVENTS (Tab 3)**

#### **Q6.1: All Significant Events**
```sql
-- Events meeting significance criteria
SELECT 
    `id`,
    `magnitude`,
    `depth`,
    `place`,
    `time`,
    `country`['name'] AS country_name,
    `country`['region'] AS region,
    `significance`,
    `felt`,
    `alert`,
    `tsunami`,
    `status`,
    `url`,
    CASE 
        WHEN `magnitude` >= 7.0 THEN 'major'
        WHEN `magnitude` >= 6.0 THEN 'strong'
        WHEN `alert` IN ('orange', 'red') THEN 'alert'
        WHEN `tsunami` = true THEN 'tsunami'
        WHEN `felt` > 100 THEN 'widely_felt'
        ELSE 'other'
    END AS significance_category
FROM (
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `place`,
        `time`,
        `significance`,
        `felt`,
        `alert`,
        `tsunami`,
        `status`,
        `url`,
        `country`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `place`,
        `time`,
        `significance`,
        `felt`,
        `alert`,
        `tsunami`,
        `status`,
        `url`,
        `country`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `id`,
        `magnitude`,
        `depth`,
        `place`,
        `time`,
        `significance`,
        `felt`,
        `alert`,
        `tsunami`,
        `status`,
        `url`,
        `country`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
WHERE 
    `magnitude` >= 6.0 
    OR `alert` IN ('orange', 'red')
    OR `tsunami` = true
    OR `felt` > 100
ORDER BY `magnitude` DESC, `time` DESC;
```

---

### **QUERY SET 7: DEPTH ANALYSIS (Tab 4 - Advanced)**

#### **Q7.1: Depth vs Magnitude Scatter Data**
```sql
-- Scatter plot data: depth vs magnitude
SELECT 
    `magnitude`,
    `depth`,
    CASE 
        WHEN `depth` < 70 THEN 'shallow'
        WHEN `depth` >= 70 AND `depth` < 300 THEN 'intermediate'
        ELSE 'deep'
    END AS depth_category,
    `significance`,
    `country`['name'] AS country_name
FROM (
    SELECT 
        `magnitude`,
        `depth`,
        `significance`,
        `country`
    FROM dfs.`/data/earthquakes-2025-07.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `significance`,
        `country`
    FROM dfs.`/data/earthquakes-2025-08.json`
    
    UNION ALL
    
    SELECT 
        `magnitude`,
        `depth`,
        `significance`,
        `country`
    FROM dfs.`/data/earthquakes-2025-09.json`
) AS all_events
WHERE `depth` IS NOT NULL AND `magnitude` IS NOT NULL
LIMIT 1000;
```

---

### **QUERY SET 8: MONTHLY COMPARISON (Tab 2)**

#### **Q8.1: Month-by-Month Statistics**
```sql
-- Compare statistics across the 3 months
SELECT 
    '2025-07' AS month,
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    SUM(CASE WHEN `magnitude` >= 6.0 THEN 1 ELSE 0 END) AS major_events
FROM dfs.`/data/earthquakes-2025-07.json`

UNION ALL

SELECT 
    '2025-08' AS month,
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    SUM(CASE WHEN `magnitude` >= 6.0 THEN 1 ELSE 0 END) AS major_events
FROM dfs.`/data/earthquakes-2025-08.json`

UNION ALL

SELECT 
    '2025-09' AS month,
    COUNT(*) AS total_events,
    ROUND(AVG(`magnitude`), 2) AS avg_magnitude,
    MAX(`magnitude`) AS max_magnitude,
    ROUND(AVG(`depth`), 1) AS avg_depth,
    SUM(CASE WHEN `magnitude` >= 6.0 THEN 1 ELSE 0 END) AS major_events
FROM dfs.`/data/earthquakes-2025-09.json`

ORDER BY month ASC;
```

---

## **🔧 APACHE DRILL BEST PRACTICES APLICADAS:**

### ✅ **Backticks para columnas reservadas**
```sql
`time`, `depth`, `country`.`name`
```

### ✅ **Explicit table aliases en UNION**
```sql
FROM (...) AS `all_events`
```

### ✅ **Type casting para fechas**
```sql
TO_DATE(`time`, 'yyyy-MM-dd')
TO_TIMESTAMP(`time`, 'yyyy-MM-dd''T''HH:mi:ss.SSS''Z''')
```

### ✅ **Nested field access**
```sql
`country`.`name`, `elevation`.`value`
```

### ✅ **NULL handling**
```sql
WHERE `country`.`name` IS NOT NULL AND `country`.`name` != ''
```

### ✅ **Performance considerations**
```sql
LIMIT 1000  -- Para queries de scatter plots grandes
ORDER BY RAND() LIMIT 1000  -- Para sampling
```
