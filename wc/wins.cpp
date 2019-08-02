/*
000   000  000  000   000   0000000  
000 0 000  000  0000  000  000       
000000000  000  000 0 000  0000000   
000   000  000  000  0000       000  
00     00  000  000   000  0000000   
*/

#include "wins.h"
#include "kutl.h"

// 00     00   0000000   000000000   0000000  000   000  000   000  000  000   000  
// 000   000  000   000     000     000       000   000  000 0 000  000  0000  000  
// 000000000  000000000     000     000       000000000  000000000  000  000 0 000  
// 000 0 000  000   000     000     000       000   000  000   000  000  000  0000  
// 000   000  000   000     000      0000000  000   000  00     00  000  000   000  

bool matchWin(HWND hWnd, DWORD pid, wchar_t* path, const wchar_t* title, char* id)
{
    if (!id) return false;
    
    if (cmp(id, "all"))
    {
        return true;
    }
    else if (cmp(id, "normal") || cmp(id, "minimized") || cmp(id, "maximized"))
    {
        return cmp(windowStatus(hWnd).c_str(), id);
    }

    wstring wid = s2w(id);
    wchar_t buf[65];
    
    StringCbPrintfW(buf, 64, L"%ld", pid);
    if (cmp(wid, buf))
    {
        return true;
    }
    
    StringCbPrintfW(buf, 64, L"%llx", (unsigned long long)hWnd);
    if (cmp(wid, buf))
    {
        return true;
    }
    
    if (path && contains(path, wid))
    {
        return true;
    }

    if (title && contains(title, wid))
    {
        return true;
    }
    
    return false;
}

// 00     00   0000000   000000000   0000000  000   000   0000000  0000000    
// 000   000  000   000     000     000       000   000  000       000   000  
// 000000000  000000000     000     000       000000000  000       0000000    
// 000 0 000  000   000     000     000       000   000  000       000   000  
// 000   000  000   000     000      0000000  000   000   0000000  0000000    

static BOOL CALLBACK matchCB(HWND hWnd, LPARAM param)
{
    if (!IsWindowVisible(hWnd)) return true;
    if ( isWindowCloaked(hWnd)) return true;
    
    wstring title = windowTitle(hWnd);
    if (!title.size()) return true;

    if (cmp(title, "Program Manager"))
    {
        return true;
    }

    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);

    HANDLE hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);

    DWORD pathSize = MAX_PATH;
    wchar_t path[MAX_PATH];
    path[0] = 0;

    char* id = (char*)((void**)param)[0];
    vector<HWND> * wins = (vector<HWND>*) ((void**)param)[1];

    if (QueryFullProcessImageNameW(hProcess, 0, path, &pathSize))
    { 
        if (matchWin(hWnd, pid, path, NULL, (char*)id))
        {
            wins->push_back(hWnd);
        }
    }
    return true;
}

// 00     00   0000000   000000000   0000000  000   000  000  000   000   0000000   
// 000   000  000   000     000     000       000   000  000  0000  000  000        
// 000000000  000000000     000     000       000000000  000  000 0 000  000  0000  
// 000 0 000  000   000     000     000       000   000  000  000  0000  000   000  
// 000   000  000   000     000      0000000  000   000  000  000   000   0000000   

HRESULT matchingWindows(char* id, vector<HWND>* wins)
{
    wins->clear();
    if (cmp(id, "foreground") || cmp(id, "frontmost") || cmp(id, "topmost") || cmp(id, "top") ||  cmp(id, "front"))
    {
        wins->push_back(GetForegroundWindow());
        return S_OK;
    }
    else if (cmp(id, "taskbar"))
    {
        wins->push_back(FindWindow(L"Shell_TrayWnd", L""));
        return S_OK;
    }

    void* param[2];
    param[0] = (void*)id;
    param[1] = (void*)wins;
    if (!EnumWindows(matchCB, (LPARAM)&param))
    {
        return S_FALSE;
    }
    return S_OK;
}

// 000   000  000  000   000  000  000   000  00000000   0000000   
// 000 0 000  000  0000  000  000  0000  000  000       000   000  
// 000000000  000  000 0 000  000  000 0 000  000000    000   000  
// 000   000  000  000  0000  000  000  0000  000       000   000  
// 00     00  000  000   000  000  000   000  000        0000000   

winfo winInfo(HWND hWnd)
{    
    wstring title = windowTitle(hWnd);
    
    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);
        
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);

    string status = windowStatus(hWnd);
        
    int zindex = 0;
    HWND prevWnd = hWnd;
    HWND nextWnd;
    while (nextWnd = GetWindow(prevWnd, GW_HWNDPREV))
    {
        prevWnd = nextWnd;
        zindex += 1;
    }
    
    char swnd[64];
    sprintf_s(swnd, "%llx", (unsigned __int64)hWnd);
    
    wRect wr = winRect(hWnd);
        
    return { procPath(pid), title, swnd, pid, wr.x, wr.y, wr.width, wr.height, zindex, status };
}
