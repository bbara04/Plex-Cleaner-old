import requests
import xml.etree.ElementTree as ET

# This function is used to fix the file path of the media file
def fileNameConv(filename):
    filenamesplit = filename.split('/')
    filenamesplit.pop(-1)
    filenameFixed = ""
    for str in filenamesplit:
        filenameFixed += str
        filenameFixed += '/'
    return filenameFixed[0:-1]

# This function is used to read the Plex library
def readPlex(local_ip, port, api):
    response = requests.get(f"http://{local_ip}:{port}/library/sections?X-Plex-Token={api}")

    libraries = ET.fromstring(response.text)

    # This list will store the metadata of the media files
    plex_stats = []


    for library in libraries:
        _type = library.attrib.get('type')

        response = requests.get(f"http://{local_ip}:{port}/library/sections/{library.attrib.get('key')}/all?X-Plex-Token={api}")

        library = ET.fromstring(response.text)

        # Handle json response if the library is a show
        if _type == 'show':
            for show in library:
                response = requests.get(f"http://{local_ip}:{port}/library/metadata/{show.attrib.get('ratingKey')}?X-Plex-Token={api}")
                root = ET.fromstring(response.text)
                for directory in root:
                    for spec in directory:
                        if(spec.tag == "Location"):
                            plex_stats.append((show.attrib.get('ratingKey'), directory.attrib.get('title'), spec.attrib.get('path'), 'show'))
                            break
        # Handle json response if the library is a movie
        elif _type == 'movie':
            for movie in library:
                response = requests.get(f"http://{local_ip}:{port}/library/metadata/{movie.attrib.get('ratingKey')}?X-Plex-Token={api}")
                root = ET.fromstring(response.text)
                for video in root:
                    for media in video:
                        if media.tag == "Media":
                            for part in media:
                                if part.tag == "Part":
                                    plex_stats.append((movie.attrib.get('ratingKey'), movie.attrib.get('title'), fileNameConv(part.attrib.get('file')), 'movie'))
                                    break

    return plex_stats

