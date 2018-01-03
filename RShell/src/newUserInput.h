#ifndef __NEWUSERINPUT_H__
#define __NEWUSERINPUT_H__
#include "node.h"
#include "helpers.h"
#include <vector>
#include <iostream>
#include <string>
using namespace std;

class newUserInput {
   public:
	newUserInput();
	newUserInput(string str);
	void outputVector();	//Prints each tree held in newVec,
				//used to verify contents.
	vector<node*> newVec;	//Holds pointers to head of each tree.
	int run();		//Executes each tree.
};
#endif
