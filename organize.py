import tkinter
from tkinter import filedialog
import mutagen
import os

#file dialog to get the list of files to sort
def getFiles():
    root = tkinter.Tk()
    root.withdraw()
    startDir = "D:\Music\Music\\ Files" #This application should only be used here
    filePath = filedialog.askopenfilenames(parent = root, initialdir = startDir,\
        title = "Select files to sort")
    return root.tk.splitlist(filePath)

#goes through selected files, sorts into correct directory, making new if necessary
def putToFolder(fileList):
    for song in fileList:
        audioFile = mutagen.File(song, easy = True)
        try:
            currArtist = str(audioFile.tags['artist'])
            currArtist = currArtist.replace('[', '')
            currArtist = currArtist.replace(']', '')
            currArtist = currArtist.replace('"', '')
            currArtist = currArtist.replace(':', '')
            currArtist = currArtist.replace('?', '')
            currArtist = currArtist.replace('*', '')
            currArtist = currArtist.replace('\'', '')
            currArtist = currArtist.strip()


            currAlbum = str(audioFile.tags['album'])
            currAlbum = currAlbum.replace('[', '')
            currAlbum = currAlbum.replace(']', '')
            currAlbum = currAlbum.replace('"', '')
            currAlbum = currAlbum.replace(':', '')
            currAlbum = currAlbum.replace('?', '')
            currAlbum = currAlbum.replace('*', '')
            currAlbum = currAlbum.replace('\'', '')
            currAlbum = currAlbum.strip()

            correctFolderPath = os.path.dirname(song)
            correctFolderPath = os.path.join(correctFolderPath, currArtist)
            correctFolderPath = os.path.join(correctFolderPath, currAlbum)
            correctFilePath = os.path.join(correctFolderPath, os.path.basename(song))

            os.rename(song, correctFilePath)
        # except AttributeError:
        #     print(os.path.basename(song) + " was skipped, AttributeError." )
        except FileNotFoundError:
            os.makedirs(correctFolderPath)
            os.rename(song,correctFilePath)
            print(correctFilePath + " directory was made")
        except KeyError:
            print("Field not filled out, run Song Data on files before organizing them")

songList = getFiles()
putToFolder(songList)
