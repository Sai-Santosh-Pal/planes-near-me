from flask import Flask
from dotenv import load_dotenv
import os, requests, math
import re
from airportsdata import load

airports = load("ICAO")

load_dotenv()
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
api_key = os.getenv("API_KEY")
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


def get_img(id):
    url = f"https://hexdb.io/api/v1/aircraft/{id}"
    r = requests.get(url)
    try:
        r.raise_for_status()
        # name = r.json()["RegisteredOwners"]
        # if name == "Air India":
        #     return "https://images.seeklogo.com/logo-png/0/2/air-india-logo-png_seeklogo-5113.png"
        # else:
        #     api_url = f'https://api.api-ninjas.com/v1/logo?name={name}'
        #     response = requests.get(api_url, headers={'X-Api-Key': api_key})
        #     if response.status_code == requests.codes.ok:
        #         return eval(response.text)[0]["image"]
        #     else:
        #         return [response.status_code, response.text]

        name = r.json()["RegisteredOwners"]
        if name == "IndiGo":
            return "https://img.logo.dev/goindigo.com?token=pk_V3sa80FXS7qWsGwYzRhbYA"
"
        else:
            api_url = f"https://img.logo.dev/{name}?token=pk_V3sa80FXS7qWsGwYzRhbYA"
            # response = requests.get(api_url, headers={'X-Api-Key': api_key})
            # if response.status_code == requests.codes.ok:
            #     return eval(response.text)[0]["image"]
            # else:
            #     return [response.status_code, response.text]
            return api_url
    except Exception as e:
        # return str(e)
        return "https://upload.wikimedia.org/wikipedia/commons/3/36/United_Airlines_Boeing_777-200_Meulemans.jpg"



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
    # return r.json
    for i in data:
        icao24 = i[0]
        callsign = (i[1] or "").strip()
        lon = i[5]
        lati = i[6]
        image = get_img(icao24)
        if lat is None or lon is None:
            continue
        d = haversine_calc(lat, long, lati, long)

        if d <= radius:
            nearme.append({
                "icao24": icao24,
                "callsign": callsign,
                "lat": lati,
                "lon": lon,
                "distance": d,
                "image": image
            })
    
    for i in nearme:
        sign = i["callsign"]
        i["origin_airport"] = extract_route(sign)[0][1]
        i["dest_airport"] = extract_route(sign)[1][1]
        i["origin_code"] = extract_route(sign)[0][0]
        i["dest_code"] = extract_route(sign)[1][0]

    return nearme

def extract_route(sign):
    url = f"https://flightaware.com/live/flight/{sign}"
    r = requests.get(url,headers={"User-Agent": "Mozilla/5.0"},timeout=20)
    r.raise_for_status()

    text = r.text
    origin_icao = None
    dest_icao = None

    m_origin = re.search(r"setTargeting\('origin',\s*'([^']+)'\)", text)
    if m_origin:
        origin_icao = m_origin.group(1)

    m_dest = re.search(r"setTargeting\('destination',\s*'([^']+)'\)", text)
    if m_dest:
        dest_icao = m_dest.group(1)

    origin_name = airports.get(origin_icao, {}).get("name") if origin_icao else "Couldn't Find"
    dest_name = airports.get(dest_icao, {}).get("name") if dest_icao else "Couldn't Find"

    return [[origin_icao, origin_name], [dest_icao, dest_name]]

app = Flask(__name__)

@app.route("/<string:lat>/<string:long>/<string:radius>")
def coord(lat, long, radius):
    lat, long, radius = float(lat), float(long), float(radius)
    output = get_data(get_token(), lat, long, radius)
    return output

if __name__ == "__main__":
    app.run(debug=True)