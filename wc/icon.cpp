/*
000   0000000   0000000   000   000  
000  000       000   000  0000  000  
000  000       000   000  000 0 000  
000  000       000   000  000  0000  
000   0000000   0000000   000   000  
*/

#include "icon.h"
#include "kutl.h"

#include <ShlObj.h>
#include <commoncontrols.h>

// 00000000   000   000   0000000   
// 000   000  0000  000  000        
// 00000000   000 0 000  000  0000  
// 000        000  0000  000   000  
// 000        000   000   0000000   

bool saveBitmap(Bitmap* bitmap, const char* targetfile)
{
    HRESULT hr;
    CLSID clsID;
    hr = CLSIDFromString(L"{557cf406-1a04-11d3-9a73-0000f81ef32e}", &clsID); //GetEncoderClsid(L"image/png", &clsID);

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
        if (!dirExists(normpath))
        {
            if ((ERROR_SUCCESS != SHCreateDirectoryExA(0, normpath, 0)))
            {
                cerr << "can't create " << normpath << endl;
                return false;
            }
        }
    }

    GetFullPathNameA(targetfile, MAX_PATH, normpath, NULL);
    if (Ok == bitmap->Save(s2w(normpath).c_str(), &clsID))
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

// 000000000   0000000   0000000    000  000000000  00     00   0000000   00000000   
//    000     000   000  000   000  000     000     000   000  000   000  000   000  
//    000     000   000  0000000    000     000     000000000  000000000  00000000   
//    000     000   000  000   000  000     000     000 0 000  000   000  000        
//    000      0000000   0000000    000     000     000   000  000   000  000        

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

//  0000000   0000000   000   000  00000000  000   0000000   0000000   000   000  
// 000       000   000  000   000  000       000  000       000   000  0000  000  
// 0000000   000000000   000 000   0000000   000  000       000   000  000 0 000  
//      000  000   000     000     000       000  000       000   000  000  0000  
// 0000000   000   000      0      00000000  000   0000000   0000000   000   000  

bool saveIcon(HICON hIcon, char* pngfile)
{
    ICONINFO icon_info = { 0 };
    GetIconInfo(hIcon, &icon_info);

    BITMAP bm = { 0 };

    unsigned long w = 0, h = 0;

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

    if (target_info.Scan0)
    { 
        CopyMemory(target_info.Scan0, source_info.bmBits, ((unsigned long long) w) * ((unsigned long long) h) * 4);
    }

    s = bmp->UnlockBits(&target_info);

    bool saved = saveBitmap(bmp, pngfile);
        
    DestroyIcon(hIcon);
    DeleteObject(hBitmap);
    DeleteObject(bmp);
        
    return saved;
}
        
// 000   0000000   0000000   000   000  
// 000  000       000   000  0000  000  
// 000  000       000   000  000 0 000  
// 000  000       000   000  000  0000  
// 000   0000000   0000000   000   000  

HRESULT icon(char* id, char* targetfile)
{
    HRESULT hr = S_OK;
 
    char normpath[MAX_PATH];
    GetFullPathNameA(id, MAX_PATH, normpath, NULL);
    
    if (!SUCCEEDED(hr = CoInitialize(NULL))) return hr;

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
    
    if (!fileExists(normpath))
    {
        cout << "can't find " << normpath << ", icon will be generic." << endl;
    }

    SHFILEINFOA shfi = { 0 };
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
