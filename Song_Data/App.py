import tkinter
import sys
sys.path.insert(0,'D:\Documents\CS\songMData')
import songData
sys.path.insert(0, 'D:\Documents\CS\Plex_help')
import organize

class App:
    def __init__(self, master):
        frame = tkinter.Frame(master)
        frame.pack()

        self.dataButton = tkinter.Button(
            frame, text = "Get Data", command = songData.persistentMenu
        )
        self.dataButton.pack(side = tkinter.LEFT)

        self.orgButton = tkinter.Button(
            frame, text = "Organize", command = organize.begin
        )
        self.orgButton.pack(side = tkinter.LEFT)
        self.quitButton = tkinter.Button(
            frame, text = "QUIT", command = frame.quit
        )
        self.quitButton.pack(side = tkinter.BOTTOM)
