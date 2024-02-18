import requests

def readSonarr(local_ip, port, api):
    sonarr_stats = []
    response = requests.get(f"http://{local_ip}:{port}/api/v3/series?includeSeasonImages=false&apikey={api}")
    for line in response.json():
        #print(f"{line['id']} | {line['title']} | {line['path']}")
        sonarr_stats.append((line['id'], line['title'], line['path']))
    return sonarr_stats
