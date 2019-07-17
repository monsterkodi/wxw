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

int screenshot(char *targetfile="screenshot.png")
{
    CoInitialize(NULL);

    ULONG_PTR token;
    Gdiplus::GdiplusStartupInput tmp;
    Gdiplus::GdiplusStartup(&token, &tmp, NULL);

    RECT rc; rc.left = 0; rc.right = 0;
    rc.right  = GetSystemMetrics(SM_CXSCREEN); // SM_CXVIRTUALSCREEN
    rc.bottom = GetSystemMetrics(SM_CYSCREEN); // SM_CYVIRTUALSCREEN
        
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
    
    return 0;
}

// 00000000   0000000   000      0000000    00000000  00000000   
// 000       000   000  000      000   000  000       000   000  
// 000000    000   000  000      000   000  0000000   0000000    
// 000       000   000  000      000   000  000       000   000  
// 000        0000000   0000000  0000000    00000000  000   000  

int folder(char *id)
{
    int result = 0;
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
    else if (cmp(id, "Trash"))      { hr = SHGetKnownFolderPath(FOLDERID_RecycleBinFolder, 0, NULL, &path); }// doesn't work :( 
    else
    {
        printf("ERROR: invalid folder name '%s'\n", id);
        return 1;
    }

    if (SUCCEEDED(hr) && path) 
    {
        wprintf(L"%ls\n", path);
    }
    else
    {
        printf("ERROR: can't get folder '%s'\n", id);
        result = 1;
    }

    CoTaskMemFree(path);
    
    return result;
}

// 000000000  00000000    0000000    0000000  000   000  
//    000     000   000  000   000  000       000   000  
//    000     0000000    000000000  0000000   000000000  
//    000     000   000  000   000       000  000   000  
//    000     000   000  000   000  0000000   000   000  

int trash(char* action)
{
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
        if (SUCCEEDED(pDesktop->GetDisplayNameOf(pidlRecycleBin, SHGDN_NORMAL, &strRet)))
        {
            wprintf(L"%ls\n", strRet.pOleStr);
        }
    }
    else if (cmp(action, "list"))
    {
        IEnumIDList *penumFiles;
        
        if (SUCCEEDED(pRecycleBin->EnumObjects(NULL, SHCONTF_FOLDERS|SHCONTF_NONFOLDERS|SHCONTF_INCLUDEHIDDEN, &penumFiles)))
        {
            while (penumFiles->Next(1, &pidl, NULL) != S_FALSE)
            {
                STRRET strRet;
                if (SUCCEEDED(pDesktop->GetDisplayNameOf(pidl, SHGDN_NORMAL, &strRet)))
                {
                    wprintf(L"%ls\n", strRet.pOleStr);
                }
            }
        }
    }
    else if (cmp(action, "count"))
    {
        IEnumIDList *penumFiles;
        
        if (SUCCEEDED(pRecycleBin->EnumObjects(NULL, SHCONTF_FOLDERS|SHCONTF_NONFOLDERS|SHCONTF_INCLUDEHIDDEN, &penumFiles)))
        {
            int num = 0;
            while (penumFiles->Next(1, &pidl, NULL) != S_FALSE) num++;
            printf("%d\n", num);
        }
    }
    else if (cmp(action, "empty"))
    {
        SHEmptyRecycleBinA(NULL, NULL, SHERB_NOCONFIRMATION | SHERB_NOPROGRESSUI);
    }
    else
    {
        IShellItem* shellItem;
        PCWSTR path = wstr(action);
        wprintf(L"trash path: %ls\n", path);
        if (SUCCEEDED(SHCreateItemFromParsingName(path, NULL, IID_IShellItem, (void**)&shellItem)))
        {
            klog("shellItem");
            IFileOperation* pfo = NULL;
            
            if (SUCCEEDED(CoCreateInstance(CLSID_FileOperation, NULL, CLSCTX_ALL, IID_IFileOperation, (LPVOID*)pfo)))
            {
                klog("FileOperation");
                if (SUCCEEDED(pfo->DeleteItem(shellItem, NULL)))
                {
                    klog("DeleteItem");
                    if (SUCCEEDED(pfo->PerformOperations()))
                    {
                        printf("trashed: %s\n", action);
                    }
                }
            }
        }
        delete path;
        // LPSHFILEOPSTRUCTA op;
        // op.wFunc = FO_MOVE;
        // op.pFrom = 
        // SHFileOperationA();
    }
    return 0;
}


// 000   000   0000000   0000000    0000000   00000000  
// 000   000  000       000   000  000        000       
// 000   000  0000000   000000000  000  0000  0000000   
// 000   000       000  000   000  000   000  000       
//  0000000   0000000   000   000   0000000   00000000  

int usage(void)
{
    klog("");
    klog("wc [command] [args...]");
    klog("");
    klog("    commands:");
    klog("");
    klog("     help       <command>");
    klog("     folder     <name>");
    klog("     trash      <action>");
    klog("     screenshot [targetfile]");
    klog("");
    return 0;
}

// 000   000  00000000  000      00000000   
// 000   000  000       000      000   000  
// 000000000  0000000   000      00000000   
// 000   000  000       000      000        
// 000   000  00000000  0000000  000        

int help(char *command)
{
    if (cmp(command, "folder"))
    {
        klog("");
        klog("wc folder <name>");
        klog("");
        klog("Prints the path of specific folders. Recognized names are:");
        klog("");
        klog("      AppData");
        klog("      Desktop");
        klog("      Documents");
        klog("      Downloads");
        klog("      Fonts");
        klog("      Program");
        klog("      ProgramX86");
        klog("      Startup");
        klog("");
    }
    else if (cmp(command, "screenshot"))
    {
        klog("");
        klog("wc screenshot [targetfile]");
        klog("");
        klog("      targetfile defaults to './screenshot.png'");
        klog("");
        klog("Takes a screenshot of the main monitor and saves it as a png file.");
        klog("");
    }
    else if (cmp(command, "trash"))
    {
        klog("");
        klog("wc trash <action>");
        klog("");
        klog("      actions:");
        klog("");
        klog("          list      prints names of files in thrash bin");
        klog("          count     prints number of files in thrash bin");
        klog("          name      prints name of thrash bin");
        klog("          empty     empties the thrash bin");
        klog("");
    }
    
    return 0;
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
    else if (cmp(cmd, "folder"))
    {
        if (argc == 2) return help(cmd);
        else           return folder(argv[2]);
    }
    else if (cmp(cmd, "screenshot"))
    {
        if (argc == 2) return screenshot();
        else           return screenshot(argv[2]);
    }
    else if (cmp(cmd, "trash"))
    {
        if (argc == 2) return help(cmd);
        else           return trash(argv[2]);
    }
    
    return 0;
}


