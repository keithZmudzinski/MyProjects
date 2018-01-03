#include "newUserInput.h"

int main () {
	while (true) {
		string input;
		cout << "$ ";
		getline(cin, input);
		newUserInput newCommandLine(input);
	       	if(newCommandLine.run() == -3) {
			break;
		}
	}
}	
