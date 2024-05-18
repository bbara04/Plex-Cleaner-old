import requests

# This function is used to read the Radarr library
def readRadarr(local_ip, port, api):
    radarr_stats = []
    response = requests.get(f"http://{local_ip}:{port}/api/v3/movie?&apikey={api}")
    for line in response.json():
        radarr_stats.append((line['id'], line['title'], line['path']))
    return radarr_stats
