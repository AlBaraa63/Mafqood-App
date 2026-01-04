import sqlite3
import sys
from pathlib import Path

db_path = Path("mafqood.db")
if not db_path.exists():
    print("❌ Database not found")
    sys.exit(1)

db = sqlite3.connect(str(db_path))
c = db.cursor()

# Delete items with invalid ACTIVE status
c.execute("DELETE FROM items WHERE status = 'ACTIVE'")
deleted = c.rowcount
db.commit()

if deleted > 0:
    print(f"✓ Cleaned up {deleted} invalid items")
    
c.execute("SELECT COUNT(*) FROM items")
count = c.fetchone()[0]
print(f"✓ Items remaining: {count}")

db.close()
