import requests
import xml.etree.ElementTree as ET

def fileNameConv(filename):
    filenamesplit = filename.split('/')
    filenamesplit.pop(-1)
    filenameFixed = ""
    for str in filenamesplit:
        filenameFixed += str
        filenameFixed += '/'
    return filenameFixed[0:-1]


def readPlex(local_ip, port, api):
    response = requests.get(f"http://{local_ip}:{port}/library/sections?X-Plex-Token={api}")

    libraries = ET.fromstring(response.text)

    plex_stats = []

    for library in libraries:
        #print(f" -- {library.attrib.get('title')} -- {library.attrib.get('type')} -- ")
        type = library.attrib.get('type')
        response = requests.get(f"http://{local_ip}:{port}/library/sections/{library.attrib.get('key')}/all?X-Plex-Token={api}")
        library = ET.fromstring(response.text)
        if type == 'show':
            for show in library:
                response = requests.get(f"http://{local_ip}:{port}/library/metadata/{show.attrib.get('ratingKey')}?X-Plex-Token={api}")
                show_data = ET.fromstring(response.text)
                for directory in show_data:
                    for spec in directory:
                        if(spec.tag == "Location"):
                            #print(f"{show.attrib.get('ratingKey')} | {directory.attrib.get('title')} | {spec.attrib.get('path')}")
                            plex_stats.append((show.attrib.get('ratingKey'), directory.attrib.get('title'), spec.attrib.get('path'), 'show'))
                            break
        elif type == 'movie':
            for movie in library:
                response = requests.get(f"http://{local_ip}:{port}/library/metadata/{movie.attrib.get('ratingKey')}?X-Plex-Token={api}")
                root = ET.fromstring(response.text)
                for video in root:
                    for media in video:
                        if media.tag == "Media":
                            for part in media:
                                if part.tag == "Part":
                                    #print(f"{movie.attrib.get('ratingKey')} | {movie.attrib.get('title')} | {fileNameConv(part.attrib.get('file'))}")
                                    plex_stats.append((movie.attrib.get('ratingKey'), movie.attrib.get('title'), fileNameConv(part.attrib.get('file')), 'movie'))
                                    break

    return plex_stats

