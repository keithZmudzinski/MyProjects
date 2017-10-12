import mutagen
import json
import ntpath
import urllib.request
import urllib
import requests
import tkinter
from tkinter import filedialog
import os


apiKey = "9a3fd8b910073e56b47d0c4ddbdd984a"

def getFile():
    root = tkinter.Tk()
    root.withdraw() #use to hide tkinter window
    startDir = "::{20D04FE0-3AEA-1069-A2D8-08002B30309D}" #starts filedialog at 'this pc'
    filePath = tkinter.filedialog.askopenfilenames(parent=root, initialdir=startDir,\
        title='Please select a file')

    return root.tk.splitlist(filePath)

def correctFileName(path):
    fName = ntpath.basename(path)
    fName = fName[:len(fName)-4]
    print("Selected file: " + fName)
    choice = input("Edit file name? ('yes'/'no'): ")
    if choice == "yes":
        fName = input("Enter desired name: ")
        print(fName)
    elif choice  == "no":
        return fName
    else:
        print(choice)
        return choice
    return fName

def getSuggestions(fName):
    data = {"grant_type":"client_credentials"}
    client_id = "b5f570f1d6874974b0fdca654a24c430"
    client_secret = "5aa2906ccbd24e0185f67c8e1043c592"
    url = "https://accounts.spotify.com/api/token"

    auth_response = requests.post(url, data=data, auth =(client_id, client_secret))
    access_token = auth_response.json()['access_token']

    payload = {'q': fName, 'type':'track','limit':5}
    metadata = requests.get("https://api.spotify.com/v1/search",\
    headers = {'Authorization': "Bearer "+access_token},\
    params = payload)

    return metadata.json()

def printSuggestions(metadata):
    numResults = len(metadata['tracks']['items'])
    if numResults == 0:
        print("No results found")
        return False
    for suggestion in range(numResults):
        print(str(suggestion+1) + ". " +\
            metadata['tracks']['items'][suggestion]['name'] +\
            " by " +\
            metadata['tracks']['items'][suggestion]['artists'][0]['name'] +\
            ", from " +\
            metadata['tracks']['items'][suggestion]['album']['name']
        )
    return True

def editFile(filePath, metadata, songIndex):
    songName = metadata['tracks']['items'][songIndex]['name']
    artist = metadata['tracks']['items'][songIndex]['artists'][0]['name']
    album = metadata['tracks']['items'][songIndex]['album']['name']



    os.chmod(filePath,0o775) #gives permission to save changes
    audioFile = mutagen.File(filePath, easy = True)
    try:
        audioFile.tags['title'] = songName
        audioFile.tags['artist'] = artist
        audioFile.tags['album'] = album
        audioFile.save()

        ext = ntpath.basename(filePath)[len(ntpath.basename(filePath))-4:]
        name = artist + " - " + album + " - " + songName + ext
        os.rename(filePath, os.path.join(os.path.dirname(filePath), name))

        print("Title: " + songName, end = '')
        print(", Artist: " + artist, end = '')
        print(", Album: " + album)
        print("")
    except AttributeError:
        print("File type not supported")
        print("")
