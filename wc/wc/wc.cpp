#include <windows.h>
#include <WinUser.h>
#include <gdiplus.h>
#include <string.h>
#include <tchar.h>
#include <math.h>
#include <strsafe.h>
#include <iostream>
#include <sstream>
#include <fstream>
#include <vector>
#include <codecvt>
#include <shellscalingapi.h>
#include <KnownFolders.h>
#include <shlwapi.h>
#include <ShlObj.h>
#include <Shobjidl.h>
#include <commoncontrols.h>

using namespace Gdiplus;
using namespace std;

#pragma comment(linker,"\"/manifestdependency:type='win32' \
name='Microsoft.Windows.Common-Controls' version='6.0.0.0' \
processorArchitecture='*' publicKeyToken='6595b64144ccf1df' language='*'\"")

//  0000000  00     00  00000000   
// 000       000   000  000   000  
// 000       000000000  00000000   
// 000       000 0 000  000        
//  0000000  000   000  000        

int wwcmp(const wchar_t* a, const wchar_t* b)
{
    return lstrcmpiW(a, b) == 0;
}

int wcmp(const wchar_t *a, const char *b)
{
    size_t size = strlen(b);
    wstring wc(size+1, L' ');
    size_t conv;
    mbstowcs_s(&conv, &wc[0], size+1, b, size);
    
    return lstrcmpiW(a, (LPCWSTR)&wc[0]) == 0;
} 

int cmp(const char *a, const char *b)
{
    return _strcmpi(a, b) == 0;
} 

wchar_t* wstr(char *s)
{
    size_t size = strlen(s);
    wchar_t *ws = new wchar_t[size+1]; 
    size_t conv;
    mbstowcs_s(&conv, ws, size+1, s, size);
    
    return ws;
}

wstring s2ws(const string& str)
{
    using convert_typeX = codecvt_utf8<wchar_t>;
    wstring_convert<convert_typeX, wchar_t> converterX;

    return converterX.from_bytes(str);
}

string ws2s(const wstring& wstr)
{
    using convert_typeX = codecvt_utf8<wchar_t>;
    wstring_convert<convert_typeX, wchar_t> converterX;

    return converterX.to_bytes(wstr);
}

int klog(char *msg)
{
    printf(msg);
    printf("\n");
    return 0;
}

bool FileExists(char* szPath)
{
    DWORD dwAttrib = GetFileAttributesA(szPath);
    return ((dwAttrib != INVALID_FILE_ATTRIBUTES) && !(dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

bool DirExists(char* szPath)
{
    DWORD dwAttrib = GetFileAttributesA(szPath);
    return ((dwAttrib != INVALID_FILE_ATTRIBUTES) && (dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

// 000000000  000  000000000  000      00000000  
//    000     000     000     000      000       
//    000     000     000     000      0000000   
//    000     000     000     000      000       
//    000     000     000     0000000  00000000  

wchar_t* winTitle(HWND hWnd)
{
    int length = GetWindowTextLengthW(hWnd);
    if (length <= 0) return NULL; 
    wchar_t* title = new wchar_t[length + 1];
    GetWindowText(hWnd, title, length + 1);
    return title;
}

// 00     00   0000000   000000000   0000000  000   000  000  000   000   0000000   
// 000   000  000   000     000     000       000   000  000  0000  000  000        
// 000000000  000000000     000     000       000000000  000  000 0 000  000  0000  
// 000 0 000  000   000     000     000       000   000  000  000  0000  000   000  
// 000   000  000   000     000      0000000  000   000  000  000   000   0000000   

bool matchWin(HWND hWnd, DWORD pid, wchar_t* path, wchar_t* title, char* id)
{
    bool found = false;

    if (!id) return false;
    
    if (cmp(id, "all")) return true;

    wchar_t* wid = wstr(id);
    wchar_t buf[65];
    
    StringCbPrintfW(buf, 64, L"%ld", pid);
    if (lstrcmpi(wid, buf) == 0)
    {
        found = true;
    }
    
    StringCbPrintfW(buf, 64, L"%llx", hWnd);
    if (lstrcmpi(wid, buf) == 0)
    {
        found = true;
    }
    
    if (path && wstring(path).find(wid) != wstring::npos)
    {
        found = true;
    }

    if (title && wstring(title).find(wid) != wstring::npos)
    {
        found = true;
    }
    
    delete wid;
    return found;
}

static BOOL CALLBACK matchWindow(HWND hWnd, LPARAM param)
{
    if (!IsWindowVisible(hWnd)) return true;
    
    wchar_t* title = winTitle(hWnd);
    if (!title) return true;

    if (wcmp(title, "Program Manager"))
    {
        delete title;
        return false;
    }

    delete title;
    
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
    if (!EnumWindows(matchWindow, (LPARAM)&param))
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

HRESULT winInfo(HWND hWnd, char* id=NULL)
{    
    wchar_t* title = winTitle(hWnd);
    
    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);
    
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);

    DWORD pathSize = 10000;
    wchar_t path[10000];
    path[0] = 0;

    QueryFullProcessImageNameW(hProcess, 0, path, &pathSize);
    
    if (id == NULL || matchWin(hWnd, pid, path, title, id))
    {        
        wchar_t* status = L"normal";
        LONG style = GetWindowLongW(hWnd, GWL_STYLE);
        if    (!(style & WS_VISIBLE)) { status = L"hidden"; }
        else if (style & WS_MINIMIZE) { status = L"minimized"; }
        else if (style & WS_MAXIMIZE) { status = L"maximized"; }
        
        RECT rect; 
    
        GetWindowRect(hWnd, &rect);
        LONG width  = rect.right - rect.left;
        LONG height = rect.bottom - rect.top;
        LONG x = rect.left;
        LONG y = rect.top;
        
        int zindex = 0;
        HWND prevWnd = hWnd;
        HWND nextWnd;
        while (nextWnd = GetWindow(prevWnd, GW_HWNDPREV))
        {
            prevWnd = nextWnd;
            zindex += 1;
        }
        
        wprintf(L".\n");
        if (path)  wprintf(L"    path    %ls\n", path); 
        if (title) wprintf(L"    title   %ls\n", title);
        wprintf(L"    hwnd    %llx\n", (unsigned __int64)hWnd);
        wprintf(L"    pid     %lu\n", pid);
        wprintf(L"    x       %d\n", x);
        wprintf(L"    y       %d\n", y);
        wprintf(L"    width   %d\n", width);
        wprintf(L"    height  %d\n", height);
        wprintf(L"    zindex  %d\n", zindex);
        wprintf(L"    status  %ls\n", status);
	}
    delete title;
	return S_OK;
}

// 000  000   000  00000000   0000000   
// 000  0000  000  000       000   000  
// 000  000 0 000  000000    000   000  
// 000  000  0000  000       000   000  
// 000  000   000  000        0000000   

HRESULT info(char *id="all")
{
    HRESULT hr = S_OK;
    
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;

    for (HWND hWnd : wins)
    {
        winInfo(hWnd);
    }

    return hr;
}

// 00     00  000  000   000  00     00   0000000   000   000  
// 000   000  000  0000  000  000   000  000   000   000 000   
// 000000000  000  000 0 000  000000000  000000000    00000    
// 000 0 000  000  000  0000  000 0 000  000   000   000 000   
// 000   000  000  000   000  000   000  000   000  000   000  

HRESULT minimize(char *id)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        ShowWindow(hWnd, SW_MINIMIZE);
    }
    return S_OK;    
}

HRESULT maximize(char *id)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        ShowWindow(hWnd, SW_MAXIMIZE);
    }
    return S_OK;    
}

HRESULT restore(char *id)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        ShowWindow(hWnd, SW_RESTORE);
    }
    return S_OK;    
}

//  0000000  000       0000000    0000000  00000000  
// 000       000      000   000  000       000       
// 000       000      000   000  0000000   0000000   
// 000       000      000   000       000  000       
//  0000000  0000000   0000000   0000000   00000000  

HRESULT close(char *id)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
        
    if (wins.size() >= 1)
    {
        HWND hWnd = wins[0];

        ShowWindow(hWnd, SW_RESTORE);
        SetWindowPos(hWnd, HWND_TOPMOST,   0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
        SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
        
        keybd_event(VK_MENU, 0, 0, NULL);     // fake ALT press to enable foreground switch
        SetForegroundWindow(hWnd);            // ... no wonder windows is so bad
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, NULL);
        
        keybd_event(VK_MENU, 0, 0, NULL);
        keybd_event(VK_F4,   0, 0, NULL);
        keybd_event(VK_F4,   0, KEYEVENTF_KEYUP, NULL);
        keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, NULL);
    }
    return S_OK;    
}

// 00000000    0000000   000   0000000  00000000  
// 000   000  000   000  000  000       000       
// 0000000    000000000  000  0000000   0000000   
// 000   000  000   000  000       000  000       
// 000   000  000   000  000  0000000   00000000  

HRESULT raise(char *id)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        ShowWindow(hWnd, SW_RESTORE);
        // typical windows WTF :-)
        SetWindowPos(hWnd, HWND_TOPMOST,   0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
        SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE);
        
        // VK_MENU     = 0x12 # ALT key
        // KEYDOWN     = 1
        // KEYUP       = 3
//         
        // if win.minimized
            // user.RestoreWindow win.hwnd
//         
        // user.keybd_event VK_MENU, 0, KEYDOWN, null # fake ALT press to enable foreground switch
        // user.SetForegroundWindow win.hwnd          # ... no wonder windows is so bad
        // user.keybd_event VK_MENU, 0, KEYUP, null
    }
    return S_OK;    
}

// 00000000   0000000    0000000  000   000   0000000  
// 000       000   000  000       000   000  000       
// 000000    000   000  000       000   000  0000000   
// 000       000   000  000       000   000       000  
// 000        0000000    0000000   0000000   0000000   

HRESULT focus(char *id)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        ShowWindow(hWnd, SW_RESTORE);
        SetWindowPos(hWnd, HWND_TOPMOST,   0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        SetForegroundWindow(hWnd);
    }
    return S_OK;    
}

// 00000000  000  000   000  0000000    00000000  000  000      00000000  
// 000       000  0000  000  000   000  000       000  000      000       
// 000000    000  000 0 000  000   000  000000    000  000      0000000   
// 000       000  000  0000  000   000  000       000  000      000       
// 000       000  000   000  0000000    000       000  0000000  00000000  

bool FindFile(const wstring& directory, const wstring& filename, wstring& result)
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

            if (wwcmp(filename.c_str(), file.cFileName))
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
            if (FindFile(*iter, filename, result))
            {
                return true;
            }
        }
    }
    return false;
}

// 000       0000000   000   000  000   000   0000000  000   000  
// 000      000   000  000   000  0000  000  000       000   000  
// 000      000000000  000   000  000 0 000  000       000000000  
// 000      000   000  000   000  000  0000  000       000   000  
// 0000000  000   000   0000000   000   000   0000000  000   000  

HRESULT launch(char *path)
{
    vector<HWND> wins;
    char normpath[MAX_PATH];
    GetFullPathNameA(path, MAX_PATH, normpath, NULL);
    
    if (!FileExists(normpath) && PathIsRelativeA(path))
    {
        char fname[_MAX_FNAME];
        
        _splitpath_s(path, NULL, 0, NULL, 0, fname, _MAX_FNAME, NULL, 0);
    
        char file[MAX_PATH];
        sprintf_s(file, "%s.exe", fname);
        
        matchingWindows(file, &wins);

        if (wins.size() <= 0)
        {
            LPSTR lpFilePart;
            wstring wpath = s2ws(file);
            wstring found;

            if (SearchPathA(NULL, file, ".exe", MAX_PATH, normpath, &lpFilePart))
            {
                cout << "found in PATH " << normpath << endl;
            }
            else if (FindFile(L"C:\\Program Files", wpath, found))
            { 
                GetFullPathNameA(ws2s(found).c_str(), MAX_PATH, normpath, NULL);
            }
            else if (FindFile(L"C:\\Program Files (x86)", wpath, found))
            {
                GetFullPathNameA(ws2s(found).c_str(), MAX_PATH, normpath, NULL);
            }
            else
            {
                cerr << "can't find " << path << endl;
            }
        }
        else
        {
            strcpy_s(normpath, file);
        }
    }

    if (SUCCEEDED(matchingWindows(normpath, &wins))) 
    {
        if (wins.size())
        {
            cout << "matching " << normpath << " " << wins.size() << endl;
            for (HWND hWnd : wins)
            {
                ShowWindow(hWnd, SW_RESTORE);
                SetWindowPos(hWnd, HWND_TOPMOST,   0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
                SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
                SetForegroundWindow(hWnd);
            }
            return S_OK;        
        }
    }
    
    STARTUPINFOA info={sizeof(info)};
    PROCESS_INFORMATION processInfo;
    
    if (!CreateProcessA(normpath, NULL, NULL, NULL, TRUE, CREATE_NEW_CONSOLE, NULL, NULL, &info, &processInfo))
    {
        cerr << "can't launch " << normpath << endl;
        return S_FALSE;
    }
    cout << normpath << endl;
    return S_OK;
}

// 0000000     0000000   000   000  000   000  0000000     0000000  
// 000   000  000   000  000   000  0000  000  000   000  000       
// 0000000    000   000  000   000  000 0 000  000   000  0000000   
// 000   000  000   000  000   000  000  0000  000   000       000  
// 0000000     0000000    0000000   000   000  0000000    0000000   

HRESULT bounds(char *id, char *x, char *y, char *w, char *h)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        SetWindowPos(hWnd, NULL, atoi(x), atoi(y), atoi(w), atoi(h), SWP_NOZORDER);
    }
    return S_OK;
}

// 00     00   0000000   000   000   0000000  00000000  
// 000   000  000   000  000   000  000       000       
// 000000000  000   000  000   000  0000000   0000000   
// 000 0 000  000   000  000   000       000  000       
// 000   000   0000000    0000000   0000000   00000000  

HRESULT mouse()
{
    POINT p;
    GetCursorPos(&p);
    cout << "x   " << p.x << endl; 
    cout << "y   " << p.y << endl;
    return S_OK;
}

// 000   000  00000000  000   000  
// 000  000   000        000 000   
// 0000000    0000000     00000    
// 000  000   000          000     
// 000   000  00000000     000     

void keyEvent(const char* key, int type=0)
{
    if      (cmp(key, "alt"))   keybd_event(VK_MENU,    0, type, NULL);
    else if (cmp(key, "shift")) keybd_event(VK_SHIFT,   0, type, NULL);
    else if (cmp(key, "ctrl"))  keybd_event(VK_CONTROL, 0, type, NULL);
    else if (cmp(key, "tab"))   keybd_event(VK_TAB,     0, type, NULL);
    else if (cmp(key, "a"))     keybd_event((BYTE)VkKeyScan('A'), 0x9e, type, NULL);
    else if (cmp(key, "b"))     keybd_event((BYTE)VkKeyScan('B'), 0xb0, type, NULL);
    else if (cmp(key, "c"))     keybd_event((BYTE)VkKeyScan('C'), 0xae, type, NULL);
    else if (cmp(key, "d"))     keybd_event((BYTE)VkKeyScan('D'), 0xa0, type, NULL);
    else if (cmp(key, "e"))     keybd_event((BYTE)VkKeyScan('E'), 0x92, type, NULL);
    else if (cmp(key, "f"))     keybd_event((BYTE)VkKeyScan('F'), 0xa1, type, NULL);
    else if (cmp(key, "g"))     keybd_event((BYTE)VkKeyScan('G'), 0xa2, type, NULL);
    else if (cmp(key, "h"))     keybd_event((BYTE)VkKeyScan('H'), 0xa3, type, NULL);
    else if (cmp(key, "i"))     keybd_event((BYTE)VkKeyScan('I'), 0x97, type, NULL);
    else if (cmp(key, "j"))     keybd_event((BYTE)VkKeyScan('J'), 0xa4, type, NULL);
    else if (cmp(key, "k"))     keybd_event((BYTE)VkKeyScan('K'), 0xa5, type, NULL);
    else if (cmp(key, "l"))     keybd_event((BYTE)VkKeyScan('L'), 0xa6, type, NULL);
    else if (cmp(key, "m"))     keybd_event((BYTE)VkKeyScan('M'), 0xb2, type, NULL);
    else if (cmp(key, "n"))     keybd_event((BYTE)VkKeyScan('N'), 0xb1, type, NULL);
    else if (cmp(key, "o"))     keybd_event((BYTE)VkKeyScan('O'), 0x98, type, NULL);
    else if (cmp(key, "p"))     keybd_event((BYTE)VkKeyScan('P'), 0x99, type, NULL);
    else if (cmp(key, "q"))     keybd_event((BYTE)VkKeyScan('Q'), 0x90, type, NULL);
    else if (cmp(key, "r"))     keybd_event((BYTE)VkKeyScan('R'), 0x93, type, NULL);
    else if (cmp(key, "s"))     keybd_event((BYTE)VkKeyScan('S'), 0x9f, type, NULL);
    else if (cmp(key, "t"))     keybd_event((BYTE)VkKeyScan('T'), 0x94, type, NULL);
    else if (cmp(key, "u"))     keybd_event((BYTE)VkKeyScan('U'), 0x96, type, NULL);
    else if (cmp(key, "v"))     keybd_event((BYTE)VkKeyScan('V'), 0xaf, type, NULL);
    else if (cmp(key, "w"))     keybd_event((BYTE)VkKeyScan('W'), 0x91, type, NULL);
    else if (cmp(key, "x"))     keybd_event((BYTE)VkKeyScan('X'), 0xad, type, NULL);
    else if (cmp(key, "y"))     keybd_event((BYTE)VkKeyScan('Y'), 0x95, type, NULL);
    else if (cmp(key, "z"))     keybd_event((BYTE)VkKeyScan('Z'), 0xac, type, NULL);
}

HRESULT key(char* id, char* upDownOrTap)
{
    bool tap = cmp(upDownOrTap, "tap");
    
    if (tap || cmp(upDownOrTap, "down"))
    {    
        istringstream iss(id);
        string str;    
        while (getline(iss, str, '+')) 
        {
            keyEvent(str.c_str(), 0);
        }
    }

    if (tap || cmp(upDownOrTap, "up"))
    {    
        istringstream iss(id);
        string str;    
        while (getline(iss, str, '+')) 
        {
            keyEvent(str.c_str(), KEYEVENTF_KEYUP);
        }
    }
    
    return S_OK;
}

// 000000000   0000000    0000000  000   000  0000000     0000000   00000000   
//    000     000   000  000       000  000   000   000  000   000  000   000  
//    000     000000000  0000000   0000000    0000000    000000000  0000000    
//    000     000   000       000  000  000   000   000  000   000  000   000  
//    000     000   000  0000000   000   000  0000000    000   000  000   000  

bool taskbarIsHidden()
{
    HWND hWnd = FindWindow(L"Shell_TrayWnd", L"");
    LONG style = GetWindowLongW(hWnd, GWL_STYLE);
    return !(style & WS_VISIBLE);
}

HRESULT taskbar(char* id)
{
    BOOL bShowTaskBar = true;
    
    if (cmp(id, "hide"))
    {
        bShowTaskBar = false;
    }
    else if (cmp(id, "toggle"))
    {
        bShowTaskBar = taskbarIsHidden();
    }

    static int nTaskBarPosition = 0;

    RECT rcWorkArea;
    RECT rcTaskBar;

    HWND hTaskBar = FindWindow(L"Shell_TrayWnd", L"");
    GetWindowRect(hTaskBar, &rcTaskBar);

    if (hTaskBar)
    {
        SystemParametersInfo(SPI_GETWORKAREA,0,(LPVOID)&rcWorkArea,0);
        int nWidth  = ::GetSystemMetrics(SM_CXSCREEN);
        int nHeight = ::GetSystemMetrics(SM_CYSCREEN);
        
        if (bShowTaskBar)
        {
            switch(nTaskBarPosition)
            {
                case 0:
                    rcWorkArea.bottom -= rcTaskBar.bottom - rcTaskBar.top;
                    break;
                case 1:
                    rcWorkArea.left += rcTaskBar.right - rcTaskBar.left;
                    break;
                case 2:
                    rcWorkArea.right -= rcTaskBar.right - rcTaskBar.left;
                    break;
                case 3:
                    rcWorkArea.top += rcTaskBar.bottom - rcTaskBar.top;
                    break;
            }
            SystemParametersInfo(SPI_SETWORKAREA,0,(LPVOID)&rcWorkArea,0);
            ShowWindow(hTaskBar, SW_SHOW);
        }
        else
        {
            if      (rcWorkArea.left!=0) nTaskBarPosition = 1;
            else if (rcWorkArea.top!=0)  nTaskBarPosition = 3;
            else if ((rcWorkArea.right-rcWorkArea.left)<nWidth)  nTaskBarPosition = 2;
            else if ((rcWorkArea.bottom-rcWorkArea.top)<nHeight) nTaskBarPosition = 0;

            rcWorkArea.left   = 0;
            rcWorkArea.top    = 0;
            rcWorkArea.bottom = nHeight;
            rcWorkArea.right  = nWidth;
            SystemParametersInfo(SPI_SETWORKAREA,0,(LPVOID)&rcWorkArea,0);
            ShowWindow(hTaskBar, SW_HIDE);
        }
    }
    else
    {
        return S_FALSE;
    }

    return S_OK;
}

//  0000000   0000000  00000000   00000000  00000000  000   000  
// 000       000       000   000  000       000       0000  000  
// 0000000   000       0000000    0000000   0000000   000 0 000  
//      000  000       000   000  000       000       000  0000  
// 0000000    0000000  000   000  00000000  00000000  000   000  

HRESULT screen(char *id="size")
{
    HRESULT hr = S_OK;
    
    if (cmp(id, "size") || taskbarIsHidden())
    {
        cout << "width   " << GetSystemMetrics(SM_CXSCREEN) << endl; 
        cout << "height  " << GetSystemMetrics(SM_CYSCREEN) << endl;

        // cout << GetSystemMetrics(SM_CXBORDER) << " " << GetSystemMetrics(SM_CYBORDER) << endl;
        // cout << GetSystemMetrics(SM_CXMIN) << " " << GetSystemMetrics(SM_CYMIN) << endl;
        // cout << GetSystemMetrics(SM_CXSIZE) << " " << GetSystemMetrics(SM_CYSIZE) << endl;
        // cout << GetSystemMetrics(SM_CXFRAME) << " " << GetSystemMetrics(SM_CYFRAME) << endl;
        // cout << GetSystemMetrics(SM_CXDLGFRAME) << " " << GetSystemMetrics(SM_CYDLGFRAME) << endl;
	}
    else if (cmp(id, "user"))
    {
        RECT rect;
        SystemParametersInfoW(SPI_GETWORKAREA, 0, &rect, 0);
        // cout << rect.right-rect.left << " " << rect.bottom-rect.top << endl;
        cout << "width   " << rect.right-rect.left << endl; 
        cout << "height  " << rect.bottom-rect.top << endl;
    }
    else 
    {
        cerr << "unknown screen argument " << id << endl;
        hr = S_FALSE;
    }

    return hr;
}

// 00000000   0000000   000      0000000    00000000  00000000   
// 000       000   000  000      000   000  000       000   000  
// 000000    000   000  000      000   000  0000000   0000000    
// 000       000   000  000      000   000  000       000   000  
// 000        0000000   0000000  0000000    00000000  000   000  

HRESULT folder(char *id)
{
    PWSTR path = NULL;
    HRESULT hr = S_OK; 
    
    if      (cmp(id, "AppData"))    { hr = SHGetKnownFolderPath(FOLDERID_RoamingAppData,  0, NULL, &path); }
    else if (cmp(id, "Desktop"))    { hr = SHGetKnownFolderPath(FOLDERID_Desktop,         0, NULL, &path); }
    else if (cmp(id, "Documents"))  { hr = SHGetKnownFolderPath(FOLDERID_Documents,       0, NULL, &path); }
    else if (cmp(id, "Downloads"))  { hr = SHGetKnownFolderPath(FOLDERID_Downloads,       0, NULL, &path); }
    else if (cmp(id, "Fonts"))      { hr = SHGetKnownFolderPath(FOLDERID_Fonts,           0, NULL, &path); }
    else if (cmp(id, "Program"))    { hr = SHGetKnownFolderPath(FOLDERID_ProgramFiles,    0, NULL, &path); }
    else if (cmp(id, "ProgramX86")) { hr = SHGetKnownFolderPath(FOLDERID_ProgramFilesX86, 0, NULL, &path); }
    else if (cmp(id, "Startup"))    { hr = SHGetKnownFolderPath(FOLDERID_Startup,         0, NULL, &path); }
    else
    {
        cerr << "ERROR: invalid folder name " << id << endl;
        return S_FALSE;
    }

    if (SUCCEEDED(hr) && path) 
    {
        wprintf(L"%ls\n", path);
    }
    else
    {
        cerr << "ERROR: can't get folder " << id << endl; 
        hr = S_FALSE;
    }

    CoTaskMemFree(path);
    
    return hr;
}

// 000000000  00000000    0000000    0000000  000   000  
//    000     000   000  000   000  000       000   000  
//    000     0000000    000000000  0000000   000000000  
//    000     000   000  000   000       000  000   000  
//    000     000   000  000   000  0000000   000   000  

HRESULT trash(char* action)
{
    HRESULT hr = S_OK;
    LPSHELLFOLDER pDesktop       = NULL;
    LPITEMIDLIST  pidlRecycleBin = NULL;
    LPITEMIDLIST  pidl           = NULL;

    SHGetDesktopFolder(&pDesktop);
    SHGetSpecialFolderLocation (NULL, CSIDL_BITBUCKET, &pidlRecycleBin);
    
    LPSHELLFOLDER pRecycleBin;
    pDesktop->BindToObject(pidlRecycleBin, NULL, IID_IShellFolder, (LPVOID *)&pRecycleBin);

    if (cmp(action, "name"))
    {
        STRRET strRet;
        if (SUCCEEDED(hr = pDesktop->GetDisplayNameOf(pidlRecycleBin, SHGDN_NORMAL, &strRet)))
        {
            wcout << strRet.pOleStr << endl;
        }
    }
    else if (cmp(action, "list"))
    {
        IEnumIDList *penumFiles;
        
        if (SUCCEEDED(hr = pRecycleBin->EnumObjects(NULL, SHCONTF_FOLDERS|SHCONTF_NONFOLDERS|SHCONTF_INCLUDEHIDDEN, &penumFiles)))
        {
            while (penumFiles->Next(1, &pidl, NULL) != S_FALSE)
            {
                STRRET strRet;
                if (SUCCEEDED(hr = pDesktop->GetDisplayNameOf(pidl, SHGDN_NORMAL, &strRet)))
                {
                    wcout << strRet.pOleStr << endl;
                }
            }
        }
    }
    else if (cmp(action, "count"))
    {
        IEnumIDList *penumFiles;
        
        if (SUCCEEDED(hr = pRecycleBin->EnumObjects(NULL, SHCONTF_FOLDERS|SHCONTF_NONFOLDERS|SHCONTF_INCLUDEHIDDEN, &penumFiles)))
        {
            int num = 0;
            while (penumFiles->Next(1, &pidl, NULL) != S_FALSE) num++;
            cout << num << endl;
        }
    }
    else if (cmp(action, "empty"))
    {
        hr = SHEmptyRecycleBinA(NULL, NULL, SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI);
    }
    else if (SUCCEEDED(hr = CoInitialize(NULL)))
    {
        IFileOperation* op;

        if (SUCCEEDED(hr = CoCreateInstance(CLSID_FileOperation, NULL, CLSCTX_ALL, IID_IFileOperation, (void**)& op)))
        {
            if (SUCCEEDED(hr = op->SetOperationFlags(FOFX_ADDUNDORECORD | FOFX_RECYCLEONDELETE | FOF_NOERRORUI | FOF_NOCONFIRMATION | FOFX_EARLYFAILURE)))
            {
                PCWSTR path = wstr(action);
                
                int len = GetFullPathName(path, 0, NULL, NULL);

                if (len)
                {
                    wchar_t* buf = (wchar_t*)malloc((len + 1) * sizeof(wchar_t));

                    GetFullPathName(path, len, buf, NULL);

                    LPITEMIDLIST idlist = ILCreateFromPathW(buf);
                    IShellItem* item;
                    if (SUCCEEDED(hr = SHCreateShellItem(NULL, NULL, idlist, &item)))
                    {
                        if (SUCCEEDED(hr = op->DeleteItems((IUnknown*)item)))
                        {
                            hr = op->PerformOperations();
                        }
                    }
                    else
                    {
                        cerr << "can't find " << action << endl;
                    }
                    ILFree(idlist);
                    free(buf);
                }
                else
                {
                    hr = S_FALSE;
                }
                delete path;
            }
        }
        op->Release();
    }
    return hr;
}

// 00000000   000   000   0000000   
// 000   000  0000  000  000        
// 00000000   000 0 000  000  0000  
// 000        000  0000  000   000  
// 000        000   000   0000000   

bool saveBitmap(Bitmap* bitmap, const char* targetfile)
{
    CLSID clsID;
    CLSIDFromString(L"{557cf406-1a04-11d3-9a73-0000f81ef32e}", &clsID); //GetEncoderClsid(L"image/png", &clsID);

	char normpath[MAX_PATH];
    char lname[_MAX_DRIVE + 1];
    char dname[_MAX_DIR + 1];
    _splitpath_s(targetfile, lname, _MAX_DRIVE, dname, _MAX_DIR, NULL, 0, NULL, 0);
    char targetdir[MAX_PATH];
    sprintf_s(targetdir, "%s%s", lname, dname);

	if (strlen(targetdir))
	{ 
		GetFullPathNameA(targetdir, MAX_PATH, normpath, NULL);

		normpath[strlen(normpath) - 1] = 0;
		if (!DirExists(normpath))
		{
			if ((ERROR_SUCCESS != SHCreateDirectoryExA(0, normpath, 0)))
			{
				cerr << "can't create " << normpath << endl;
				return false;
			}
		}
	}

    GetFullPathNameA(targetfile, MAX_PATH, normpath, NULL);
	if (Ok == bitmap->Save(s2ws(normpath).c_str(), &clsID))
	{
		cout << "saved " << normpath << endl;
		return true;
	}
	else
	{
		cerr << "can't save " << normpath << endl;
		return false;
	}
}

bool saveBitmap(HBITMAP hbitmap, const char* targetfile)
{
    Bitmap bmp(hbitmap, NULL);
    return saveBitmap(&bmp, targetfile);
}

//  0000000   0000000  00000000   00000000  00000000  000   000   0000000  000   000   0000000   000000000  
// 000       000       000   000  000       000       0000  000  000       000   000  000   000     000     
// 0000000   000       0000000    0000000   0000000   000 0 000  0000000   000000000  000   000     000     
//      000  000       000   000  000       000       000  0000       000  000   000  000   000     000     
// 0000000    0000000  000   000  00000000  00000000  000   000  0000000   000   000   0000000      000     

HRESULT screenshot(char *targetfile="screenshot.png")
{
    CoInitialize(NULL);

    ULONG_PTR token;
    GdiplusStartupInput tmp;
    GdiplusStartup(&token, &tmp, NULL);

    RECT rc; rc.left = 0; rc.right = 0;
    rc.right  = GetSystemMetrics(SM_CXSCREEN); 
    rc.bottom = GetSystemMetrics(SM_CYSCREEN); 
        
    auto hdc = GetDC(0);
    auto hbitmap = CreateCompatibleBitmap(hdc, rc.right, rc.bottom);
    auto memdc = CreateCompatibleDC(hdc);
    auto oldbmp = SelectObject(memdc, hbitmap);
    BitBlt(memdc, 0, 0, rc.right, rc.bottom, hdc, 0, 0, SRCCOPY);
    SelectObject(memdc, oldbmp);
    DeleteDC(memdc);
    ReleaseDC(0, hdc);

    bool saved = saveBitmap(hbitmap, targetfile);

    DeleteObject(hbitmap);

    GdiplusShutdown(token);
    CoUninitialize();
    
    return saved ? S_OK : S_FALSE;
}

// 000   0000000   0000000   000   000  
// 000  000       000   000  0000  000  
// 000  000       000   000  000 0 000  
// 000  000       000   000  000  0000  
// 000   0000000   0000000   000   000  

HBITMAP iconToBitmap(HICON hIcon, int x, int y)
{
    HDC hDC = GetDC(0);
    HDC hMemDC = CreateCompatibleDC(hDC);

    VOID* pvBits;
    BITMAPINFO bmi;
    ZeroMemory(&bmi, sizeof(BITMAPINFO));

    bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
    bmi.bmiHeader.biWidth = x;
    bmi.bmiHeader.biHeight = -y;
    bmi.bmiHeader.biPlanes = 1;
    bmi.bmiHeader.biBitCount = 32;
    bmi.bmiHeader.biCompression = BI_RGB;
    bmi.bmiHeader.biSizeImage = x * y * 4;

    HBITMAP hBitmap;
    if (hBitmap = CreateDIBSection(hDC, &bmi, DIB_RGB_COLORS, &pvBits, NULL, 0x0))
    { 
        HGDIOBJ hOrgBMP = SelectObject(hMemDC, hBitmap);
        DrawIconEx(hMemDC, 0, 0, hIcon, x, y, 0, NULL, DI_NORMAL);
        SelectObject(hMemDC, hOrgBMP);
    }

    DeleteDC(hMemDC);
    ReleaseDC(NULL, hDC);
    return hBitmap;
}

bool saveIcon (HICON hIcon, char* pngfile) 
{
    ICONINFO icon_info = { 0 };
    GetIconInfo(hIcon, &icon_info);

    BITMAP bm = { 0 };
    
    int w=0, h=0;

    if (icon_info.hbmColor && GetObject(icon_info.hbmColor, sizeof(bm), &bm))
    {
        w = bm.bmWidth;
        h = bm.bmHeight;
    }

    HBITMAP hBitmap = iconToBitmap(hIcon, w, h);
        
    BITMAP source_info = { 0 };
    GetObject(hBitmap, sizeof(source_info), &source_info);

    Status s = Ok;

    Bitmap* bmp = new Bitmap(w, h, PixelFormat32bppARGB);

    BitmapData target_info = { 0 };
    Rect rect(0, 0, w, h);

    s = bmp->LockBits(&rect, ImageLockModeWrite, PixelFormat32bppARGB, &target_info);

    CopyMemory(target_info.Scan0, source_info.bmBits, w * h * 4);

    s = bmp->UnlockBits(&target_info);

    bool saved = saveBitmap(bmp, pngfile);
        
    DestroyIcon(hIcon);
    DeleteObject(hBitmap);
    DeleteObject(bmp);
        
    return saved;
}
        
HRESULT icon(char* id, char* targetfile=NULL)
{
    HRESULT hr = S_OK;
 
    char normpath[MAX_PATH];
    GetFullPathNameA(id, MAX_PATH, normpath, NULL);
    
    CoInitialize(NULL);

    ULONG_PTR token;
    GdiplusStartupInput tmp;
    GdiplusStartup(&token, &tmp, NULL);
    
    char pngfile[MAX_PATH];
    
    if (targetfile && strlen(targetfile))
    {
        strcpy_s(pngfile, targetfile);
    }
    else
    {
        char fname[_MAX_FNAME];
        _splitpath_s(normpath, NULL, 0, NULL, 0, fname, _MAX_FNAME, NULL, 0);
        sprintf_s(pngfile, "%s.png", fname);
    }
    
    if (!FileExists(normpath))
    {
        cout << "can't find " << normpath << ", icon will be generic." << endl;
    }

    SHFILEINFOA shfi;
    if (SHGetFileInfoA(normpath, FILE_ATTRIBUTE_NORMAL, &shfi, sizeof(SHFILEINFO), SHGFI_USEFILEATTRIBUTES | SHGFI_ICON | SHGFI_SYSICONINDEX))
    {
        IImageList *imageList;
        if (SUCCEEDED(hr = SHGetImageList(SHIL_JUMBO, IID_IImageList, (void**)&imageList)))
        {
            IMAGEINFO iinfo = { 0 };
            int count = 0;
            imageList->GetImageCount(&count);

            if (shfi.iIcon < count)
            {
                HICON hIcon;
                if (SUCCEEDED(hr = imageList->GetIcon(shfi.iIcon, ILD_TRANSPARENT, &hIcon)))
                {
                    if (!saveIcon(hIcon, pngfile))
                    {
                        hr = S_FALSE;
                    }
                }
            }
            else
            {
                cerr << "invalid icon index " << shfi.iIcon << " " << count << endl; hr = S_FALSE; 
            }
        }
        else if (shfi.hIcon)
        {
            if (!saveIcon(shfi.hIcon, pngfile))
            {
                hr = S_FALSE;
            }
        }
        else
        {
            cerr << "can't find icon " << normpath << endl; hr = S_FALSE;            
        }
    }
    else
    {
        cerr << "can't get file info " << normpath << endl; hr = S_FALSE;
    }
    
    GdiplusShutdown(token);
    CoUninitialize();
    
    return hr;
}

// 000   000   0000000   0000000    0000000   00000000  
// 000   000  000       000   000  000        000       
// 000   000  0000000   000000000  000  0000  0000000   
// 000   000       000  000   000  000   000  000       
//  0000000   0000000   000   000   0000000   00000000  

HRESULT usage(void)
{
    klog("");
    klog("wxw [command] [args...]");
    klog("");
    klog("    commands:");
    klog("");
    klog("         info       [id|title]");
    klog("         raise       id");
    klog("         minimize    id");
    klog("         maximize    id");
    klog("         restore     id");
    klog("         focus       id");
    klog("         close       id");
    klog("         bounds      id x y w h");
    klog("         launch      path");
    klog("         mouse");
    klog("         key        [shift+|ctrl+|alt+]key");
    klog("         help        command");
    klog("         folder      name");
    klog("         trash       count|empty");
    klog("         taskbar     hide|show|toggle");
    klog("         screen     [size|user]");
    klog("         screenshot [targetfile]");
    klog("         icon        path [targetfile]");
    klog("");
    klog("    id:");
    klog("");
    klog("         process id");
    klog("         executable path");
    klog("         window handle");
    klog("         nickname");
    klog("");    
    klog("    nickname:");
    klog("");    
    klog("         top|topmost|front|frontmost|foreground");
    klog("         taskbar");
    klog("");
    return S_OK;
}

// 000   000  00000000  000      00000000   
// 000   000  000       000      000   000  
// 000000000  0000000   000      00000000   
// 000   000  000       000      000        
// 000   000  00000000  0000000  000        

HRESULT help(char *command)
{
    klog("");
    
    if (cmp(command, "info"))
    {
        klog("wxw info [pid|path|hwnd|nick|title]");
        klog("");
        klog("      Print information about windows");
        klog("");
    }
    else if (cmp(command, "raise"))
    {
        klog("wxw raise pid|path|hwnd|nick");
        klog("");
        klog("      Raise window(s)");
        klog("");
    }
    else if (cmp(command, "minimize"))
    {
        klog("wxw minimize pid|path|hwnd|nick");
        klog("");
        klog("      Minimize window(s)");
        klog("");
    }
    else if (cmp(command, "maximize"))
    {
        klog("wxw maximize pid|path|hwnd|nick");
        klog("");
        klog("      Maximize window(s)");
        klog("");
    }
    else if (cmp(command, "restore"))
    {
        klog("wxw restore pid|path|hwnd|nick");
        klog("");
        klog("      Restore window(s)");
        klog("");
    }
    else if (cmp(command, "focus"))
    {
        klog("wxw focus pid|path|hwnd|nick");
        klog("");
        klog("      Focus window(s)");
        klog("");
    }
    else if (cmp(command, "close"))
    {
        klog("wxw close pid|path|hwnd|nick");
        klog("");
        klog("      Close window(s)");
        klog("");
    }
    else if (cmp(command, "launch"))
    {
        klog("wxw launch path");
        klog("");
        klog("      Start application if it is not running.");
        klog("      Activate windows if application is running.");
        klog("");
        klog("      Search PATH and Program File folders if local path doesn't exist.");
        klog("");
    }
    else if (cmp(command, "taskbar"))
    {
        klog("wxw taskbar hide|show|toggle");
        klog("");
        klog("      Show or hide the taskbar");
        klog("");
    }
    else if (cmp(command, "folder"))
    {
        klog("wxw folder name");
        klog("");
        klog("Print the path of specific folders, recognized names are:");
        klog("");
        klog("      AppData");
        klog("      Desktop");
        klog("      Documents");
        klog("      Downloads");
        klog("      Fonts");
        klog("      Program");
        klog("      ProgramX86");
        klog("      Startup");
    }
    else if (cmp(command, "key"))
    {
        klog("wxw key [ctrl+|shift+|alt+]key");
        klog("");
        klog("      Simulate key press");
    }
    else if (cmp(command, "mouse"))
    {
        klog("wxw mouse");
        klog("");
        klog("      Print current mouse position");
    }
    else if (cmp(command, "screen"))
    {
        klog("wxw screen [size|user]");
        klog("");
        klog("      size        Print size of screen in pixels");
        klog("      user        Print size of screen without taskbar");
    }
    else if (cmp(command, "screenshot"))
    {
        klog("wxw screenshot [targetfile]");
        klog("");
        klog("      targetfile defaults to './screenshot.png'");
        klog("");
        klog("Take a screenshot of the main monitor and save it as a png file.");
    }
    else if (cmp(command, "icon"))
    {
        klog("wxw icon path [targetfile]");
        klog("");
        klog("      targetfile defaults to './<file>.png'");
        klog("");
        klog("Save icon of file as a png.");
    }
    else if (cmp(command, "trash"))
    {
        klog("wxw trash action");
        klog("");
        klog("      actions:");
        klog("");
        klog("          list      Print names of files in thrash bin");
        klog("          count     Print number of files in thrash bin");
        klog("          name      Print name of thrash bin");
        klog("          empty     Empty the thrash bin");
    }
    else
    {
        printf("no help available for %s", command);
    }
    
    klog("");
    return S_OK;
}

// 000   000  000  000   000  00     00   0000000   000  000   000  
// 000 0 000  000  0000  000  000   000  000   000  000  0000  000  
// 000000000  000  000 0 000  000000000  000000000  000  000 0 000  
// 000   000  000  000  0000  000 0 000  000   000  000  000  0000  
// 00     00  000  000   000  000   000  000   000  000  000   000  

int WINAPI WinMain( __in HINSTANCE hInstance, __in_opt HINSTANCE hPrevInstance, __in_opt LPSTR lpCmdLine, __in int nShowCmd )
{
    int argc    = __argc;
    char** argv = __argv;

    HRESULT hr = S_OK;

    if (argc < 2)
    {
        return usage();
    }
    
    char* cmd = argv[1];
    
    if (cmp(cmd, "help"))
    {
        if (argc == 2) hr = usage();
        else           hr = help(argv[2]);
    }
    else if (cmp(cmd, "info"))
    {
        if (argc == 2) hr = info();
        else           hr = info(argv[2]);
    }
	else if (cmp(cmd, "raise"))
	{
		if (argc == 2) hr = help(cmd);
		else           hr = raise(argv[2]);
	}
    else if (cmp(cmd, "minimize"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = minimize(argv[2]);
    }
    else if (cmp(cmd, "maximize"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = maximize(argv[2]);
    }
    else if (cmp(cmd, "restore"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = restore(argv[2]);
    }
    else if (cmp(cmd, "focus"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = focus(argv[2]);
    }
    else if (cmp(cmd, "launch"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = launch(argv[2]);
    }
    else if (cmp(cmd, "close"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = close(argv[2]);
    }
    else if (cmp(cmd, "bounds"))
    {
        if (argc < 7)  hr = help(cmd);
        else           hr = bounds(argv[2], argv[3], argv[4], argv[5], argv[6]);
    }
	else if (cmp(cmd, "folder"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = folder(argv[2]);
    }
    else if (cmp(cmd, "taskbar"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = taskbar(argv[2]);
    }
    else if (cmp(cmd, "screenshot"))
    {
        if (argc == 2) hr = screenshot();
        else           hr = screenshot(argv[2]);
    }
    else if (cmp(cmd, "screen"))
    {
        if (argc == 2) hr = screen("size");
        else           hr = screen(argv[2]);
    }
    else if (cmp(cmd, "icon"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = icon(argv[2], (argc >= 4) ? argv[3] : NULL);
    }
    else if (cmp(cmd, "key"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = key(argv[2], (argc >= 4) ? argv[3] : "tap");
    }
    else if (cmp(cmd, "mouse"))
    {
        hr = mouse();
    }
    else if (cmp(cmd, "trash"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = trash(argv[2]);
    }
    else
    {
        cerr << "unknown command " << cmd << endl;
    }
    
    if (!SUCCEEDED(hr))
    {
        cerr << "command failed" << endl;
    }

    return hr;
}
