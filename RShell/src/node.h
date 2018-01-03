#ifndef __NODE_H__
#define __NODE_H__
#include<iostream>
using namespace std;

class node {
   private:
	node* left;
	node* right;
	string name;	//Internal nodes hold connectors, leafs hold commands
   public:
	node();
	~node();
	node(string name);
	string merge();	//used in outputName, test function
	void setLeft(node* newNode);
	void setRight(node* newNode);
	void outputName();
	int execute(int inputFD = -1, int outputFD = -1, int *piper = NULL);// calls the executable stored in name
};
#endif
