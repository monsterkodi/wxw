#include <windows.h>
#include <WinUser.h>
#include <tchar.h>
#include <math.h>
#include <string.h>
#include <iostream>
#include <fstream>
#include <vector>
#include <gdiplus.h>

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
    CoInitialize(NULL);

    ULONG_PTR token;
    Gdiplus::GdiplusStartupInput tmp;
    Gdiplus::GdiplusStartup(&token, &tmp, NULL);

    RECT rc;
    GetClientRect(GetDesktopWindow(), &rc);
    cout << "rect" << rc.right << rc.bottom << endl;
    rc.right  = GetSystemMetrics(SM_CXVIRTUALSCREEN);
    rc.bottom = GetSystemMetrics(SM_CYVIRTUALSCREEN);
    
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


