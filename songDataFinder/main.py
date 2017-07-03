from helpers import *

again = True
while(again):
    filePathList = getFile()
    for filePath in filePathList:
        fName = correctFileName(filePath)
        suggestions = getSuggestions(fName)
        if printSuggestions(suggestions):
            numResults = int(suggestions['results']['opensearch:totalResults'])
            if numResults > 5:
                numResults = 5
            accept = False
            while not accept:
                try:
                    songIndex = int(input("Select song number ('0' to exit selection): "))-1
                    if songIndex == -1:
                        break
                    if songIndex < 0 or songIndex > numResults -1:
                        raise ValueError("Out of acceptable range")
                    accept = True
                except ValueError:
                    print("Enter a number shown above")
                    print("")
            else:
                editFile(filePath, suggestions, songIndex)
    again = input("Search for another song? ('yes'/'no'): ")
    if(again != 'yes'):
        again = False
    else:
        again = True
        print("")
