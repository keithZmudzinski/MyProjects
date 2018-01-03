#ifndef __HELPERS_H__
#define __HELPERS_H__

#include <string>
#include <vector>
#include "node.h"

using namespace std;
//This header file declares several functions that are used throughout
//our program, but do not belong to a specific class.


//breaks constInput into substrings that were partitioned by toFind,
//returns them in vector<string>
vector<string> parse(const string& constInput, const string& toFind);


//parses given vector of strings, puts substrings into tree
//with commands as leaf nodes and connectors as internal nodes
vector<node*> nodeParse(vector<string> v);

	//recursive helper function for nodeParse
	node* nodeParseHelper(const string& constInput);


//return the index of the first found connector
//not surrounded by ()'s or '"'s, returns -1 if no
//such connector found
int findFreeConnect(string input);

	//returns the number of instances of toFind
	//in str, used as helper function for findFreeConnect
	//if toFind == any of '()\"', only returns number
	//of instance not inside quotes
	int findNumOf(string str, string toFind); 
	
	//Returns the index of first found toFind in 
	//string str. If toFind == "||", "&&", "\"", "(", ")", 
	//returns first toFind not inside double quotes
	int find(string str, string toFind);


//if able, removes outermost parentheses around a string,
//eg: '(ls && pwd)' becomes 'ls && pwd', returns true if
//successful, false if no parentheses to strip
bool stripParenths(string &input);

//tests if parentheses are legal, and even number of quotes
bool validate(const string& input);

//strips all leading and trailing whitespace
void stripWhiteSpace(string& input);

//returns the last found index of input,
//if input is a connectr or quote, returns last
//found index not inside quotes
int findLastFreeConnect(string input);
//implements the test functionality
int test(const string &input);
//returns the connector at index in input
string identify(int index, string input);
#endif
	
