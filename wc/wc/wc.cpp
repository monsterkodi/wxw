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

using namespace Gdiplus;
using namespace std;

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

int WINAPI WinMain( __in HINSTANCE hInstance, __in_opt HINSTANCE hPrevInstance, __in_opt LPSTR lpCmdLine, __in int nShowCmd )
{
    /*
    if (argc < 2)
    {
        usage();
        return 0;
    }
    
    if (cmp(argv[1], L"help"))
    {
        if (argc == 2) usage();
        else           help(argv[2]);
    }
    else if (cmp(argv[1], L"folder"))
    {
        if (argc == 2) help(argv[1]);
        else           folder(argv[2]);
    }*/
    
    CoInitialize(NULL);

    ULONG_PTR token;
    Gdiplus::GdiplusStartupInput tmp;
    Gdiplus::GdiplusStartup(&token, &tmp, NULL);

    RECT rc; rc.left = 0; rc.right = 0;
    rc.right  = GetSystemMetrics(SM_CXSCREEN); // SM_CXVIRTUALSCREEN
    rc.bottom = GetSystemMetrics(SM_CYSCREEN); // SM_CYVIRTUALSCREEN
    cout << "rect " << rc.right << " " << rc.bottom << endl;
    
    UINT dpiX;
    UINT dpiY;
    POINT pt = { 0, 0 };
    HMONITOR hmonitor = MonitorFromPoint(pt, MONITOR_DEFAULTTOPRIMARY);
    MONITOR_DPI_TYPE dpiType = MDT_DEFAULT;
    
    HRESULT result = GetDpiForMonitor( hmonitor, dpiType, &dpiX, &dpiY );
    
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
        std::ofstream fout("screenshot.png", std::ios::binary);
        fout.write((char*)data.data(), data.size());
    }
    DeleteObject(hbitmap);

    Gdiplus::GdiplusShutdown(token);
    CoUninitialize();

	return 0;
}

int cmp(wchar_t *a, wchar_t *b)
{
    return lstrcmpiW(a, b) == 0;
} 

int klog(wchar_t *msg)
{
	wprintf(msg);
	wprintf(L"\n");
    return 0;
}

int error(wchar_t *msg)
{
    klog(msg);
    return 1;
}

// 000   000   0000000   0000000    0000000   00000000  
// 000   000  000       000   000  000        000       
// 000   000  0000000   000000000  000  0000  0000000   
// 000   000       000  000   000  000   000  000       
//  0000000   0000000   000   000   0000000   00000000  

int usage(void)
{
    klog(L"");
    klog(L"wxw [command] [options...]\n");
    klog(L"     help     <command>");
    klog(L"     folder   <name>");
    klog(L"");
    return 0;
}

int help(wchar_t *command)
{
	if (cmp(command, L"folder"))
	{
        klog(L"");
        klog(L"folder names:");
        klog(L"");
        klog(L"       AppData");
        klog(L"       Desktop");
        klog(L"       Documents");
        klog(L"       Downloads");
        klog(L"       Fonts");
        klog(L"       Program");
        klog(L"       ProgramX86");
        klog(L"       Startup");
        klog(L"");
	}
    return 0;
}

// 00000000   0000000   000      0000000    00000000  00000000   
// 000       000   000  000      000   000  000       000   000  
// 000000    000   000  000      000   000  0000000   0000000    
// 000       000   000  000      000   000  000       000   000  
// 000        0000000   0000000  0000000    00000000  000   000  

int folder(wchar_t *id)
{
    int result = 0;
    PWSTR path = NULL;
    HRESULT hr = S_OK; 
    
    // doesn't work :( FOLDERID_RecycleBinFolder 
    
    if      (cmp(id, L"AppData"))    { hr = SHGetKnownFolderPath(FOLDERID_RoamingAppData,  0, NULL, &path); }
    else if (cmp(id, L"Desktop"))    { hr = SHGetKnownFolderPath(FOLDERID_Desktop,         0, NULL, &path); }
    else if (cmp(id, L"Documents"))  { hr = SHGetKnownFolderPath(FOLDERID_Documents,       0, NULL, &path); }
    else if (cmp(id, L"Downloads"))  { hr = SHGetKnownFolderPath(FOLDERID_Downloads,       0, NULL, &path); }
    else if (cmp(id, L"Fonts"))      { hr = SHGetKnownFolderPath(FOLDERID_Fonts,           0, NULL, &path); }
    else if (cmp(id, L"Program"))    { hr = SHGetKnownFolderPath(FOLDERID_ProgramFiles,    0, NULL, &path); }
    else if (cmp(id, L"ProgramX86")) { hr = SHGetKnownFolderPath(FOLDERID_ProgramFilesX86, 0, NULL, &path); }
    else if (cmp(id, L"Startup"))    { hr = SHGetKnownFolderPath(FOLDERID_Startup,         0, NULL, &path); }
    else if (cmp(id, L"Recycle")) 
    {
        LPSHELLFOLDER pDesktop       = NULL;
        LPITEMIDLIST  pidlRecycleBin = NULL;

        hr = SHGetDesktopFolder(&pDesktop);
        wprintf(L"SHGetDesktopFolder %d\n", hr);
        
        hr = SHGetFolderLocation(NULL, CSIDL_BITBUCKET, NULL, 0, &pidlRecycleBin);
        wprintf(L"SHGetFolderLocation %d\n", hr);
        
        // hr = pDesktop->BindToObject(pidlRecycleBin, NULL, IID_IShellFolder, (LPVOID *)&m_pRecycleBin);
        // wprintf(L"BindToObject %d\n", hr);    
        
        // STRRET strRet;
        // hr = pDesktop->GetDisplayNameOf(pidlRecycleBin, SHGDN_NORMAL, &strRet);
        // wprintf(L"GetDisplayNameOf %d\n", hr);
    }
    else
    {
        wprintf(L"ERROR: invalid folder name '%ls'\n", id);
        result = 1;
    }

    if (SUCCEEDED(hr) && path) 
    {
        wprintf(L"folder %ls\n", path);
    }
    else
    {
        wprintf(L"ERROR: can't get folder '%ls' %ls\n", id, path);
        result = 1;
    }

    CoTaskMemFree(path);
    
    return result;
}


