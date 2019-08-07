/*
000   000   0000000    
000 0 000  000         
000000000  000         
000   000  000         
00     00   0000000    
*/

#include <shellscalingapi.h>
#include <WinUser.h>
#include <shlwapi.h>
#include <mmdeviceapi.h>
#include <endpointvolume.h> 
#include <math.h>
#include <set>
#include "taskbar.h"
#include "handle.h"
#include "trash.h"
#include "icon.h"
#include "kutl.h"
#include "hook.h"
#include "wins.h"

// 00000000   00000000    0000000    0000000  
// 000   000  000   000  000   000  000       
// 00000000   0000000    000   000  000       
// 000        000   000  000   000  000       
// 000        000   000   0000000    0000000  

HRESULT proclist(char* id=NULL)
{ 
    for (auto info : procs(id))
    {
        printf(".\n");
        printf("    path    %s\n",  info.path.c_str());
        printf("    pid     %lu\n", info.pid);
        printf("    parent  %lu\n", info.parent);
    }
    
    return S_OK;
}

// 000  000   000  00000000   0000000   
// 000  0000  000  000       000   000  
// 000  000 0 000  000000    000   000  
// 000  000  0000  000       000   000  
// 000  000   000  000        0000000   

HRESULT info(char *id="all")
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;

    for (HWND hWnd : wins)
    {
        winfo i = winInfo(hWnd);
         printf(".\n");
         printf( "    path    %s\n",  i.path.c_str()); 
        wprintf(L"    title   %ls\n", i.title.c_str());
         printf( "    hwnd    %s\n",  i.hwnd.c_str());
         printf( "    pid     %lu\n", i.pid);
         printf( "    x       %d\n",  i.x);
         printf( "    y       %d\n",  i.y);
         printf( "    width   %d\n",  i.width);
         printf( "    height  %d\n",  i.height);
         printf( "    zindex  %d\n",  i.zindex);
         printf( "    status  %s\n",  i.status.c_str());
    }

    return S_OK;
}

// 00     00  000  000   000  000  00     00   0000000   000   000  000  
// 000   000  000  0000  000  000  000   000  000   000   000 000   000  
// 000000000  000  000 0 000  000  000000000  000000000    00000    000  
// 000 0 000  000  000  0000  000  000 0 000  000   000   000 000   000  
// 000   000  000  000   000  000  000   000  000   000  000   000  000  

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
    if (!SUCCEEDED(matchingWindows(id, &wins))) 
    {
        cerr << "no match " << id << endl;
        return S_FALSE;
    }
        
    if (wins.size() >= 1)
    {
        for (HWND win : wins)
        {
            PostMessage(win, WM_CLOSE, 0, 0);
        }        
    }
    return S_OK;    
}

// 000000000  00000000  00000000   00     00  000  000   000   0000000   000000000  00000000  
//    000     000       000   000  000   000  000  0000  000  000   000     000     000       
//    000     0000000   0000000    000000000  000  000 0 000  000000000     000     0000000   
//    000     000       000   000  000 0 000  000  000  0000  000   000     000     000       
//    000     00000000  000   000  000   000  000  000   000  000   000     000     00000000  

HRESULT terminate(char* id)
{
    if (!id) 
    {
        cerr << "no path or pid?" << endl;
        return S_FALSE;
    }
    
    vector<procinfo> infos = procs(id);
        
    if (infos.size())
    {
        for (auto info : infos)
        {
            if (!cmp(fileName(info.path).c_str(), "explorer"))
            {
                terminateProc(info.pid);
            }
        }
        
        return S_OK;
    }
 
    cerr << "no match " << id << endl;
    return S_FALSE;
}

//  0000000   000   000  000  000000000  
// 000   000  000   000  000     000     
// 000 00 00  000   000  000     000     
// 000 0000   000   000  000     000     
//  00000 00   0000000   000     000     

HRESULT quit(char *id)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins)) || wins.size() == 0) 
    {        
        return terminate(id);
    }
    
    set<DWORD> threadids;
    set<DWORD> procids;
    for (HWND win : wins)
    {
        DWORD procid;
        threadids.insert(GetWindowThreadProcessId(win, &procid));
        procids.insert (procid);
        PostMessage(win, WM_CLOSE, 0, 0);
    }

    for (DWORD threadid : threadids)
    {
        PostThreadMessage(threadid, WM_QUIT, 0, 0);
    }
    
    for (DWORD procid : procids)
    {
        string path = procPath(procid);
        if (cmp(fileName(path).c_str(), "explorer"))
        {
            // cout << "skip explorer " << path << endl;
            continue;
        }
    
        terminateProc(procid);            
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
        
        // VK_MENU     = 0x12 # ALT key
        // KEYDOWN     = 1
        // KEYUP       = 3

        // if win.minimized
            // user.RestoreWindow win.hwnd

        // user.keybd_event VK_MENU, 0, KEYDOWN, null # fake ALT press to enable foreground switch
        // user.SetForegroundWindow win.hwnd          # ... no wonder windows is so bad
        // user.keybd_event VK_MENU, 0, KEYUP, null
    }
    return S_OK;    
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
    
    if (!fileExists(normpath) && PathIsRelativeA(path))
    {
        char fname[_MAX_FNAME];
        
        _splitpath_s(path, NULL, 0, NULL, 0, fname, _MAX_FNAME, NULL, 0);
    
        char file[MAX_PATH];
        sprintf_s(file, "%s.exe", fname);
        
        matchingWindows(file, &wins);

        if (wins.size() <= 0)
        {
            LPSTR lpFilePart;
            wstring wpath = s2w(file);
            wstring found;

            if (SearchPathA(NULL, file, ".exe", MAX_PATH, normpath, &lpFilePart))
            {
                cout << "found in PATH " << normpath << endl;
            }
            else if (findFile(L"C:\\Program Files", wpath, found))
            { 
                GetFullPathNameA(w2s(found).c_str(), MAX_PATH, normpath, NULL);
            }
            else if (findFile(L"C:\\Program Files (x86)", wpath, found))
            {
                GetFullPathNameA(w2s(found).c_str(), MAX_PATH, normpath, NULL);
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
            //cout << "matching " << normpath << " " << wins.size() << endl;
            for (HWND hWnd : wins)
            {
                ShowWindow(hWnd, SW_SHOW);
                if (isMinimized(hWnd))
                {
                    ShowWindow(hWnd, SW_RESTORE);
                }
                SetWindowPos(hWnd, HWND_TOPMOST,   0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
                SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
                SetForegroundWindow(hWnd);
            }
            return S_OK;        
        }
    }
    
    STARTUPINFOA info = { 0 };
    PROCESS_INFORMATION processInfo = { 0 };
    
    if (!CreateProcessA(normpath, NULL, NULL, NULL, TRUE, CREATE_NEW_CONSOLE, NULL, NULL, &info, &processInfo))
    {
        cerr << "can't launch " << normpath << endl;
        CloseHandle(processInfo.hProcess);
        CloseHandle(processInfo.hThread);
        CloseHandle(&info);
        return S_FALSE;
    }
    CloseHandle(processInfo.hProcess);
    CloseHandle(processInfo.hThread);
    CloseHandle(&info);
    // cout << normpath << endl;
    printf("%s\n", normpath);
    return S_OK;
}

// 0000000     0000000   000   000  000   000  0000000     0000000  
// 000   000  000   000  000   000  0000  000  000   000  000       
// 0000000    000   000  000   000  000 0 000  000   000  0000000   
// 000   000  000   000  000   000  000  0000  000   000       000  
// 0000000     0000000    0000000   000   000  0000000    0000000   

HRESULT bounds(char *id, char *x=NULL, char *y=NULL, char *w=NULL, char *h=NULL)
{
    if (x && y && w && h)
    {
        vector<HWND> wins;
        if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
        for (HWND hWnd : wins)
        {
            SetWindowPos(hWnd, NULL, atoi(x), atoi(y), atoi(w), atoi(h), SWP_NOZORDER);
        }
    }
    else
    {
        vector<HWND> wins;
        if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
        for (HWND hWnd : wins)
        {
            wRect wr = winRect(hWnd);
            printf(".\n");
            printf( "    hwnd    %s\n",  itos((unsigned __int64)hWnd, 16).c_str());
            printf( "    x       %d\n",  wr.x);
            printf( "    y       %d\n",  wr.y);
            printf( "    width   %d\n",  wr.width);
            printf( "    height  %d\n",  wr.height);
        }
    }
    return S_OK;
}

// 00     00   0000000   000   000  00000000  
// 000   000  000   000  000   000  000       
// 000000000  000   000   000 000   0000000   
// 000 0 000  000   000     000     000       
// 000   000   0000000       0      00000000  

HRESULT move(char* id, char* x, char* y)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        wRect wr = winRect(hWnd);
        SetWindowPos(hWnd, NULL, atoi(x), atoi(y), wr.width, wr.height, SWP_NOZORDER);
    }
    return S_OK;
}

//  0000000  000  0000000  00000000  
// 000       000     000   000       
// 0000000   000    000    0000000   
//      000  000   000     000       
// 0000000   000  0000000  00000000  

HRESULT size(char* id, char* width, char* height)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
    for (HWND hWnd : wins)
    {
        wRect wr = winRect(hWnd);
        SetWindowPos(hWnd, NULL, wr.x, wr.y, atoi(width), atoi(height), SWP_NOZORDER);
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

// 000   000   0000000   000      000   000  00     00  00000000  
// 000   000  000   000  000      000   000  000   000  000       
//  000 000   000   000  000      000   000  000000000  0000000   
//    000     000   000  000      000   000  000 0 000  000       
//     0       0000000   0000000   0000000   000   000  00000000  

HRESULT volume(char *id=NULL)
{
    HRESULT hr = S_OK;

    CoInitialize(NULL);
    IMMDeviceEnumerator *deviceEnumerator = NULL;
    hr = CoCreateInstance(__uuidof(MMDeviceEnumerator), NULL, CLSCTX_INPROC_SERVER, __uuidof(IMMDeviceEnumerator), (LPVOID *)&deviceEnumerator);
    IMMDevice *defaultDevice = NULL;

    hr = deviceEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &defaultDevice);
    deviceEnumerator->Release();
    deviceEnumerator = NULL;

    IAudioEndpointVolume *endpointVolume = NULL;
    hr = defaultDevice->Activate(__uuidof(IAudioEndpointVolume), CLSCTX_INPROC_SERVER, NULL, (LPVOID *)&endpointVolume);
    defaultDevice->Release();
    defaultDevice = NULL;

    if (id == NULL)
    {
        float currentVolume = 0;
        hr = endpointVolume->GetMasterVolumeLevelScalar(&currentVolume);
        cout << currentVolume*100 << endl;
    }
    else
    {
        float newVolume = stoi(id)/100.0f;
        if (newVolume < 0) newVolume = 0;
        if (newVolume > 1) newVolume = 1;
        hr = endpointVolume->SetMasterVolumeLevelScalar((float)newVolume, NULL);
    }
  
    endpointVolume->Release();
    CoUninitialize();
    
    return hr;
}

// 00000000   0000000   000      0000000    00000000  00000000   
// 000       000   000  000      000   000  000       000   000  
// 000000    000   000  000      000   000  0000000   0000000    
// 000       000   000  000      000   000  000       000   000  
// 000        0000000   0000000  0000000    00000000  000   000  

HRESULT folder(char *id)
{
    string sp = unslash(sysPath(id));

    if (!sp.size()) return S_FALSE;
    
    if (contains(sp, " "))
    {
        printf("\"%s\"", sp.c_str());
    }
    else
    {
        printf("%s", sp.c_str());
    }
    
    return S_OK;
}

HRESULT path(char *id)
{
    string sp = sysPath(id);

    if (!sp.size()) return S_FALSE;
    
    if (sp[1] == ':')
    {
        sp[1] = lower(sp.substr(0,1)).c_str()[0];
        sp[0] = '/';
    }
    
    if (contains(sp, " "))
    {
        // sp = replace(sp, " ", "\\ ");
        // printf("%s", sp.c_str());
        printf("%s", sp.c_str());
    }
    else
    {
        printf("%s", sp.c_str());
    }
    
    return S_OK;
}

//  0000000   0000000  00000000   00000000  00000000  000   000   0000000  000   000   0000000   000000000  
// 000       000       000   000  000       000       0000  000  000       000   000  000   000     000     
// 0000000   000       0000000    0000000   0000000   000 0 000  0000000   000000000  000   000     000     
//      000  000       000   000  000       000       000  0000       000  000   000  000   000     000     
// 0000000    0000000  000   000  00000000  00000000  000   000  0000000   000   000   0000000      000     

HRESULT screenshot(char *targetfile="screenshot.png")
{
    HRESULT hr;
    if (!SUCCEEDED(hr = CoInitialize(NULL))) return hr;

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

// 000   000   0000000   0000000    0000000   00000000  
// 000   000  000       000   000  000        000       
// 000   000  0000000   000000000  000  0000  0000000   
// 000   000       000  000   000  000   000  000       
//  0000000   0000000   000   000   0000000   00000000  

HRESULT usage()
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
    klog("         quit        id");
    klog("         bounds      id [x y w h]");
    klog("         move        id x y");
    klog("         size        id w h");
    klog("         launch      path");
    klog("         handle     [pid|path]");
    klog("         proc       [pid|file]");
    klog("         terminate  [pid|file]");
    klog("         mouse");
    klog("         key        [shift+|ctrl+|alt+]key");
    klog("         help        command");
    klog("         folder      name");
    klog("         trash       count|empty|file");
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
    klog("         normal|maximized|minimized");    
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
    else if (cmp(command, "quit"))
    {
        klog("wxw quit id");
        klog("");
        klog("      Quit application(s)");
        klog("");
    }
    else if (cmp(command, "terminate"))
    {
        klog("wxw terminate pid");
        klog("wxw kill pid");
        klog("");
        klog("      Terminate process");
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
        klog("      Home");
        klog("      Program");
        klog("      ProgramX86");
        klog("      Startup");
        klog("");
        klog("wxw path name");
        klog("");
        klog("      As above, but in unix style");
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
    else if (cmp(command, "proc"))
    {
        klog("wxw proc");
        klog("");
        klog("      Print all processes with an executable path");
        klog("");
        klog("wxw proc name");
        klog("");
        klog("      Print only those processes whose executable matches name");
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

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

char* swappable[] = {
    "info",
    "proc",
    "taskbar",
    "move",
    "bounds",
    "size",
    "minimize",
    "maximize",
    "raise",
    "focus",
    "close",
    "quit",
    "handle",
    "restore",
    "terminate",
    "taskbar",
    0
};

int WINAPI WinMain(__in HINSTANCE hInstance, __in_opt HINSTANCE hPrevInstance, __in LPSTR lpCmdLine, __in int nShowCmd)
{
    int argc    = __argc;
    char** argv = __argv;

    HRESULT hr = S_OK;

    if (argc < 2)
    {
        return usage();
    }
        
    if (argc > 2)
    {
        int i=0;
        while (swappable[i])
        {
            char* swp=swappable[i];
            if (cmp(argv[2],swp))
            {
                if (!cmp(argv[1], "hook") && !cmp(argv[1], "info") && !cmp(argv[1], "screen"))
                {
                    char* tmp = argv[1];
                    argv[1] = argv[2];
                    argv[2] = tmp;
                }
            }
            i++;
        }
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
    else if (cmp(cmd, "quit"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = quit(argv[2]);
    }
    else if (cmp(cmd, "terminate"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = terminate(argv[2]);
    }
    else if (cmp(cmd, "kill"))
    {
        if (argc == 2) hr = help("terminate");
        else           hr = terminate(argv[2]);
    }
    else if (cmp(cmd, "bounds"))
    {
        if (argc < 3 or argc != 3 and argc != 7) hr = help(cmd);
        else if (argc == 3) hr = bounds(argv[2]);
        else if (argc == 7) hr = bounds(argv[2], argv[3], argv[4], argv[5], argv[6]);
    }
    else if (cmp(cmd, "move"))
    {
        if (argc <= 3 || argc != 5) hr = help(cmd);
        else           hr = move(argv[2], argv[3], argv[4]);
    }
    else if (cmp(cmd, "size"))
    {
        if (argc <= 3 || argc != 5) hr = help(cmd);
        else           hr = size(argv[2], argv[3], argv[4]);
    }
	else if (cmp(cmd, "folder"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = folder(argv[2]);
    }
    else if (cmp(cmd, "path"))
    {
        if (argc == 2) hr = help("folder");
        else           hr = path(argv[2]);
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
    else if (cmp(cmd, "volume"))
    {
        if (argc == 2) hr = volume();
        else           hr = volume(argv[2]);
    }
    else if (cmp(cmd, "proc"))
    {
        if (argc == 2) hr = proclist();
        else           hr = proclist(argv[2]);
    }
    else if (cmp(cmd, "handle"))
    {
        if (argc == 2) hr = handle();
        else           hr = handle(argv[2]);
    }
    else if (cmp(cmd, "hook"))
    {
        if (argc == 2) hr = help(cmd);
        else initHook(argv[2]);
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
