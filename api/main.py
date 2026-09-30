from flask import Flask
from dotenv import load_dotenv
import os, requests, math
load_dotenv()
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
print(client_id, client_secret)
def haversine_calc(lat1, long1, lat2, long2):
    R = 6371
    p1, p2 = math.radians(lat1), math.radians(lat2)

    changeP = math.radians(lat2 - lat1)
    changeL = math.radians(long2 - long1)
    a = math.sin(changeP/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(changeL/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def get_token():
    url = "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token"
    data = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret
    }
    r = requests.post(url, data=data, timeout=15)
    r.raise_for_status()
    return r.json()['access_token']


def get_data(token, lat, long, radius):
    delta = max(radius / 111, 1.0)
    lamin, lamax = lat - delta, lat +delta
    lomin, lomax = long - delta, long+ delta

    url = (
        "https://opensky-network.org/api/states/all"
        f"?lamin={lamin}&lamax={lamax}&lomin={lomin}&lomax={lomax}"
    )
    
    r = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}"},
        timeout=15
    )

    r.raise_for_status()
    data = r.json().get("states")
    nearme = []
    for i in data:
        icao24 = i[0]
        callsign = (i[1] or "").strip()
        lon = i[5]
        lati = i[6]

        if lat is None or lon is None:
            continue
        d = haversine_calc(lat, long, lati, long)

        if d <= radius:
            nearme.append({
                "icao24": icao24,
                "callsign": callsign,
                "lat": lati,
                "lon": lon,
                "distance": d
            })
    
    return nearme


app = Flask(__name__)

@app.route("/<string:lat>/<string:long>/<string:radius>")
def coord(lat, long, radius):
    lat, long, radius = float(lat), float(long), float(radius)
    output = get_data(get_token(), lat, long, radius)
    return output

if __name__ == "__main__":
    app.run(debug=True)