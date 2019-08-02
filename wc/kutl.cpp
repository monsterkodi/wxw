
// 000   000  000   000  000000000  000      
// 000  000   000   000     000     000      
// 0000000    000   000     000     000      
// 000  000   000   000     000     000      
// 000   000   0000000      000     0000000  

#include "kutl.h"

#include <dwmapi.h>

int klog(const char *msg)
{
    printf(msg);
    printf("\n");
    return 0;
}

void flog(const char* format, ...)
{
    va_list args;
    va_start(args, format);
    vfprintf(stderr, format, args);
    va_end(args);
}

bool fileExists(char* szPath)
{
    DWORD dwAttrib = GetFileAttributesA(szPath);
    return ((dwAttrib != INVALID_FILE_ATTRIBUTES) && !(dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

bool dirExists(char* szPath)
{
    DWORD dwAttrib = GetFileAttributesA(szPath);
    return ((dwAttrib != INVALID_FILE_ATTRIBUTES) && (dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

DWORD now()
{
    return GetTickCount();
}

// 000000000  000  000000000  000      00000000  
//    000     000     000     000      000       
//    000     000     000     000      0000000   
//    000     000     000     000      000       
//    000     000     000     0000000  00000000  

wstring windowTitle(HWND hWnd)
{
    int length = GetWindowTextLengthW(hWnd);
    if (length <= 0) return L"";
    static wchar_t title[1024];
    if (length > 1023) length = 1023;
    GetWindowText(hWnd, title, length+1);
    return title;
}

string windowStatus(HWND hWnd)
{
    LONG style = GetWindowLongW(hWnd, GWL_STYLE);
    if    (!(style & WS_VISIBLE)) { return "hidden"; }
    else if (style & WS_MINIMIZE) { return "minimized"; }
    else if (style & WS_MAXIMIZE) { return "maximized"; }
    return "normal";
}

bool isMinimized(HWND hWnd)
{
    return cmp(windowStatus(hWnd), "minimized");
}

bool isWindowCloaked(HWND hWnd)
{
    int Cloaked;
    if (S_OK != DwmGetWindowAttribute(hWnd, DWMWA_CLOAKED, &Cloaked, sizeof(Cloaked)))
    {
        Cloaked = 0;
    }
    return Cloaked ? true : false;
}

// 000   000  000  000   000  00000000   00000000   0000000  000000000  
// 000 0 000  000  0000  000  000   000  000       000          000     
// 000000000  000  000 0 000  0000000    0000000   000          000     
// 000   000  000  000  0000  000   000  000       000          000     
// 00     00  000  000   000  000   000  00000000   0000000     000     

wRect winRect(HWND hWnd)
{
    RECT rect; 
    GetWindowRect(hWnd, &rect);
    LONG width  = rect.right - rect.left;
    LONG height = rect.bottom - rect.top;
    LONG x = rect.left;
    LONG y = rect.top;
    return {x,y,width,height};
}

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

// 000000000  00000000  00000000   00     00  000  000   000   0000000   000000000  00000000  
//    000     000       000   000  000   000  000  0000  000  000   000     000     000       
//    000     0000000   0000000    000000000  000  000 0 000  000000000     000     0000000   
//    000     000       000   000  000 0 000  000  000  0000  000   000     000     000       
//    000     00000000  000   000  000   000  000  000   000  000   000     000     00000000  

HRESULT terminateProc(DWORD procid)
{
    HRESULT result = S_OK;
    if (HANDLE hProc = OpenProcess(SYNCHRONIZE|PROCESS_TERMINATE, FALSE, procid))
    {
        if (TerminateProcess(hProc, 0))
        {
            cout << "terminated " << procid << endl;
        }
        else
        {
            cerr << "termination failed " << procid << endl;
            result = S_FALSE;
        }
        
        CloseHandle(hProc);
    }
    else
    {
        cerr << "no termination handle " << procid << endl;
        result = S_FALSE;
    }
    
    return result;
}

// 00000000  000  000   000  0000000    00000000  000  000      00000000  
// 000       000  0000  000  000   000  000       000  000      000       
// 000000    000  000 0 000  000   000  000000    000  000      0000000   
// 000       000  000  0000  000   000  000       000  000      000       
// 000       000  000   000  0000000    000       000  0000000  00000000  

bool findFile(const wstring& directory, const wstring& filename, wstring& result)
{
    wstring tmp = directory + L"\\*";
    WIN32_FIND_DATAW file;
    HANDLE search_handle = FindFirstFileW(tmp.c_str(), &file);
    if (search_handle != INVALID_HANDLE_VALUE)
    {
        vector<wstring> directories;

        do
        {
            if (file.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)
            {
                if ((!lstrcmpW(file.cFileName, L".")) || (!lstrcmpW(file.cFileName, L".."))) continue;
            }

            tmp = directory + L"\\" + wstring(file.cFileName);

            if (cmp(filename, file.cFileName))
            {
                result = tmp;
                return true;
            }

            if (file.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY)
            { 
                directories.push_back(tmp);
            }

        } while (FindNextFileW(search_handle, &file));

        FindClose(search_handle);

        for (vector<wstring>::iterator iter = directories.begin(), end = directories.end(); iter != end; ++iter)
        { 
            if (findFile(*iter, filename, result))
            {
                return true;
            }
        }
    }
    return false;
}
