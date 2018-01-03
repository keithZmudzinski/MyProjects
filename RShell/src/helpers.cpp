#include "helpers.h"
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <stack>
#include <stdio.h>

vector<string> parse(const string& constInput, const string& toFind){
	vector<string> v;
	string input = constInput;
	size_t index = input.find(toFind);
	if(index == string::npos){
		v.push_back(input);
		return v;
	}
	while(index != string::npos){
		v.push_back(input.substr(0,index));
		input = input.substr(index+1);
		index = input.find(toFind);
	}
	v.push_back(input);
	return v;
}
//Calls recurseve nodeParseHelper on each node* in v.
vector<node*> nodeParse(vector<string> v){
	vector<node*> nodeVector;
	for (unsigned i = 0; i < v.size(); i++) {
		nodeVector.push_back(nodeParseHelper(v.at(i)));//Pushes head node* of each ';'
								//seperated command to nodeVector.
	}
	return nodeVector;
}

int find(string str, string toFind){//returns first index of toFind in str
	size_t index = str.find(toFind);
	while(index!= string::npos){
		if(toFind == "\"" && index >0 && str.at(index-1) != '\\'){//returns first not escaped '"'
			return index;
		}
		else if(toFind == "\"" && index == 0){//if first char is '"' and looking for '"'
			return 0;	
		}
		else if(toFind == "(" || toFind == ")"){//check is ( or ) is inside quotes
			int tmpNum = 0;
			string tmpString = str.substr(0,index);
			size_t tmpIndex = tmpString.find("\"");
			while(tmpIndex != string::npos){
				if(tmpIndex > 0 && tmpString.at(tmpIndex-1) != '\\'){
					++tmpNum;
				}
				tmpIndex = tmpString.find("\"", tmpIndex+1);
			}
			if(tmpNum % 2 == 0){
				return index;
			}
			index = str.find(toFind, index+1);
		}
		else if(toFind != "\"" && toFind != "(" && toFind != ")"){//if not looking for (,'"', )
			return index;
		}
		else{
			index = str.find(toFind, index+1);
		}
	}
	return -1;
}


int findNumOf(string str, string toFind){//returns num of toFind in str,'()"' not in quotes
	int index = find(str, toFind);
	int num = 0;
	while(index != -1){
		++num;
		str = str.substr(index+1);
		index = find(str,toFind);

	}
	return num;
}
int findFreeConnect(string input){//finds first index of a connector not in quotes
	size_t indexOr = input.find("||");
	size_t indexAnd = input.find("&&");
	size_t indexSingleOutput = input.find(">");
	size_t indexDoubleOutput = input.find(">>");
	size_t indexPipe = input.find("|");
	size_t indexInput = input.find("<");
	vector<size_t> indices;
	while(indexOr != string::npos){
		if(validate(input.substr(0,indexOr))){
			indices.push_back(indexOr);
			break;
		}
		indexOr = input.find("||", indexOr+1);
	}	
	while(indexAnd != string::npos){
		if(validate(input.substr(0,indexAnd))){
			indices.push_back(indexAnd);
			break;
		}
		indexAnd = input.find("&&", indexAnd+1);
	}

	while(indexDoubleOutput != string::npos){
		if(validate(input.substr(0,indexDoubleOutput))){
			indices.push_back(indexDoubleOutput);
			break;
		}
		indexDoubleOutput = input.find(">>", indexDoubleOutput+1);
	}	
	while(indexSingleOutput != string::npos && indexSingleOutput != indexDoubleOutput){
		if(validate(input.substr(0,indexSingleOutput))){
			indices.push_back(indexSingleOutput);
			break;
		}
		indexSingleOutput = input.find(">", indexSingleOutput+2);
	}
	while(indexPipe != string::npos && indexPipe != indexOr){
		if(validate(input.substr(0,indexPipe))){
			indices.push_back(indexPipe);
			break;
		}
		indexPipe = input.find("|", indexPipe+2);
	}
	while(indexInput != string::npos){
		if(validate(input.substr(0,indexInput))){
			indices.push_back(indexInput);
			break;
		}
		indexInput = input.find("<", indexInput+1);
	}	
	if(indices.size() >= 1){
		int minIndex = 0;
		for(size_t i = 1; i < indices.size(); ++i){
			if(indices.at(i) < indices.at(minIndex)){
				minIndex = i;
			}
		}
		if(indices.at(minIndex) != string::npos){
			return indices.at(minIndex);
		}	
	}
	return -1;
}

			
	
void stripWhiteSpace(string &input){
	string whitespace = " \n\t\r\v\f";
	size_t index  = input.find_last_not_of(whitespace);
	if(index != string::npos){
		input.erase(index+1);
	}
	index = input.find_first_not_of(whitespace);
	if(index!= string::npos){
		input.erase(0,index);
	}
}
bool validate(const string &str){
	string input = str;
	stripWhiteSpace(input);//To eliminate uneccary whitespace 
	int origL = findNumOf(input, "(");
	int origR = findNumOf(input, ")");
	int quoteNum = findNumOf(input, "\"");
	if(origL == origR && quoteNum % 2 == 0 && origL >= 1){//if has equal
						//number of ('s, )'s and even 
						//number of quotes
		if(input.size() == 2){//if only consists of ()
			return true;
		}
		stack<char> s;
		string tmp = input;
		int indexL = find(tmp, "(");
		int indexR = find(tmp, ")");
		while(indexL != -1 || indexR != -1){//loops through input, finding next available ( or )
			if(indexL < indexR && indexL > -1){
				s.push('(');
				if(indexL == 0 && find(tmp.substr(indexL+1),"(") != -1){
					indexL = find(tmp.substr(indexL+1),"(") + 1;
				}
				else if(indexL > 0 && find(tmp.substr(indexL+1),"(") != -1){
					indexL = find(tmp.substr(indexL+1),"(") + indexL +1;
				}
				else{
					indexL = -1;
				}
			}
			else{
				if(s.empty() || !(s.top() == '(')){//if new ( before closing ) appears
					return false;
				}
				else{
					s.pop();
					if(find(tmp.substr(indexR+1),")") != -1){
						indexR = find(tmp.substr(indexR+1), ")") + indexR + 1;
					}
					else{
						indexR = -1;
					}
				}
			}
		} 
		if(s.empty()){//if all ( have a matching )
			return true;
		}
		return false;
	}
	else if (origL == 0 && origR == 0 && quoteNum % 2 == 0){//if no ()'s and even num of quotes
		return true;
	}
	else{
		return false;//If uneven num of ()'s or uneven num of quotes
	}
}
bool stripParenths(string &input){
	if(input.size() >= 2 &&
	input.at(0) == '(' && input.at(input.size()-1) == ')'){
		if(validate(input.substr(1,input.size()-2))){//If string without 
							//outside ()'s is valid, 
							//outside ()'s are unecessary
			input.erase(input.begin());
			input.erase(input.end()-1);
			return true;
		}
	}
	return false;	
}
int findLastFreeConnect(string input){
	int index = -1; 	
	int tmp = findFreeConnect(input); 
	while(tmp != -1){
		index = tmp;
		if((input.at(tmp) == '>' || input.at(tmp) == '|')
			&& tmp < input.size()-1
			&& (input.at(tmp+1) == '>' || input.at(tmp+1) == '|'))
			{
				tmp = findFreeConnect(input.substr(tmp+2));
			}
		else{	
			tmp = findFreeConnect(input.substr(tmp+1));
		}
		if(tmp != -1){
			tmp += index +1;
		} 
	}
	return index;
}
string identify(int index, string input){
	if(input.at(index) == '&'){ return "&&"; }
	else if(input.substr(index,2) == "||"){ return "||"; }
	else if(input.substr(index,2) == ">>"){ return ">>"; }
	else if(input.at(index) == '>'){ return ">"; }
	else if(input.at(index) == '<'){ return "<"; }
	else if(input.at(index) == '|'){ return "|"; }
}

node* nodeParseHelper(const string& constInput){
	if(validate(constInput)){
		string input = constInput;
		stripWhiteSpace(input);
		int index = findLastFreeConnect(input);
		while(index == -1){
			if(!stripParenths(input)){
				return new node(input);
			}
			index = findLastFreeConnect(input);
		}
		string connector = identify(index,input);
		if(index == 0 && input.size() == connector.size()){
			node* newNode = new node(connector);
			newNode->setLeft(NULL);
			newNode->setRight(NULL);
			return newNode;
		}
		//If connector is last word in input
		else if(index + connector.size() == input.size() && validate(input.substr(0,index))){
			node* newNode = new node(identify(index,input));	
			newNode->setLeft(nodeParseHelper(input.substr(0,index)));
			newNode->setRight(new node(""));
			return newNode;
		}
		//If connector is first word in input
		else if(index == 0 && validate(input.substr(connector.size()))){
			node* newNode = new node(connector);
			newNode->setLeft(NULL);	
			newNode->setRight(nodeParseHelper(input.substr(index + connector.size() )));
			return newNode;
		}
		//If left substring is invalid	
		if(!(validate(input.substr(0, index)))){ 	
			return NULL;
		}
		//If right substring is invalid
		if( !(validate(input.substr(index + connector.size() )))){
			return NULL;
		}
		node* newNode = new node(connector);	
		newNode->setLeft(nodeParseHelper(input.substr(0,index)));
		newNode->setRight(nodeParseHelper(input.substr(index + connector.size())));
		return newNode;	
	}
	else{
		return NULL;
	}
}
	
int test(const string& constInput){
	if(constInput == ""){
		cout << "(False)" << endl;
		return -1;
	}	
	vector<string> flags;
	string 	input = constInput;
	stripWhiteSpace(input);
	int index = input.find_first_of("-");
	while(index != string::npos){
		input = input.substr(index);
		string flag = input.substr(0,find(input, " "));
		if(flag == "-e" || flag == "-f" || flag == "-d"){
			flags.push_back(flag);
			if(input.find(" ") == string::npos){
				input = "";
				break;
			}
			else{
				input = input.substr(find(input, " "));
			}
		}
		else{
			cout << "Unrecognized flag: " << flag << endl;
			return -1; //Failure
		}
		index = input.find_first_of("-");
	}
	if(flags.size() == 2){
		cout << "Binary operator expected" << endl;
		return -1; //Does not support argument comparisons
	}
	else if(flags.size() >= 3){
		cout << "Too many arguments given" << endl;
		return -1;// Can only use 1 argument
	}
	struct stat info;
	stripWhiteSpace(input);
	const char* c = input.c_str();
	if(stat(c,&info) == -1){
		perror("stat");
		cout << "(False)" << endl;
		return -1;
	}
	else if(flags.size() == 0){//will use -e functionality
		cout << "(True)" << endl;
		return 0; //success
	}
	else if(flags.size() == 1){//will use given flag funcionality
		if(flags.at(0) == "-e"){
			cout << "(True)" << endl;
			return 0;
		}
		else if(flags.at(0) == "-f"){
			if(S_ISREG(info.st_mode)){
				cout << "(True)" << endl;
				return 0;
			}
			else{
				cout << "(False)" << endl;
				return -1;
			}
		}
		else{
			if(S_ISDIR(info.st_mode)){
				cout << "(True)" << endl;
				return 0;
			}
			else{
				cout << "(False)" << endl;
				return -1;
			}
		}
				
	}
}	
		
		
	
	

