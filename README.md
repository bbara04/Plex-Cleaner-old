# Plex-Cleaner

Web application for deleting content that hasn't been watched in specified time. It searches Sonarr, Radarr, Tautulli and Plex for the most accurate data and deletes media in all of them. It currently use Python-flask as a backend and native Javascript as a frontend.

#### Update

Due to the complexity of the project the frontend is going to move to React Framework

#### 1. Project setup
Clone repostory and move to the project directory
```bash
git clone https://github.com/bbara04/Plex-Cleaner.git
cd Plex-Cleaner
```

#### 2. Configure app (Temporary solution)
Configure config before deploying docker container (As of right now it is cannot be changed on the webpage but I am working on it :) )
```json
{"excluded_lines": [],  Words that content file path cannot include choosing expired media
"server": {"ip": "localhost"},    The servers ip address that runs the applications 
"plex": {"api": "plexapi", "port": 32400},  Plex api and application port
"radarr": {"api": "radarrapi", "delete_after_days": "30", "port": 7878},    Radarr api, days after movies gets flagged as expired and application port
"sonarr": {"api": "sonarrapi", "delete_after_days": "30", "port": 8989},    Sonarr api, days after shows gets flagged as expired and application port
"tautulli": {"api": "tautulliapi", "port": 8181}}   Tautulli api and application port
```

#### 3. Create docker image
```bash
docker build -t plex-cleaner .
```

#### 4. Run docker image
```bash
docker run -d -p 5059:5000 --name plex-cleaner plex-cleaner
```

## Usage
You can access the webpage on http://(Your server's ip):5059. Your can list all of your content and specifically the expired contents.

![alt text](https://github.com/bbara04/Plex-Cleaner/blob/main/AppView.png?raw=true)

After selecting the movies/shows click delete at the bottom and it deletes from all of your applications linked to plex.