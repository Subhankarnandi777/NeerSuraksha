import csv
import uuid
from app.db.session import SessionLocal
from app.models.water_source import WaterSource
from app.models.health_report import HealthCase
import os

def run():
    db = SessionLocal()
    stations = {}
    csv_path = r'c:\NeerSurakhsha\82d41fe2-ef41-4dbd-8ee2-4323bf22c554.csv'
    
    if not os.path.exists(csv_path):
        print("CSV not found")
        return

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            station_name = row.get('Station')
            if not station_name: continue
            
            if station_name not in stations:
                try:
                    lat = float(row['Latitude'])
                    lng = float(row['Longitude'])
                    stations[station_name] = (lat, lng)
                except (ValueError, KeyError):
                    pass

    print(f"Found {len(stations)} unique stations")
    
    added_count = 0
    for name, (lat, lng) in stations.items():
        existing = db.query(WaterSource).filter(WaterSource.name == name).first()
        if not existing:
            source = WaterSource(
                id=str(uuid.uuid4()),
                name=name,
                type='TUBE_WELL',
                status='SAFE',
                lat=lat,
                lng=lng,
                householdsUsing=50
            )
            db.add(source)
            added_count += 1
            
    db.commit()
    db.close()
    print(f"Added {added_count} new sources to the database.")

if __name__ == "__main__":
    run()
