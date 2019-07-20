#include <windows.h>
#include <WinUser.h>
#include <gdiplus.h>
#include <string.h>
#include <tchar.h>
#include <math.h>
#include <strsafe.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <shellscalingapi.h>
#include <KnownFolders.h>
#include <ShlObj.h>
#include <Shobjidl.h>

using namespace Gdiplus;
using namespace std;

//  0000000  00     00  00000000   
// 000       000   000  000   000  
// 000       000000000  00000000   
// 000       000 0 000  000        
//  0000000  000   000  000        

int wcmp(wchar_t *a, char *b)
{
    size_t size = strlen(b);
    wstring wc(size+1, L' ');
    size_t conv;
    mbstowcs_s(&conv, &wc[0], size+1, b, size);
    
    return lstrcmpiW(a, (LPCWSTR)&wc[0]) == 0;
} 

int cmp(char *a, char *b)
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

int klog(char *msg)
{
    printf(msg);
    printf("\n");
    return 0;
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
    delete title;
    
    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);

    HANDLE hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);

    DWORD pathSize = 10000;
    wchar_t path[10000];
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
    if (wcmp(title, "Program Manager"))
    {
        delete title;
        return S_OK;
    }

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
    
    if (cmp(id, "foreground") || cmp(id, "frontmost") || cmp(id, "topmost") || cmp(id, "top") ||  cmp(id, "front"))
    {
        hr = winInfo(GetForegroundWindow());
    }
    else if (cmp(id, "taskbar"))
    {
        hr = winInfo(FindWindow(L"Shell_TrayWnd", L""));
    }
    else 
    {
        vector<HWND> wins;
        if (!SUCCEEDED(matchingWindows(id, &wins))) return S_FALSE;
        for (HWND hWnd : wins)
        {
            winInfo(hWnd, id);
        }
    }

    return hr;
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
        SetWindowPos(hWnd, HWND_TOPMOST,   0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        SetForegroundWindow(hWnd);
    }
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
    cout << p.x << " " << p.y << endl; 
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
    
    if (cmp(id, "size"))
    {
        cout << GetSystemMetrics(SM_CXSCREEN) << " " << GetSystemMetrics(SM_CYSCREEN) << endl;

        // cout << GetSystemMetrics(SM_CXBORDER) << " " << GetSystemMetrics(SM_CYBORDER) << endl;
        // cout << GetSystemMetrics(SM_CXMIN) << " " << GetSystemMetrics(SM_CYMIN) << endl;
        // cout << GetSystemMetrics(SM_CXSIZE) << " " << GetSystemMetrics(SM_CYSIZE) << endl;
        // cout << GetSystemMetrics(SM_CXFRAME) << " " << GetSystemMetrics(SM_CYFRAME) << endl;
        // cout << GetSystemMetrics(SM_CXDLGFRAME) << " " << GetSystemMetrics(SM_CYDLGFRAME) << endl;
	}
    else if (cmp(id, "user"))
    {
        RECT rect;
        hr = SystemParametersInfoW(SPI_GETWORKAREA, 0, &rect, 0);
        cout << rect.right-rect.left << " " << rect.bottom-rect.top << endl;
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
            cout << strRet.cStr << endl;
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
                    cout << strRet.cStr << endl;
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

bool save_png_memory(HBITMAP hbitmap, vector<BYTE>& data)
{
    Bitmap bmp(hbitmap, NULL);

    IStream* istream = NULL;
    CreateStreamOnHGlobal(NULL, TRUE, &istream);

    CLSID clsid_png;
    CLSIDFromString(L"{557cf406-1a04-11d3-9a73-0000f81ef32e}", &clsid_png);
    Status status = bmp.Save(istream, &clsid_png);
    if (status != Status::Ok)
        return false;

    HGLOBAL hg = NULL;
    GetHGlobalFromStream(istream, &hg);

    SIZE_T bufsize = GlobalSize(hg);
    data.resize(bufsize);

    LPVOID pimage = GlobalLock(hg);
    memcpy(&data[0], pimage, bufsize);
    GlobalUnlock(hg);

    istream->Release();
    return true;
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
    auto memdc = CreateCompatibleDC(hdc);
    auto hbitmap = CreateCompatibleBitmap(hdc, rc.right, rc.bottom);
    auto oldbmp = SelectObject(memdc, hbitmap);
    BitBlt(memdc, 0, 0, rc.right, rc.bottom, hdc, 0, 0, SRCCOPY);
    SelectObject(memdc, oldbmp);
    DeleteDC(memdc);
    ReleaseDC(0, hdc);

    vector<BYTE> data;
    if (save_png_memory(hbitmap, data))
    {
        ofstream fout(targetfile, ios::binary);
        fout.write((char*)data.data(), data.size());
    }
    DeleteObject(hbitmap);

    GdiplusShutdown(token);
    CoUninitialize();
    
    return S_OK;
}

// 000000000   0000000    0000000  000   000  0000000     0000000   00000000   
//    000     000   000  000       000  000   000   000  000   000  000   000  
//    000     000000000  0000000   0000000    0000000    000000000  0000000    
//    000     000   000       000  000  000   000   000  000   000  000   000  
//    000     000   000  0000000   000   000  0000000    000   000  000   000  

HRESULT taskbar(char* id)
{
    BOOL bShowTaskBar = true;
    
    if (cmp(id, "hide"))
    {
        bShowTaskBar = false;
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

// 000   000   0000000   0000000    0000000   00000000  
// 000   000  000       000   000  000        000       
// 000   000  0000000   000000000  000  0000  0000000   
// 000   000       000  000   000  000   000  000       
//  0000000   0000000   000   000   0000000   00000000  

HRESULT usage(void)
{
    klog("");
    klog("wc [command] [args...]");
    klog("");
    klog("    commands:");
    klog("");
    klog("     info       [pid|path|hwnd|title]");
    klog("     raise       pid|path|hwnd");
    klog("     focus       pid|path|hwnd");
    klog("     bounds      pid|path|hwnd x y w h");
    klog("     help        command");
    klog("     trash       action");
    klog("     folder      name");
    klog("     mouse");
    klog("     screen     [size|user]");
    klog("     screenshot [targetfile]");
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
        klog("wc info [pid|path|hwnd|title]");
        klog("");
        klog("      Print information about windows");
        klog("");
    }
    else if (cmp(command, "raise"))
    {
        klog("wc raise pid|path|hwnd");
        klog("");
        klog("      Raise windows belonging to a process or application");
        klog("");
    }
    else if (cmp(command, "focus"))
    {
        klog("wc raise pid|path|hwnd");
        klog("");
        klog("      Raise windows belonging to a process or application");
        klog("");
    }
    else if (cmp(command, "folder"))
    {
        klog("wc folder name");
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
    else if (cmp(command, "mouse"))
    {
        klog("wc mouse");
        klog("");
        klog("      Print current mouse position");
    }
    else if (cmp(command, "screen"))
    {
        klog("wc screen [size|user]");
        klog("");
        klog("      size        print size of screen in pixels");
        klog("      user        print size of screen without taskbar in pixels");
    }
    else if (cmp(command, "screenshot"))
    {
        klog("wc screenshot [targetfile]");
        klog("");
        klog("      targetfile defaults to './screenshot.png'");
        klog("");
        klog("Take a screenshot of the main monitor and save it as a png file.");
    }
    else if (cmp(command, "trash"))
    {
        klog("wc trash action");
        klog("");
        klog("      actions:");
        klog("");
        klog("          list      print names of files in thrash bin");
        klog("          count     print number of files in thrash bin");
        klog("          name      print name of thrash bin");
        klog("          empty     empty the thrash bin");
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
    else if (cmp(cmd, "focus"))
    {
        if (argc == 2) hr = help(cmd);
        else           hr = focus(argv[2]);
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
