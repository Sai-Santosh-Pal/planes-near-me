import requests

final_data = []
for i in range(1, 3):
    url = f"https://planes-img.sai-santosh-pal.hackclub.app/?page={i}"
    r = requests.get(url)
    r.raise_for_status()
    data = r.json()
    data = data["photos"]
    for i in data:
        final_data.append(i)

with open('planes.txt', 'w+') as file:
    file.write(str(final_data))


