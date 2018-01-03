# Rshell Assignmet
rshell is a terminal written in c++ that emulates the behaviour of the command line terminal. Executables can be connected by the connectors "&&", "||", and ";". The terminal is able to parse these connectors to be able to run each executable seperatly. The terminal will keep asking for user input until the user types the special built-in command "exit".
### Classes:
  ##### newUserInput: 
Takes in a string from the user and parses the string at each each connector creating a new node with the connector as its "name" and the left child being the string to the left of the connector and the right child being the string to the right of the connector, which are recursively parsed until there are no more connectors, thus creating a tree.
  ##### node:
Stores the "name" of the node as a string and has a left and right child that are other nodes storing strings. If the "name" cannot be parsed, the node is a leaf node, an executable. If the "name" can be parsed, the left and right children are set as the left and right executables of the connector. The node class aso has execute() which runs all the executables. eg: ls && pwd becomes leftChild = ls, rightChild = pwd, parent = &&.

### Note: 
  When nesting double quotes ' " ', inside of double quotes, the inner quote must be escaped, eg. ' \\" '.
### Bugs:
  Echo will print the escape character preceding any inner quote.
