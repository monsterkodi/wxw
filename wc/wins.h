#pragma once

#include <windows.h>
#include "kstr.h"

struct winfo
{
    string path;
    wstring title;
    string hwnd;
    DWORD  pid;
    LONG   x;
    LONG   y;
    LONG   width;
    LONG   height;
    LONG   zindex;
    string status;
};

HRESULT matchingWindows(char* id, vector<HWND>* wins);
winfo winInfo(HWND hWnd);