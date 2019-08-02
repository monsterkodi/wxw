
#include <windows.h>
#include <tlhelp32.h>
#include "kutl.h"

// 00000000   00000000    0000000    0000000  00000000    0000000   000000000  000   000  
// 000   000  000   000  000   000  000       000   000  000   000     000     000   000  
// 00000000   0000000    000   000  000       00000000   000000000     000     000000000  
// 000        000   000  000   000  000       000        000   000     000     000   000  
// 000        000   000   0000000    0000000  000        000   000     000     000   000  

string procPath(DWORD pid)
{
	HANDLE hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);

	DWORD pathSize = MAX_PATH;
	static char path[MAX_PATH];
	path[0] = 0;

	if (QueryFullProcessImageNameA(hProcess, 0, path, &pathSize))
	{
		return string(path);
	}
	return string("");
}

// 00000000   00000000    0000000    0000000  
// 000   000  000   000  000   000  000       
// 00000000   0000000    000   000  000       
// 000        000   000  000   000  000       
// 000        000   000   0000000    0000000  

vector<procinfo> procs(char* id)
{
	vector<procinfo> procinfos;

	HANDLE hProcessSnap;
	PROCESSENTRY32 pe32;

	hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
	if (hProcessSnap == INVALID_HANDLE_VALUE)
	{
		return procinfos;
	}

	pe32.dwSize = sizeof(PROCESSENTRY32);

	if (!Process32First(hProcessSnap, &pe32))
	{
		CloseHandle(hProcessSnap);
		return procinfos;
	}

	do
	{
		string path = procPath(pe32.th32ProcessID);

		if (!path.size())
		{
			continue;
		}

		string name = fileName(path);
		string ext = fileExt(path);

		if (ext.size() > 0) name += ext;

		if (id == NULL || contains(name, id) || pe32.th32ProcessID == atoll(id))
		{
			procinfos.push_back({ path.c_str(), pe32.th32ProcessID, pe32.th32ParentProcessID });
		}

	} while (Process32Next(hProcessSnap, &pe32));

	CloseHandle(hProcessSnap);

	return procinfos;
}

