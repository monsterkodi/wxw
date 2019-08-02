#pragma once

#include <windows.h>
#include <gdiplus.h>

using namespace Gdiplus;

HRESULT icon(char* id, char* targetfile=NULL);
bool saveBitmap(Bitmap* bitmap, const char* targetfile);
bool saveBitmap(HBITMAP hbitmap, const char* targetfile);
