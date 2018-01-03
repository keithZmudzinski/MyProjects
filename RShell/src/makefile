CC = g++
CC_FLAGS = -Wall -ansi -Werror -pedantic -g
all:../bin/rshell
MKDIR = mkdir ../bin || rm -rf ../bin && mkdir ../bin;
DEPS = node.h helpers.h newUserInput.h main.h
OBJ = node.o helpers.o newUserInput.o main.o
%.o: %.cpp $(DEPS)
	$(CC) -c -o $@ $< $(CC_FLAGS)

../bin/rshell: $(OBJ)
	$(MKDIR) $(CC) -o $@ $^ $(CC_FLAGS)
