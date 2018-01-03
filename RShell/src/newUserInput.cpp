#include "newUserInput.h"

newUserInput::newUserInput() {}

newUserInput::newUserInput(string str) {
	size_t commentIndex = str.find("#");//Immediately gets rid of
	if(commentIndex != string::npos){	//commented out command.
		str = str.substr(0,commentIndex);
	}
	vector<string> v = parse(str, ";");//Fills v  with substrs from str.
	newVec = (nodeParse(v));	//Fills newVec with node* to heads of each command tree.
}

void newUserInput::outputVector() {//Prints each command tree inOrder.
	for (unsigned i = 0; i < newVec.size(); i++) {
		if(newVec.at(i) != NULL){
			newVec.at(i)->outputName();
			cout << endl;
		}
		else{
			cout << "Command " << i +1 << " is formatted incorrectly, skipping" << endl;
		}
	}
}
//Calls execute on each head of tree, -3 indicates
//connector stopped execution of command.
int newUserInput::run(){
	for (unsigned i = 0; i < newVec.size(); i++) {
		if(newVec.at(i) != NULL){
			int status = newVec.at(i)->execute(-1, -1, NULL);
			if(status == -3) {
				return -3;
			}
		}
		else{
			cout << "Command " << i + 1 << " is formatted incorrectly, skipping.\
				(check quotes and parentheses)" << endl; 
		}	
	}
}
