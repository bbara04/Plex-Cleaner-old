import requests
import datetime

# This function is used to read the Tautulli library
def readTautulli(local_ip, port, api):

    response = requests.get(f"http://{local_ip}:{port}/api/v2?apikey={api}&cmd=get_library_names")
    libraries = response.json()['response']['data']

    mediaList = []

    for section_i in libraries:
        section_i = section_i['section_id']
        response = requests.get(f"http://{local_ip}:{port}/api/v2?apikey={api}&cmd=get_library_media_info&section_id={int(section_i)}&refresh=true")
        metadata = response.json()['response']['data']['data']
        for content in metadata:
            added_at = content['added_at']
            last_played = content['last_played']
            added_at_date = datetime.datetime.utcfromtimestamp(int(added_at))

            # If the media has not been played yet, the last_played field will be the date the media was added
            if last_played is None:
                last_played_date = added_at_date
            else:
                last_played_date = datetime.datetime.utcfromtimestamp(last_played)

            file_time_date = datetime.datetime.now() - last_played_date
            mediaList.append((content['rating_key'], content['title'], file_time_date.days))
    return mediaList
