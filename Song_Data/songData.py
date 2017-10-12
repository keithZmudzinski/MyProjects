from helpers import *


def userSelect(suggestions):
    numResults = len(suggestions['tracks']['items'])
    if numResults > 5:
        numResults = 5
    accept = False
    while not accept:
        try:
            songIndex = input("Select song number ('0' to exit selection,"+ \
                " 'again' to change input): ")
            songIndex = int(songIndex)-1
            if songIndex == -1:
                print("")
                break
            if songIndex < 0 or songIndex > numResults -1:
                raise ValueError("Out of acceptable range")
            accept = True
        except ValueError:
            if(songIndex == 'again'):
                print("")
                return -2
            else:
                print("Enter a number shown above")
                print("")
    return songIndex


def persistentMenu():
    again = True
    while(again):
        filePathList = getFile()
        for filePath in filePathList:
            tryAgain = False
            while(not tryAgain):
                fName = correctFileName(filePath)
                suggestions = getSuggestions(fName)
                if printSuggestions(suggestions):
                    songIndex = userSelect(suggestions)
                    if(songIndex == -1):
                        break
                    elif(songIndex != -2):
                        editFile(filePath, suggestions, songIndex)
                        tryAgain = True
                else:
                    userTryAgain = input("Try Again? ('yes'/'no')")
                    if userTryAgain == "no":
                        tryAgain = True

        again = input("Search for another song? ('yes'/'no'): ")
        if(again != 'yes'):
            again = False
        else:
            again = True
            print("")



# persistentMenu()
