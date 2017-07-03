
import mutagen
import json
import ntpath
import urllib.request
import urllib
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
    return fName

def getSuggestions(fName):
    # print("Track searched: " + fName.replace(" ","+"))
    metadata = urllib.request.urlopen(\
    "http://ws.audioscrobbler.com/2.0/?method=track.search\
    &track=" + urllib.parse.quote(fName) +\
    "&api_key=" + apiKey +\
    "&limit=5"\
    "&format=json")
    metadata = metadata.read().decode('utf-8')
    metadata = json.loads(metadata)
    return metadata

def printSuggestions(metadata):
    numResults = int(metadata['results']['opensearch:totalResults'])
    if numResults == 0:
        print("No results found")
        return False
    if numResults > 5:
        numResults = 5
    for suggestion in range(numResults):
        print(str(suggestion+1) + ". " +\
            metadata['results']['trackmatches']['track'][suggestion]['name'] +\
            ", by " +\
            metadata['results']['trackmatches']['track'][suggestion]['artist'])
    return True

def editFile(filePath, metadata, songIndex):
    songName = metadata['results']['trackmatches']['track'][songIndex]['name']
    artist = metadata['results']['trackmatches']['track'][songIndex]['artist']
    # print("SongName used to find album: " + songName)
    # print("ArtistName used to find album: " + artist)
    album = urllib.request.urlopen(\
    "http://ws.audioscrobbler.com/2.0/?method=track.getInfo\
    &track=" + urllib.parse.quote(songName) +\
    "&artist=" + urllib.parse.quote(artist) +\
    "&api_key=" + apiKey +\
    "&format=json")
    album = album.read().decode('utf-8')
    album = json.loads(album)
    try:
        album = album['track']['album']['title']
    except KeyError:
        print("Album not found, album set to " + artist)
        album = artist

    os.chmod(filePath,0o775) #gives permission to save changes
    audioFile = mutagen.File(filePath, easy = True)
    try:
        audioFile.tags['title'] = songName
        audioFile.tags['artist'] = artist
        audioFile.tags['album'] = album
        audioFile.save()
        print("Title set to: " + songName, end = '')
        print(", Artist set to: " + artist, end = '')
        print(", Album set to: " + album)
    except AttributeError:
        print("File type not supported")
