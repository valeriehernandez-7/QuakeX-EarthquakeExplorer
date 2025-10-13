# 🛢️ Apache Drill - QuakeX Integration

Apache Drill is integrated into QuakeX to provide SQL-on-JSON querying capabilities for earthquake data analysis.

## 📋 Start Drill

```powershell
docker-compose up -d
Start-Sleep -Seconds 40
Start-Process "http://localhost:8047"
docker logs -f quakex-drill
```

---

## 🔧 Configuration

### Docker Compose
- **Image**: `apache/drill:latest-openjdk-11`
- **Container**: `quakex-drill`
- **Web UI Port**: 8047
- **JDBC Port**: 31010
- **Data Volume**: `./data` mounted to `/data`

### Memory Settings
- **Heap**: 1GB (configurable via `DRILL_HEAP`)
- **Direct Memory**: 2GB (configurable via `DRILL_MAX_DIRECT_MEMORY`)

### Health Check
- Checks Web UI every 30 seconds
- 90-second startup grace period
- 3 retries before marking unhealthy

---

## 📂 Storage Plugin Setup

### First-Time Configuration

1. **Open Web UI**: http://localhost:8047
2. **Go to Storage tab**
3. **Update `dfs` plugin**
4. **Add `quakex` workspace**:

```json
{
    "type": "file",
    "connection": "file:///",
    "workspaces": {
        "quakex": {
            "location": "/data",
            "writable": true,
            "defaultInputFormat": "json",
            "allowAccessOutsideWorkspace": false
        },
        "tmp": {
            "location": "/tmp",
            "writable": true,
            "defaultInputFormat": null,
            "allowAccessOutsideWorkspace": false
        },
        "root": {
            "location": "/",
            "writable": false,
            "defaultInputFormat": null,
            "allowAccessOutsideWorkspace": false
        }
    },
    "formats": {
        "parquet": {
            "type": "parquet"
        },
        "json": {
            "type": "json",
            "extensions": [
                "json"
            ]
        },
        "sequencefile": {
            "type": "sequencefile",
            "extensions": [
                "seq"
            ]
        },
        "csvh": {
            "type": "text",
            "extensions": [
                "csvh"
            ],
            "lineDelimiter": "\n",
            "fieldDelimiter": ",",
            "quote": "\"",
            "escape": "\"",
            "comment": "#",
            "extractHeader": true
        },
        "psv": {
            "type": "text",
            "extensions": [
                "tbl"
            ],
            "lineDelimiter": "\n",
            "fieldDelimiter": "|",
            "quote": "\"",
            "escape": "\"",
            "comment": "#"
        },
        "avro": {
            "type": "avro",
            "extensions": [
                "avro"
            ]
        },
        "tsv": {
            "type": "text",
            "extensions": [
                "tsv"
            ],
            "lineDelimiter": "\n",
            "fieldDelimiter": "\t",
            "quote": "\"",
            "escape": "\"",
            "comment": "#"
        },
        "csv": {
            "type": "text",
            "extensions": [
                "csv"
            ],
            "lineDelimiter": "\n",
            "fieldDelimiter": ",",
            "quote": "\"",
            "escape": "\"",
            "comment": "#"
        },
        "delta": {
            "type": "delta",
            "version": null,
            "timestamp": null
        },
        "httpd": {
            "type": "httpd",
            "extensions": [
                "httpd"
            ],
            "logFormat": "common\ncombined"
        },
        "pcap": {
            "type": "pcap",
            "extensions": [
                "pcap",
                "pcapng"
            ]
        },
        "sas": {
            "type": "sas",
            "extensions": [
                "sas7bdat"
            ]
        },
        "excel": {
            "type": "excel",
            "extensions": [
                "xlsx"
            ],
            "lastRow": 1048576,
            "ignoreErrors": true,
            "maxArraySize": -1,
            "thresholdBytesForTempFiles": -1
        },
        "syslog": {
            "type": "syslog",
            "extensions": [
                "syslog"
            ],
            "maxErrors": 10
        },
        "shp": {
            "type": "shp",
            "extensions": [
                "shp"
            ]
        },
        "iceberg": {
            "type": "iceberg",
            "properties": null,
            "caseSensitive": null,
            "includeColumnStats": null,
            "ignoreResiduals": null,
            "snapshotId": null,
            "snapshotAsOfTime": null,
            "fromSnapshotId": null,
            "toSnapshotId": null
        },
        "ltsv": {
            "type": "ltsv",
            "extensions": [
                "ltsv"
            ],
            "parseMode": "lenient",
            "escapeCharacter": null,
            "kvDelimiter": null,
            "entryDelimiter": null,
            "lineEnding": null,
            "quoteChar": null
        },
        "image": {
            "type": "image",
            "extensions": [
                "jpg",
                "jpeg",
                "jpe",
                "tif",
                "tiff",
                "dng",
                "psd",
                "png",
                "bmp",
                "gif",
                "ico",
                "pcx",
                "wav",
                "wave",
                "avi",
                "webp",
                "mov",
                "mp4",
                "m4a",
                "m4p",
                "m4b",
                "m4r",
                "m4v",
                "3gp",
                "3g2",
                "eps",
                "epsf",
                "epsi",
                "ai",
                "arw",
                "crw",
                "cr2",
                "nef",
                "orf",
                "raf",
                "rw2",
                "rwl",
                "srw",
                "x3f"
            ],
            "fileSystemMetadata": true,
            "descriptive": true
        },
        "spss": {
            "type": "spss",
            "extensions": [
                "sav"
            ]
        },
        "xml": {
            "type": "xml",
            "extensions": [
                "xml"
            ],
            "dataLevel": 1,
            "allTextMode": true
        },
        "pdf": {
            "type": "pdf",
            "extensions": [
                "pdf"
            ],
            "extractHeaders": true,
            "extractionAlgorithm": "basic"
        },
        "msaccess": {
            "type": "msaccess",
            "extensions": [
                "mdb",
                "accdb"
            ]
        },
        "hdf5": {
            "type": "hdf5",
            "extensions": [
                "h5"
            ],
            "defaultPath": null
        }
    },
    "authMode": "SHARED_USER",
    "enabled": true
}
```

5. **Click Update**

### Verify Setup

```sql
-- Show available schemas
SHOW SCHEMAS;

-- Should show: dfs.quakex, dfs.tmp, dfs.root, cp, sys, INFORMATION_SCHEMA
```

```sql
SELECT * FROM dfs.quakex.`sample-earthquakes.json`;
```

---

## 🐛 Troubleshooting

### Container Won't Start

**Check Docker is running:**
```powershell
docker version
```

**View logs:**
```powershell
docker logs quakex-drill
```

**Check port availability:**
```powershell
netstat -ano | findstr "8047"
```

### Web UI Not Accessible

**Wait longer** - Drill takes 60-90 seconds to fully start

**Check health:**
```powershell
docker inspect --format='{{.State.Health.Status}}' quakex-drill
```

**Manually test:**
```powershell
curl http://localhost:8047
```

### Query Errors

**Workspace not found:**
- Go to Storage tab
- Verify `dfs.quakex` workspace exists
- Check location is `/data`

**File not found:**
- Verify file exists: `ls ./data`
- Use exact filename in query with backticks
- Example: `` SELECT * FROM dfs.quakex.`sample-earthquakes.json` ``

**Permission denied:**
```powershell
# On Windows, ensure data folder has proper permissions
icacls ./data /grant Everyone:F
```

### Performance Issues

**Increase memory:**
```yaml
environment:
  - DRILL_HEAP=2G
  - DRILL_MAX_DIRECT_MEMORY=4G
```

**Limit query results:**
```sql
SELECT * FROM dfs.quakex.`sample-earthquakes.json` LIMIT 100;
```

---

## 📊 Integration with Vue App

### REST API Endpoint

```javascript
// POST http://localhost:8047/query.json
{
  "queryType": "SQL",
  "query": "SELECT * FROM dfs.quakex.`sample-earthquakes.json` LIMIT 10"
}
```

### Example Service Implementation

See `src/services/drillService.js` for full implementation.

```javascript
import axios from 'axios'

const DRILL_API_URL = 'http://localhost:8047'

export async function executeQuery(sqlQuery) {
  const response = await axios.post(
    `${DRILL_API_URL}/query.json`,
    { queryType: 'SQL', query: sqlQuery }
  )
  return response.data.rows
}
```

---

## 📈 Performance Tips

### Query Optimization

1. **Use LIMIT** for large datasets
2. **Filter early** - push predicates down
3. **Select specific columns** instead of `SELECT *`
4. **Index on frequently filtered fields** (if supported)

### Memory Tuning

| Use Case | Heap | Direct Memory |
|----------|------|---------------|
| Development | 512M | 1G |
| Testing | 1G | 2G |
| Production | 4G | 8G |

### Data Management

- Keep JSON files reasonably sized (<100MB)
- Split large datasets into multiple files
- Use partitioning by date if possible

---

## 🔗 Useful Links

- **Apache Drill Docs**: https://drill.apache.org/docs/
- **SQL Reference**: https://drill.apache.org/docs/sql-reference/
- **REST API**: https://drill.apache.org/docs/rest-api/
- **Docker Hub**: https://hub.docker.com/r/apache/drill

---

## 📝 Notes

- Drill runs in **embedded mode** (single-node)
- Data persists in `./data` folder
- Configuration saved in Docker volume
- Automatic restart on system reboot (unless stopped manually)

---

**Last Updated**: October 2025  
**Drill Version**: 1.22.0  
**Docker Image**: apache/drill:latest-openjdk-11
