#include "node.h"
#include "helpers.h"
#include <cstring>
#include <unistd.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <stdlib.h>
#include <sys/types.h>
#include <cstdio>

node::node() : left(0), right(0) {}

node::node(string name) : left(0), right(0), name(name) {}
node::~node(){
	if(left){
		delete left;
		delete right;
	}
}

string node::merge(){
	if (left == 0 && right == 0)
		return name;
	else
		return left->merge() + " " + name + " " + right->merge();
}

void node::setLeft(node* newNode) {
	left = newNode;
}

void node::setRight(node* newNode) {
	right = newNode;
}

void node::outputName() {//this is a test function to make sure information was properly stored in nodes
	if(left == 0) {
		cout << name;
		return;
	}
	left->outputName();
	cout << " " << name << " ";
	right->outputName();
}
int node::execute(int inputFD , int outputFD, int *piper) {
	int i = 0;
	int status = 0;
	stripWhiteSpace(name);
	if(left == 0) {
		if (name == "exit")//if the command is exit then it automatically ends the program
			return -3;
		else if(name.size() >= 3 && name.at(0) == '[' && name.at(name.size()-1) == ']' &&
			name.at(name.size()-2) == ' ' && name.at(1) == ' '){
				return test(name.substr(2,name.size()-3));
		}
		else if(name.find(" ") != string::npos && name.substr(0,name.find(" ")) == "test"){
			return test(name.substr(name.find(" ")));
		}
		else if(name.find(" ") == string::npos && name == "test"){
			return test("");
		}
				
		pid_t pid = fork();
		if(pid == 0){//child clone
			char* quotesW = new char[name.length()+1];
			//Preserves substring inside of ""
			if(find(name, "\"") != -1){
				int qIndex = find(name,"\"");
				int nextQIndex = find(name.substr(qIndex+1),"\"");
				strcpy(quotesW, ( name.substr(qIndex+1, nextQIndex)).c_str());
				name.erase(qIndex+1,nextQIndex+1);
			}
			char* cstrName = new char [name.length()+1];		
			strcpy(cstrName,name.c_str());
			char* k = strtok(cstrName, " ");
			int j = 0;
			char** arg = new char*[name.length()+1];
			while(k != 0){
				arg[j] = k;
				k = strtok(NULL, " ");
				++j;
			}
			arg[j] = NULL;
			int h = 0;
			while(arg[h] != NULL && quotesW != 0){
				if(arg[h][0] == '"'){
					arg[h] = quotesW;
					break;
				}
				++h;
			}
			

			i = execvp(arg[0], arg);//runs the executable
			delete[] cstrName;
			delete[] arg;
			if( i < 0 ) {
				perror( "Error, execvp failed");//if the command does not exist the in outputs an error message
				_exit(2);//this helps with determining it failed
			}
			_exit(1);
		}
		else if(pid > 0){//parent
			while(waitpid(pid,&status,0) != pid);
			if(WIFEXITED(status)) {
				if (WEXITSTATUS(status) == 2) {
					return -1;//returns -1 to show that it failed for the "&&" and "||" functions
				}
			}
		}
		else if(pid < 0){
			//cout << "Error with fork()" << endl;
			perror("Error with fork");	
		}
		return i;
	}
	if(name == ">" || name == ">>"){
		
		int stdOut = 0;
		int out = 0;
		string outputFile = "";
		stdOut = dup(1);
		if(stdOut == -1){
			perror("dup");
		}
		outputFile = right->name;
		stripWhiteSpace(outputFile);
		if(name == ">"){
			out = open(outputFile.c_str(), O_WRONLY | O_TRUNC | FD_CLOEXEC | O_CREAT, S_IRUSR | S_IRGRP | S_IWGRP | S_IWUSR);
		}
		else{
			out = open(outputFile.c_str(), O_APPEND | O_RDONLY | FD_CLOEXEC | O_CREAT, S_IRUSR | S_IRGRP | S_IWGRP | S_IWUSR);

		}	
		if(outputFD != -1){//Use the same FD as first file output to in the tree
			out = outputFD;
		}
				
	
		if(dup2(out,1) == -1){
			perror("dup2");
		}
		i = left->execute(-1,out);//continue ouputting to the same file
		if(dup2(stdOut, 1) == -1){
			perror("dup");
		}
		if(close(stdOut) == -1){
			perror("close");
		}	
	}
	else if(name == "<"){
		int stdIn = 0;
		stdIn = dup(0);
		if(stdIn == -1){
			perror("dup");
		}
		string inputFile = right->name;
		stripWhiteSpace(inputFile);
		int in = open(inputFile.c_str(), O_RDONLY);
		if(inputFD != -1){//Use the same FD as the first file input into
			in = inputFD;
		}
		if(dup2(in,0) == -1){
			perror("dup2");
			return -1;
		}
		i = left->execute(in);//continue inputting to the same file
		if(dup2(stdIn, 0) == -1){
			perror("dup2");
			return -1;
		}
		if(close(stdIn) == -1){
			perror("close");
			return -1;
		}
	}		
	else if(name == "|"){
		int stdIn = 0;
		int stdOut = 0;
		stdIn = dup(0);
		stdOut = dup(1);
		int pipeFD[2];
		int pipePasser = 0;
		if(pipe(pipeFD) == -1){
			perror("pipe");
			return -1;
		}
		if(close(1) == -1) {
			perror("close");
                        return -1;
                }

		if(dup2(pipeFD[1],1) == -1){
			perror("dup2");
			return -1;
		}
		if(close(pipeFD[1]) == -1){
			perror("close");
			return -1;
		}

		left->execute(-1, -1, pipeFD);

		if(close(0) == -1) {
			perror("close");
			return -1;
		}
		if(dup2(pipeFD[0],0) == -1){
			perror("dup2");
			return -1;
		}
		if(close(pipeFD[0]) == -1){
			perror("close");
			return -1;
		}
		
		if(piper == NULL){
			if(dup2(stdOut,1)== -1){
				perror("dup2");
				return -1;
			}
			
			pipePasser = -1;
		}
		else{
			pipe(piper);
			if(dup2(piper[1],1) == -1){
				perror("dup2");
				return -1;
			}
			if(close(piper[1]) == -1){
				perror("close(piper)");
				return -1;
			}
		}
		
		right->execute();

		if(dup2(stdOut,1) == -1){
			perror("close");
			return -1;
		}
		if(close(stdOut) == -1){
			perror("close");
			return -1;
		}
		if(dup2(stdIn,0) == -1){
			perror("dup2");
			return -1;
		}			
	
		if(close(stdIn) == -1){
			perror("close");
			return -1;
		}
		
	}	
	else{
		i = left->execute();
	}
	if(i == -3){
		return -3;//if exit is called
	}
	else if (i < 0 && name == "&&"){//if the first executable failed the the second one does not execute
		return i;
	}
	else if (i >= 0 && name == "||") {//if the first executable succeeded then the second one does not execute
		return i;
	}
	if(name != ">" && name !=  ">>" && name != "<" && name != "|"){
		i = right->execute();
	}
	if (i == -3)
		return -3;//if exit is called
	return i;
}
