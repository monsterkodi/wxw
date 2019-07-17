#include <windows.h>
#include <WinUser.h>
#include <tchar.h>
#include <math.h>
#include <string.h>
#include <gdiplus.h>

using namespace Gdiplus;

HBITMAP CopyDCToBitmap(HDC hScrDC, LPRECT lpRect);
BOOL SaveBmp(HBITMAP hBitmap, LPCWSTR FileName);

void GetCLSID(const WCHAR* format, CLSID* pClsid) 
{
	UINT  num = 0;  // number of image encoders
	UINT  size = 0; // size of the image encoder array in bytes

	ImageCodecInfo* pImageCodecInfo = NULL;

	GetImageEncodersSize(&num, &size);

	pImageCodecInfo = (ImageCodecInfo*)(malloc(size));

	GetImageEncoders(num, size, pImageCodecInfo);

	for (UINT j = 0; j < num; ++j)
	{
		if (wcscmp(pImageCodecInfo[j].MimeType, format) == 0)
		{
			*pClsid = pImageCodecInfo[j].Clsid;
			free(pImageCodecInfo);
		}
	}
}

Gdiplus::Status HBitmapToBitmap(HBITMAP source, Gdiplus::PixelFormat pixel_format, Gdiplus::Bitmap** result_out)
{
	BITMAP source_info = { 0 };
	if (!::GetObject(source, sizeof(source_info), &source_info))
	{ 
		return Gdiplus::GenericError;
	}

	Gdiplus::Status s;

	Gdiplus::Bitmap* target = new Gdiplus::Bitmap(source_info.bmWidth, source_info.bmHeight, pixel_format);

	if (!target)
	{ 
		return Gdiplus::OutOfMemory;
	}
	if ((s = target->GetLastStatus()) != Gdiplus::Ok)
	{ 
		return s;
	}

	Gdiplus::BitmapData target_info;
	Gdiplus::Rect rect(0, 0, source_info.bmWidth, source_info.bmHeight);

	s = target->LockBits(&rect, Gdiplus::ImageLockModeWrite, pixel_format, &target_info);
	if (s != Gdiplus::Ok) return s;

	if (target_info.Stride != source_info.bmWidthBytes)
	{ 
		return Gdiplus::InvalidParameter; // pixel_format is wrong!
	}

	if (!source_info.bmBits)
	{
		return Gdiplus::InvalidParameter; // no pixels?
	}

	CopyMemory(target_info.Scan0, source_info.bmBits, source_info.bmWidthBytes * source_info.bmHeight);

	s = target->UnlockBits(&target_info);
	if (s != Gdiplus::Ok) return s;

	*result_out = target;

	return Gdiplus::Ok;
}

int WINAPI WinMain( __in HINSTANCE hInstance, __in_opt HINSTANCE hPrevInstance, __in_opt LPSTR lpCmdLine, __in int nShowCmd )
{
	GdiplusStartupInput gdiplusStartupInput;
	ULONG_PTR gdiplusToken;
	GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);

	RECT rect;
	rect.left   = 0;
	rect.top    = 0;
	rect.right  = GetSystemMetrics(SM_CXVIRTUALSCREEN);
	rect.bottom = GetSystemMetrics(SM_CYVIRTUALSCREEN);

	HBITMAP bitmap = CopyDCToBitmap(GetDC(GetDesktopWindow()), &rect);
	
// 	Gdiplus::Bitmap image(bitmap, NULL);

	CLSID clsID;
	GetCLSID(L"image/png", &clsID);
	
	Bitmap* image = NULL;
	HBitmapToBitmap(bitmap, PixelFormat32bppRGB, &image);

// 	Image* image = new Image(bitmap, NULL);
	if (image)
	{ 
		Status result = image->Save(L"screenshot2.png", &clsID, NULL);
	}

	SaveBmp(bitmap, L"screenshot.bmp");

// 	Image* image = new Image();
// 	GetEncoderClsid(L"image/png", &encoderClsid);
// 	stat = image->Save(L"Bird.png", &encoderClsid, NULL);
	//bitmap->
	//.Save("icon.png", ImageFormat.Png);

	delete image;

	GdiplusShutdown(gdiplusToken);

	return 0;
}

HBITMAP CopyDCToBitmap(HDC hScrDC, LPRECT lpRect)
{
	HDC hMemDC; 
	HBITMAP hBitmap,hOldBitmap; 
	int nX, nY, nX2, nY2; 
	int nWidth, nHeight; 

	if (IsRectEmpty(lpRect)) return NULL;

	nX  = lpRect->left;
	nY  = lpRect->top;
	nX2 = lpRect->right;
	nY2 = lpRect->bottom;
	nWidth = nX2 - nX;
	nHeight = nY2 - nY;
	hMemDC = CreateCompatibleDC(hScrDC);
	hBitmap = CreateCompatibleBitmap(hScrDC, nWidth, nHeight);
	hOldBitmap = (HBITMAP)SelectObject(hMemDC, hBitmap);
	StretchBlt(hMemDC,0,0,nWidth,nHeight,hScrDC,nX,nY,nWidth,nHeight,SRCCOPY);
	//BitBlt(hMemDC, 0, 0, nWidth, nHeight,hScrDC, nX, nY, SRCCOPY);
	hBitmap = (HBITMAP)SelectObject(hMemDC, hOldBitmap);

	DeleteDC(hMemDC);
	DeleteObject(hOldBitmap);
	return hBitmap;
}

BOOL SaveBmp(HBITMAP hBitmap, LPCWSTR FileName)
{
	HDC hDC;
	int iBits;
	WORD wBitCount;
	DWORD dwPaletteSize=0, dwBmBitsSize=0, dwDIBSize=0, dwWritten=0; 
	BITMAP Bitmap; 
	BITMAPFILEHEADER bmfHdr; 
	BITMAPINFOHEADER bi; 
	LPBITMAPINFOHEADER lpbi; 
	HANDLE fh, hDib, hPal,hOldPal=NULL; 

	hDC = CreateDC( _T( "DISPLAY" ), NULL, NULL, NULL);
	iBits = GetDeviceCaps(hDC, BITSPIXEL) * GetDeviceCaps(hDC, PLANES); 
	DeleteDC(hDC); 
	if (iBits <= 1) wBitCount = 1; 
	else if (iBits <= 4) wBitCount = 4; 
	else if (iBits <= 8) wBitCount = 8; 
	else wBitCount = 24; 

	GetObject(hBitmap, sizeof(Bitmap), (LPSTR)&Bitmap);
	bi.biSize = sizeof(BITMAPINFOHEADER);
	bi.biWidth = Bitmap.bmWidth;
	bi.biHeight = Bitmap.bmHeight;
	bi.biPlanes = 1;
	bi.biBitCount = wBitCount;
	bi.biCompression = BI_RGB;
	bi.biSizeImage = 0;
	bi.biXPelsPerMeter = 0;
	bi.biYPelsPerMeter = 0;
	bi.biClrImportant = 0;
	bi.biClrUsed = 0;

	dwBmBitsSize = ((Bitmap.bmWidth * wBitCount + 31) / 32) * 4 * Bitmap.bmHeight;

	hDib = GlobalAlloc(GHND,dwBmBitsSize + dwPaletteSize + sizeof(BITMAPINFOHEADER)); 
	lpbi = (LPBITMAPINFOHEADER)GlobalLock(hDib); 
	*lpbi = bi; 
	hPal = GetStockObject(DEFAULT_PALETTE); 
	if (hPal) 
	{ 
		hDC = ::GetDC(NULL); 
		hOldPal = ::SelectPalette(hDC, (HPALETTE)hPal, FALSE); 
		RealizePalette(hDC); 
	}
	GetDIBits(hDC, hBitmap, 0, (UINT) Bitmap.bmHeight, (LPSTR)lpbi + sizeof(BITMAPINFOHEADER) + dwPaletteSize, (BITMAPINFO *)lpbi, DIB_RGB_COLORS); 

	if (hOldPal) 
	{ 
		::SelectPalette(hDC, (HPALETTE)hOldPal, TRUE); 
		RealizePalette(hDC); 
		::ReleaseDC(NULL, hDC); 
	} 
	fh = CreateFile( FileName, GENERIC_WRITE,0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL | FILE_FLAG_SEQUENTIAL_SCAN, NULL ); 

	if (fh == INVALID_HANDLE_VALUE) return FALSE; 

	bmfHdr.bfType = 0x4D42; // "BM" 
	dwDIBSize = sizeof(BITMAPFILEHEADER) + sizeof(BITMAPINFOHEADER) + dwPaletteSize + dwBmBitsSize; 
	bmfHdr.bfSize = dwDIBSize; 
	bmfHdr.bfReserved1 = 0; 
	bmfHdr.bfReserved2 = 0; 
	bmfHdr.bfOffBits = (DWORD)sizeof(BITMAPFILEHEADER) + (DWORD)sizeof(BITMAPINFOHEADER) + dwPaletteSize; 
	WriteFile(fh, (LPSTR)&bmfHdr, sizeof(BITMAPFILEHEADER), &dwWritten, NULL); 
	WriteFile(fh, (LPSTR)lpbi, dwDIBSize, &dwWritten, NULL); 
	GlobalUnlock(hDib); 
	GlobalFree(hDib); 
	CloseHandle(fh); 
	return TRUE;
}

