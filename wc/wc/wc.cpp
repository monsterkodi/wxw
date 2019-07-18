#include <windows.h>
#include <WinUser.h>
#include <gdiplus.h>
#include <string.h>
#include <tchar.h>
#include <math.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <shellscalingapi.h>
#include <KnownFolders.h>
#include <ShlObj.h>
#include <Shobjidl.h>
#include <atlbase.h>

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
    std::wstring wc(size+1, L' ');
    size_t conv;
    mbstowcs_s(&conv, &wc[0], size+1, b, size);
    
    return lstrcmpiW(a, (LPCWSTR)&wc[0]) == 0;
} 

LPCWSTR wstr(char *s)
{
    size_t size = strlen(s);
    wchar_t *ws = new wchar_t[size+1]; 
    size_t conv;
    mbstowcs_s(&conv, ws, size+1, s, size);
    
    return (LPCWSTR)ws;
}

int cmp(char *a, char *b)
{
    return _strcmpi(a, b) == 0;
} 

int klog(char *msg)
{
    printf(msg);
    printf("\n");
    return 0;
}

// 00000000   000   000   0000000   
// 000   000  0000  000  000        
// 00000000   000 0 000  000  0000  
// 000        000  0000  000   000  
// 000        000   000   0000000   

bool save_png_memory(HBITMAP hbitmap, std::vector<BYTE>& data)
{
    Gdiplus::Bitmap bmp(hbitmap, nullptr);

    IStream* istream = nullptr;
    CreateStreamOnHGlobal(NULL, TRUE, &istream);

    CLSID clsid_png;
    CLSIDFromString(L"{557cf406-1a04-11d3-9a73-0000f81ef32e}", &clsid_png);
    Gdiplus::Status status = bmp.Save(istream, &clsid_png);
    if (status != Gdiplus::Status::Ok)
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
    Gdiplus::GdiplusStartupInput tmp;
    Gdiplus::GdiplusStartup(&token, &tmp, NULL);

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

    std::vector<BYTE> data;
    if (save_png_memory(hbitmap, data))
    {
        std::ofstream fout(targetfile, std::ios::binary);
        fout.write((char*)data.data(), data.size());
    }
    DeleteObject(hbitmap);

    Gdiplus::GdiplusShutdown(token);
    CoUninitialize();
    
    return S_OK;
}

// 000  000   000  00000000   0000000   
// 000  0000  000  000       000   000  
// 000  000 0 000  000000    000   000  
// 000  000  0000  000       000   000  
// 000  000   000  000        0000000   

void winInfo(HWND hWnd, wchar_t* title=L"")
{
    wprintf(L"%llx ", (unsigned __int64)hWnd);

    RECT rect; 

    GetClientRect(hWnd, &rect);
    LONG width = rect.right;
    LONG height = rect.bottom;

    GetWindowRect(hWnd, &rect);
    LONG x = rect.left;
    LONG y = rect.top;

    DWORD pid;
    GetWindowThreadProcessId(hWnd, &pid);

    wprintf(L"%lu ", pid);

    wprintf(L"%d %d %d %d ", x, y, width, height);

    wprintf(L"%ls", title);

    wprintf(L"\n");
}

static BOOL CALLBACK infoAll(HWND hWnd, LPARAM lparam) 
{
    int length = GetWindowTextLengthW(hWnd);
    wchar_t* title = new wchar_t[length + 1];
    GetWindowText(hWnd, title, length + 1);

    if (IsWindowVisible(hWnd) && length != 0)
    {
        winInfo(hWnd, title);
    }
    return true;
}

HRESULT info(char *id="all")
{
    HRESULT hr = S_OK;
    
    if (cmp(id, "all"))
    {
        EnumWindows(infoAll, NULL);
    }
    else if (cmp(id, "foreground"))
    {
        winInfo(GetForegroundWindow());
    }
    else 
    {
        cerr << "unknown info argument " << id << endl;
        hr = S_FALSE;
    }

    return hr;
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
    }
    else if (cmp(id, "user"))
    {
        cout << GetSystemMetrics(SM_CXFULLSCREEN) << " " << GetSystemMetrics(SM_CYFULLSCREEN) << endl;
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
    klog("     help       <command>");
    klog("     info       [pid|path|title]");
    klog("     folder     <name>");
    klog("     trash      <action>");
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
        klog("wc info [pid|path|title]");
    }
    if (cmp(command, "folder"))
    {
        klog("wc folder <name>");
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
        klog("wc trash <action>");
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
        if (argc == 2) return usage();
        else           return help(argv[2]);
    }
    else if (cmp(cmd, "info"))
    {
        if (argc == 2) hr = info();
        else           hr = info(argv[2]);
    }
    else if (cmp(cmd, "folder"))
    {
        if (argc == 2) return help(cmd);
        else           hr = folder(argv[2]);
    }
    else if (cmp(cmd, "screenshot"))
    {
        if (argc == 2) return screenshot();
        else           hr = screenshot(argv[2]);
    }
    else if (cmp(cmd, "screen"))
    {
        if (argc == 2) return screen("size");
        else           hr = screen(argv[2]);
    }
    else if (cmp(cmd, "trash"))
    {
        if (argc == 2) return help(cmd);
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


