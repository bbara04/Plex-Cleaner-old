from flask import Flask, jsonify, make_response, render_template
from flask_cors import CORS
from flask import request
import requests
import json
from reader import plex_reader, radarr_reader, sonarr_reader, tautilli_reader

app = Flask(__name__)
CORS(app)

@app.after_request
def set_csp(response):
    csp = "default-src 'self' http: https: 'unsafe-inline' 'unsafe-eval'"
    response.headers['Content-Security-Policy'] = csp
    return response

@app.route('/')
def home():
    return render_template('index.html')

#@app.after_request
#def apply_csp(response):
#    response.headers["Content-Security-Policy"] = "default-src https:; connect-src http:;"
#    return response


config = {}
with open("config.json", "r") as f:
    config = json.load(f)


def fileNameCrop(str):
        return str.split('/')[-1]


@app.route('/config', methods = ["GET"])
def get_config():
    config = {}
    with open("config.json", "r") as f:
        configg = json.load(f)
    return jsonify(configg), 200


@app.route('/config', methods = ["POST"])
def update_config():
    config = request.get_json()

    with open("config.json", "w") as f:
        json.dump(config, f)
    f.close()

    return jsonify(config), 200


@app.route('/media/expired', methods = ['GET'])
def get_expired_media():

    excluded_str = config['excluded_lines']

    tautulli_stats = tautilli_reader.readTautulli(config['server']['ip'], config['tautulli']['port'], config['tautulli']['api'])
    plex_stats = plex_reader.readPlex(config['server']['ip'], config['plex']['port'], config['plex']['api'])
    sonarr_stats = sonarr_reader.readSonarr(config['server']['ip'], config['sonarr']['port'], config['sonarr']['api'])
    radarr_stats = radarr_reader.readRadarr(config['server']['ip'], config['radarr']['port'], config['radarr']['api'])

    sel_list = []

    for tautulli in tautulli_stats:
        for plex in plex_stats:
            if tautulli[0] == plex[0]:
                tiltott = False
                for exc_str in excluded_str:
                    if exc_str.lower() in plex[2].lower():
                        tiltott = True
                        break
                if tiltott == False and plex[3] == "show":
                    for sonarr in sonarr_stats:
                        if fileNameCrop(sonarr[2]) == fileNameCrop(plex[2]) and tautulli[2] > int(config['sonarr']["delete_after_days"]):
                            #print(f"{sonarr[1]} |\tLast watched: {tautulli[2]} days ago |\t {plex[2]}")
                            sel_list.append((sonarr[1], tautulli[2], sonarr[0], "show"))
                elif tiltott == False and plex[3] == "movie":
                    for radarr in radarr_stats:
                        if fileNameCrop(radarr[2]) == fileNameCrop(plex[2]) and tautulli[2] > int(config['radarr']["delete_after_days"]):
                            #print(f"{radarr[1]} |\tLast watched: {tautulli[2]} days ago |\t {plex[2]}")
                            sel_list.append((radarr[1], tautulli[2], radarr[0], "movie"))

    return jsonify(sel_list)


@app.route('/media/all', methods = ['GET'])
def get_all_media():
    
        tautulli_stats = tautilli_reader.readTautulli(config['server']['ip'], config['tautulli']['port'], config['tautulli']['api'])
        plex_stats = plex_reader.readPlex(config['server']['ip'], config['plex']['port'], config['plex']['api'])
        sonarr_stats = sonarr_reader.readSonarr(config['server']['ip'], config['sonarr']['port'], config['sonarr']['api'])
        radarr_stats = radarr_reader.readRadarr(config['server']['ip'], config['radarr']['port'], config['radarr']['api'])
    
        sel_list = []
    
        for tautulli in tautulli_stats:
            for plex in plex_stats:
                if tautulli[0] == plex[0]:
                    if plex[3] == "show":
                        for sonarr in sonarr_stats:
                            if fileNameCrop(sonarr[2]) == fileNameCrop(plex[2]):
                                #print(f"{sonarr[1]} |\tLast watched: {tautulli[2]} days ago |\t {plex[2]}")
                                sel_list.append((sonarr[1], tautulli[2], sonarr[0], "show"))
                    elif plex[3] == "movie":
                        for radarr in radarr_stats:
                            if fileNameCrop(radarr[2]) == fileNameCrop(plex[2]):
                                #print(f"{radarr[1]} |\tLast watched: {tautulli[2]} days ago |\t {plex[2]}")
                                sel_list.append((radarr[1], tautulli[2], radarr[0], "movie"))
    
        return jsonify(sel_list)


@app.route('/media', methods = ["POST"])
def delete_media():
    data = request.get_json()

    for media in data:
        if media[1] == "show":
            response = requests.delete(f"http://{config['server']['ip']}:{config['sonarr']['port']}/api/v3/series/{media[0]}?deleteFiles=true&addImportListExclusion=false&apikey={config['sonarr']['api']}")
        elif media[1] == "movie":
            response = requests.delete(f"http://{config['server']['ip']}:{config['radarr']['port']}/api/v3/movie/{media[0]}?deleteFiles=true&addImportExclusion=false&apikey={config['radarr']['api']}")

    return jsonify(data), 200


if __name__ == "__main__":
    app.run(debug=True)
