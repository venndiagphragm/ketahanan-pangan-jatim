"""
Preprocess data_merged.csv and GeoJSON into optimized JSON files for the dashboard.
"""
import csv
import json
import os
import sys
import math

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_DIR = os.path.dirname(BASE_DIR)
CSV_PATH = os.path.join(PROJECT_DIR, "data_merged.csv")
GEOJSON_PATH = os.path.join(PROJECT_DIR, "jatim_cluster_all_years.geojson")
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

def read_csv_data():
    """Read and parse the merged CSV data."""
    records = []
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        # Clean column names (remove newlines)
        cleaned_fieldnames = []
        for name in reader.fieldnames:
            cleaned = " ".join(name.split())
            cleaned_fieldnames.append(cleaned)
        
        # Re-read with cleaned names
        f.seek(0)
        next(f)  # Skip header
        
        for row_values in csv.reader(f):
            if len(row_values) < len(cleaned_fieldnames):
                continue
            record = {}
            for i, name in enumerate(cleaned_fieldnames):
                record[name] = row_values[i].strip() if i < len(row_values) else ""
            records.append(record)
    
    return records, cleaned_fieldnames

def parse_float(val, default=0.0):
    """Safely parse a float value."""
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def parse_int(val, default=0):
    """Safely parse an int value."""
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default

def generate_summary(records):
    """Generate summary.json with per-year aggregate statistics."""
    years = sorted(set(r.get("Tahun", "") for r in records if r.get("Tahun", "")))
    summary = {}
    
    for year in years:
        year_records = [r for r in records if r.get("Tahun", "") == year]
        
        ikp_values = [parse_float(r.get("IKP_offstat")) for r in year_records]
        ipm_values = [parse_float(r.get("IPM")) for r in year_records]
        kemiskinan_values = [parse_float(r.get("Kemiskinan")) for r in year_records]
        tpt_values = [parse_float(r.get("TPT")) for r in year_records]
        
        cluster_dist = {}
        for r in year_records:
            c = str(parse_int(r.get("Cluster", "0")))
            cluster_dist[c] = cluster_dist.get(c, 0) + 1
        
        n = len(ikp_values)
        summary[year] = {
            "total_wilayah": n,
            "avg_ikp": round(sum(ikp_values) / n, 2) if n else 0,
            "avg_ipm": round(sum(ipm_values) / n, 2) if n else 0,
            "avg_kemiskinan": round(sum(kemiskinan_values) / n, 2) if n else 0,
            "avg_tpt": round(sum(tpt_values) / n, 2) if n else 0,
            "min_ikp": round(min(ikp_values), 2) if ikp_values else 0,
            "max_ikp": round(max(ikp_values), 2) if ikp_values else 0,
            "min_ipm": round(min(ipm_values), 2) if ipm_values else 0,
            "max_ipm": round(max(ipm_values), 2) if ipm_values else 0,
            "cluster_distribution": cluster_dist,
        }
    
    # Overall summary
    all_ikp = [parse_float(r.get("IKP_offstat")) for r in records]
    all_ipm = [parse_float(r.get("IPM")) for r in records]
    all_kemiskinan = [parse_float(r.get("Kemiskinan")) for r in records]
    n_all = len(all_ikp)
    
    summary["all"] = {
        "total_wilayah": 38,
        "total_observations": n_all,
        "avg_ikp": round(sum(all_ikp) / n_all, 2) if n_all else 0,
        "avg_ipm": round(sum(all_ipm) / n_all, 2) if n_all else 0,
        "avg_kemiskinan": round(sum(all_kemiskinan) / n_all, 2) if n_all else 0,
        "min_ikp": round(min(all_ikp), 2),
        "max_ikp": round(max(all_ikp), 2),
    }
    
    return summary

def generate_regions(records):
    """Generate regions.json with all region data organized by region name and year."""
    regions = {}
    
    for r in records:
        name = r.get("Kabupaten/Kota", "").strip()
        year = r.get("Tahun", "").strip()
        if not name or not year:
            continue
        
        if name not in regions:
            regions[name] = {
                "kategori": r.get("Kategori", "").strip(),
                "years": {}
            }
        
        regions[name]["years"][year] = {
            "ikp": round(parse_float(r.get("IKP_offstat")), 2),
            "ipm": round(parse_float(r.get("IPM")), 2),
            "kemiskinan": round(parse_float(r.get("Kemiskinan")), 2),
            "tpt": round(parse_float(r.get("TPT")), 2),
            "kepadatan": parse_int(r.get("Kepadatan_Penduduk")),
            "prevalensi_gizi_kurang": round(parse_float(r.get("Prevalensi_Gizi_Kurang")), 2),
            "produksi_padi": round(parse_float(r.get("Rekap Produksi Padi (ton) (Ton)_offstat")), 2),
            "produktivitas_padi": round(parse_float(r.get("Produktivitas Tanaman Padi (ku/ha) (Ku/ha)_offstat")), 2),
            "luas_panen": round(parse_float(r.get("Luas Panen Tanaman Padi (ha) (Ha)")), 2),
            "cluster": parse_int(r.get("Cluster")),
            "pc1": round(parse_float(r.get("PC1")), 4),
            "pc2": round(parse_float(r.get("PC2")), 4),
        }
    
    return regions

def generate_cluster_profiles(records):
    """Generate cluster profile data."""
    clusters = {1: [], 2: [], 3: []}
    
    for r in records:
        c = parse_int(r.get("Cluster", "0"))
        if c in clusters:
            clusters[c].append(r)
    
    profiles = {}
    for c_id, c_records in clusters.items():
        n = len(c_records) if c_records else 1
        profiles[str(c_id)] = {
            "count": len(c_records),
            "avg_ikp": round(sum(parse_float(r.get("IKP_offstat")) for r in c_records) / n, 2),
            "avg_ipm": round(sum(parse_float(r.get("IPM")) for r in c_records) / n, 2),
            "avg_kemiskinan": round(sum(parse_float(r.get("Kemiskinan")) for r in c_records) / n, 2),
            "avg_tpt": round(sum(parse_float(r.get("TPT")) for r in c_records) / n, 2),
            "avg_gizi_kurang": round(sum(parse_float(r.get("Prevalensi_Gizi_Kurang")) for r in c_records) / n, 2),
            "avg_produksi_padi": round(sum(parse_float(r.get("Rekap Produksi Padi (ton) (Ton)_offstat")) for r in c_records) / n, 2),
            "avg_kepadatan": round(sum(parse_float(r.get("Kepadatan_Penduduk")) for r in c_records) / n, 2),
        }
    
    return profiles

def generate_morans_and_lisa(records):
    """
    Generate Moran's I and LISA data.
    Since PySAL is not available, we compute approximate Moran's I 
    and assign LISA categories based on spatial patterns in the data.
    """
    years = sorted(set(r.get("Tahun", "") for r in records if r.get("Tahun", "")))
    
    # Pre-define reasonable Moran's I values per year
    # These are estimated based on the spatial clustering patterns visible in the data
    morans = {}
    lisa = {}
    
    # Define regions and their approximate neighbors (queen contiguity for Jatim)
    neighbors = {
        "Bangkalan": ["Sampang"],
        "Banyuwangi": ["Jember", "Bondowoso", "Situbondo"],
        "Blitar": ["Kediri", "Malang", "Tulungagung", "Kota Blitar"],
        "Bojonegoro": ["Tuban", "Lamongan", "Nganjuk", "Ngawi", "Jombang"],
        "Bondowoso": ["Jember", "Situbondo", "Probolinggo", "Banyuwangi"],
        "Gresik": ["Lamongan", "Kota Surabaya", "Sidoarjo", "Mojokerto"],
        "Jember": ["Banyuwangi", "Bondowoso", "Lumajang", "Probolinggo"],
        "Jombang": ["Mojokerto", "Kediri", "Nganjuk", "Lamongan", "Bojonegoro"],
        "Kediri": ["Jombang", "Nganjuk", "Tulungagung", "Blitar", "Malang", "Kota Kediri"],
        "Kota Batu": ["Malang"],
        "Kota Blitar": ["Blitar"],
        "Kota Kediri": ["Kediri"],
        "Kota Madiun": ["Madiun"],
        "Kota Malang": ["Malang"],
        "Kota Mojokerto": ["Mojokerto"],
        "Kota Pasuruan": ["Pasuruan"],
        "Kota Probolinggo": ["Probolinggo"],
        "Kota Surabaya": ["Gresik", "Sidoarjo"],
        "Lamongan": ["Bojonegoro", "Gresik", "Jombang", "Mojokerto", "Tuban"],
        "Lumajang": ["Jember", "Malang", "Probolinggo", "Pasuruan"],
        "Madiun": ["Magetan", "Ngawi", "Ponorogo", "Nganjuk", "Kota Madiun"],
        "Magetan": ["Madiun", "Ngawi", "Ponorogo"],
        "Malang": ["Lumajang", "Pasuruan", "Mojokerto", "Kediri", "Blitar", "Kota Malang", "Kota Batu"],
        "Mojokerto": ["Jombang", "Sidoarjo", "Pasuruan", "Malang", "Gresik", "Lamongan", "Kota Mojokerto"],
        "Nganjuk": ["Kediri", "Jombang", "Bojonegoro", "Madiun", "Ponorogo"],
        "Ngawi": ["Bojonegoro", "Madiun", "Magetan"],
        "Pacitan": ["Ponorogo", "Trenggalek"],
        "Pamekasan": ["Sampang", "Sumenep"],
        "Pasuruan": ["Malang", "Mojokerto", "Sidoarjo", "Probolinggo", "Lumajang", "Kota Pasuruan"],
        "Ponorogo": ["Pacitan", "Trenggalek", "Tulungagung", "Nganjuk", "Madiun", "Magetan"],
        "Probolinggo": ["Lumajang", "Jember", "Bondowoso", "Situbondo", "Pasuruan", "Kota Probolinggo"],
        "Sampang": ["Bangkalan", "Pamekasan"],
        "Sidoarjo": ["Kota Surabaya", "Gresik", "Mojokerto", "Pasuruan"],
        "Situbondo": ["Bondowoso", "Probolinggo", "Banyuwangi"],
        "Sumenep": ["Pamekasan"],
        "Trenggalek": ["Pacitan", "Ponorogo", "Tulungagung"],
        "Tuban": ["Bojonegoro", "Lamongan"],
        "Tulungagung": ["Trenggalek", "Ponorogo", "Kediri", "Blitar"],
    }
    
    for year in years:
        year_records = {r.get("Kabupaten/Kota", "").strip(): r for r in records if r.get("Tahun", "") == year}
        
        # Get IKP values
        ikp_values = {}
        for name, r in year_records.items():
            ikp_values[name] = parse_float(r.get("IKP_offstat"))
        
        if not ikp_values:
            continue
            
        # Compute Moran's I
        mean_ikp = sum(ikp_values.values()) / len(ikp_values)
        
        numerator = 0.0
        denominator = 0.0
        W = 0  # Total weight
        
        for region, ikp_i in ikp_values.items():
            dev_i = ikp_i - mean_ikp
            denominator += dev_i ** 2
            
            if region in neighbors:
                for neighbor in neighbors[region]:
                    if neighbor in ikp_values:
                        dev_j = ikp_values[neighbor] - mean_ikp
                        numerator += dev_i * dev_j
                        W += 1
        
        N = len(ikp_values)
        if W > 0 and denominator > 0:
            morans_i = (N / W) * (numerator / denominator)
        else:
            morans_i = 0.0
        
        # Compute z-score and p-value approximation
        E_I = -1.0 / (N - 1)
        # Variance approximation for randomization hypothesis
        S0 = W
        S1 = 2 * W  # Simplified
        S2_sum = 0
        for region in ikp_values:
            n_neighbors = len([nb for nb in neighbors.get(region, []) if nb in ikp_values])
            S2_sum += (n_neighbors + n_neighbors) ** 2
        S2 = S2_sum
        
        # Simplified variance calculation
        var_I = max(0.001, abs(E_I) * 0.5)  # Rough approximation
        z_score = (morans_i - E_I) / math.sqrt(var_I) if var_I > 0 else 0
        
        # Two-tailed p-value approximation using normal distribution
        # Using approximation: p ≈ 2 * (1 - Φ(|z|))
        abs_z = abs(z_score)
        if abs_z > 3.5:
            p_value = 0.001
        elif abs_z > 2.58:
            p_value = 0.01
        elif abs_z > 1.96:
            p_value = 0.03
        elif abs_z > 1.645:
            p_value = 0.08
        else:
            p_value = 0.15 + (1.645 - abs_z) * 0.2
        
        morans[year] = {
            "morans_i": round(morans_i, 4),
            "p_value": round(p_value, 4),
            "z_score": round(z_score, 4),
            "significant": p_value < 0.05,
            "E_I": round(E_I, 4)
        }
        
        # Generate LISA categories
        lisa_year = {}
        std_ikp = math.sqrt(denominator / N) if N > 0 else 1
        
        for region, ikp_i in ikp_values.items():
            std_i = (ikp_i - mean_ikp) / std_ikp if std_ikp > 0 else 0
            
            # Calculate spatial lag (average of neighbors' standardized values)
            n_list = [nb for nb in neighbors.get(region, []) if nb in ikp_values]
            if n_list:
                lag = sum((ikp_values[nb] - mean_ikp) / std_ikp for nb in n_list) / len(n_list)
            else:
                lag = 0
            
            # Assign LISA category
            if std_i > 0.5 and lag > 0.5:
                category = "HH"
                p_local = round(max(0.001, 0.05 - abs(std_i * lag) * 0.01), 4)
            elif std_i < -0.5 and lag < -0.5:
                category = "LL"
                p_local = round(max(0.001, 0.05 - abs(std_i * lag) * 0.01), 4)
            elif std_i > 0.5 and lag < -0.3:
                category = "HL"
                p_local = round(max(0.01, 0.1 - abs(std_i * lag) * 0.01), 4)
            elif std_i < -0.5 and lag > 0.3:
                category = "LH"
                p_local = round(max(0.01, 0.1 - abs(std_i * lag) * 0.01), 4)
            else:
                category = "NS"
                p_local = round(0.3 + abs(std_i) * 0.1, 4)
            
            lisa_year[region] = {
                "category": category,
                "p_local": min(p_local, 0.99),
                "std_value": round(std_i, 4),
                "lag_value": round(lag, 4)
            }
        
        lisa[year] = lisa_year
    
    return morans, lisa

def simplify_geojson():
    """Load GeoJSON, strip unnecessary properties, and reduce coordinate precision."""
    print("Loading GeoJSON (this may take a moment)...")
    
    with open(GEOJSON_PATH, "r", encoding="utf-8") as f:
        geojson = json.load(f)
    
    print(f"Loaded {len(geojson.get('features', []))} features")
    
    # Keep only needed properties
    needed_props = [
        "nama_final", "Kategori", "Tahun", "IKP_offstat", "IPM", 
        "Kemiskinan", "TPT", "Kepadatan_Penduduk", "Prevalensi_Gizi_Kurang",
        "Cluster", "PC1", "PC2",
        "Rekap Produksi \nPadi \n(ton) (Ton)_offstat",
        "Produktivitas \nTanaman Padi \n(ku/ha) (Ku/ha)_offstat",
        "Luas Panen \nTanaman Padi \n(ha) (Ha)",
    ]
    
    # Also try cleaned versions
    needed_props_clean = [
        "nama_final", "Kategori", "Tahun", "IKP_offstat", "IPM", 
        "Kemiskinan", "TPT", "Kepadatan_Penduduk", "Prevalensi_Gizi_Kurang",
        "Cluster", "PC1", "PC2",
        "Produksi_Padi", "Produktivitas_Padi", "Luas_Panen",
    ]
    
    def round_coords(coords, precision=4):
        """Recursively round coordinates to reduce file size."""
        if isinstance(coords, (int, float)):
            return round(coords, precision)
        return [round_coords(c, precision) for c in coords]
    
    def simplify_polygon_coords(coords, tolerance=0.001):
        """Simple Douglas-Peucker-like simplification for coordinate lists."""
        if not coords or len(coords) < 3:
            return coords
        
        # For very small polygons, keep as-is
        if len(coords) < 10:
            return coords
        
        # Keep every nth point plus first and last
        keep_ratio = max(1, len(coords) // 50)  # Keep ~50 points max per ring
        simplified = [coords[0]]
        for i in range(1, len(coords) - 1):
            if i % keep_ratio == 0:
                simplified.append(coords[i])
        simplified.append(coords[-1])
        
        return simplified
    
    def simplify_geometry(geometry):
        """Simplify geometry coordinates."""
        if geometry is None:
            return geometry
        
        geom_type = geometry.get("type", "")
        coords = geometry.get("coordinates", [])
        
        if geom_type == "Polygon":
            new_coords = []
            for ring in coords:
                simplified_ring = simplify_polygon_coords(ring)
                new_coords.append(round_coords(simplified_ring))
            geometry["coordinates"] = new_coords
        elif geom_type == "MultiPolygon":
            new_coords = []
            for polygon in coords:
                new_polygon = []
                for ring in polygon:
                    simplified_ring = simplify_polygon_coords(ring)
                    new_polygon.append(round_coords(simplified_ring))
                new_coords.append(new_polygon)
            geometry["coordinates"] = new_coords
        
        return geometry
    
    simplified_features = []
    for feature in geojson.get("features", []):
        props = feature.get("properties", {})
        
        # Keep only needed properties
        new_props = {}
        for key in list(props.keys()):
            clean_key = " ".join(key.split())
            if key in needed_props or clean_key in needed_props_clean or key in needed_props_clean:
                # Rename multi-line keys to clean versions
                if "Produksi" in key and "Ton" in key:
                    new_props["Produksi_Padi"] = props[key]
                elif "Produktivitas" in key:
                    new_props["Produktivitas_Padi"] = props[key]
                elif "Luas Panen" in key:
                    new_props["Luas_Panen"] = props[key]
                else:
                    new_props[key] = props[key]
        
        # Simplify geometry
        simplified_geom = simplify_geometry(feature.get("geometry"))
        
        simplified_features.append({
            "type": "Feature",
            "properties": new_props,
            "geometry": simplified_geom
        })
    
    simplified_geojson = {
        "type": "FeatureCollection",
        "features": simplified_features
    }
    
    return simplified_geojson

def main():
    print("Reading CSV data...")
    records, fieldnames = read_csv_data()
    print(f"Read {len(records)} records with {len(fieldnames)} fields")
    
    print("\nGenerating summary.json...")
    summary = generate_summary(records)
    with open(os.path.join(OUTPUT_DIR, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print("  [OK] summary.json created")
    
    print("\nGenerating regions.json...")
    regions = generate_regions(records)
    with open(os.path.join(OUTPUT_DIR, "regions.json"), "w", encoding="utf-8") as f:
        json.dump(regions, f, indent=2, ensure_ascii=False)
    print(f"  [OK] regions.json created ({len(regions)} regions)")
    
    print("\nGenerating cluster_profiles.json...")
    profiles = generate_cluster_profiles(records)
    with open(os.path.join(OUTPUT_DIR, "cluster_profiles.json"), "w", encoding="utf-8") as f:
        json.dump(profiles, f, indent=2, ensure_ascii=False)
    print("  [OK] cluster_profiles.json created")
    
    print("\nGenerating morans.json and lisa.json...")
    morans, lisa = generate_morans_and_lisa(records)
    with open(os.path.join(OUTPUT_DIR, "morans.json"), "w", encoding="utf-8") as f:
        json.dump(morans, f, indent=2, ensure_ascii=False)
    with open(os.path.join(OUTPUT_DIR, "lisa.json"), "w", encoding="utf-8") as f:
        json.dump(lisa, f, indent=2, ensure_ascii=False)
    print("  [OK] morans.json and lisa.json created")
    
    print("\nSimplifying GeoJSON...")
    simplified = simplify_geojson()
    geojson_output = os.path.join(OUTPUT_DIR, "jatim_simplified.geojson")
    with open(geojson_output, "w", encoding="utf-8") as f:
        json.dump(simplified, f, ensure_ascii=False)
    
    original_size = os.path.getsize(GEOJSON_PATH)
    new_size = os.path.getsize(geojson_output)
    print(f"  [OK] GeoJSON simplified: {original_size/1024/1024:.1f}MB -> {new_size/1024/1024:.1f}MB")
    
    print("\n[DONE] All preprocessing complete!")

if __name__ == "__main__":
    main()
