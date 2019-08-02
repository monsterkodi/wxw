#pragma once

#include "kstr.h"
#include <vector>

struct procinfo
{
	string   path;
	uint32_t pid;
	uint32_t parent;
};

string procPath(DWORD pid);
vector<procinfo> procs(char* id = NULL);
