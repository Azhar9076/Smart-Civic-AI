import math
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS


def compute_sha256_hash(file_path: str) -> str:
    """Generate deterministic SHA-256 cryptographic checksum of media file."""
    sha256 = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            while chunk := f.read(65536):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception:
        # Fallback for mock/virtual paths
        return hashlib.sha256(f"virtual_evidence_{file_path}".encode('utf-8')).hexdigest()


def _convert_to_degrees(value: Tuple[Any, Any, Any]) -> float:
    """Convert EXIF GPS rational tuple (degrees, minutes, seconds) to decimal float."""
    try:
        def _to_float(v):
            if hasattr(v, 'numerator') and hasattr(v, 'denominator'):
                return float(v.numerator) / float(v.denominator) if v.denominator != 0 else 0.0
            if isinstance(v, (int, float)):
                return float(v)
            if isinstance(v, tuple) and len(v) == 2:
                return float(v[0]) / float(v[1]) if v[1] != 0 else 0.0
            return float(v)

        d = _to_float(value[0])
        m = _to_float(value[1])
        s = _to_float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception:
        return 0.0


def extract_forensic_exif(file_path: str) -> Dict[str, Any]:
    """Extract and parse comprehensive EXIF metadata including GPS coordinates,
    timestamps, camera hardware, and software tampering signatures.
    """
    metadata: Dict[str, Any] = {
        "has_exif": False,
        "gps_latitude": None,
        "gps_longitude": None,
        "gps_altitude_m": None,
        "capture_timestamp": None,
        "camera_make": None,
        "camera_model": None,
        "software": None,
        "tamper_flags": []
    }

    try:
        with Image.open(file_path) as img:
            exif_raw = img.getexif()

            if not exif_raw:
                metadata["tamper_flags"].append("NO_EXIF_DATA_STRIPPED")
                return metadata

            metadata["has_exif"] = True

            # Extract standard tags
            for tag_id, value in exif_raw.items():
                tag_name = TAGS.get(tag_id, tag_id)
                if tag_name == 'Make':
                    metadata["camera_make"] = str(value).strip()
                elif tag_name == 'Model':
                    metadata["camera_model"] = str(value).strip()
                elif tag_name == 'Software':
                    metadata["software"] = str(value).strip()
                    # Check for photo editing / AI generation signatures
                    if any(tool in str(value).lower() for tool in ['photoshop', 'gimp', 'canva', 'midjourney', 'stable diffusion']):
                        metadata["tamper_flags"].append(f"TAMPER_SOFTWARE_DETECTED_{value}")
                elif tag_name in ['DateTimeOriginal', 'DateTime']:
                    metadata["capture_timestamp"] = str(value).strip()

            # Extract GPS IFD tags
            gps_ifd = exif_raw.get_ifd(0x8825)
            if gps_ifd:
                gps_data = {}
                for k, v in gps_ifd.items():
                    gps_tag_name = GPSTAGS.get(k, k)
                    gps_data[gps_tag_name] = v

                lat_val = gps_data.get('GPSLatitude')
                lat_ref = gps_data.get('GPSLatitudeRef', 'N')
                lon_val = gps_data.get('GPSLongitude')
                lon_ref = gps_data.get('GPSLongitudeRef', 'E')

                if lat_val and lon_val:
                    lat = _convert_to_degrees(lat_val)
                    if lat_ref != 'N':
                        lat = -lat
                    lon = _convert_to_degrees(lon_val)
                    if lon_ref != 'E':
                        lon = -lon
                    
                    metadata["gps_latitude"] = round(lat, 7)
                    metadata["gps_longitude"] = round(lon, 7)

                if 'GPSAltitude' in gps_data:
                    try:
                        alt = gps_data['GPSAltitude']
                        metadata["gps_altitude_m"] = float(alt.numerator) / float(alt.denominator) if hasattr(alt, 'numerator') else float(alt)
                    except Exception:
                        pass

    except Exception as e:
        metadata["tamper_flags"].append(f"EXIF_PARSE_EXCEPTION_{str(e)}")

    return metadata


def calculate_haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in meters between two GPS coordinates."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def verify_gps_proximity(
    exif_lat: Optional[float], 
    exif_lon: Optional[float], 
    target_lat: float, 
    target_lon: float, 
    max_radius_m: float = 100.0
) -> Tuple[bool, float, str]:
    """Verify that photo EXIF GPS is within allowed threshold radius (default 100m)
    of the assigned ward incident location.
    """
    if exif_lat is None or exif_lon is None:
        return False, -1.0, "Missing GPS coordinates in evidence EXIF metadata"

    dist_m = calculate_haversine_distance_m(exif_lat, exif_lon, target_lat, target_lon)
    is_valid = dist_m <= max_radius_m
    reason = f"Distance: {dist_m:.1f}m (Threshold: {max_radius_m}m)" if is_valid else f"GPS Mismatch: Evidence captured {dist_m:.1f}m from reported site (> {max_radius_m}m threshold)"
    
    return is_valid, round(dist_m, 2), reason
