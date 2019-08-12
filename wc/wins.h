#pragma once

#include <windows.h>
#include "kstr.h"

struct winfo
{
    string path;
    wstring title;
    string id;
    DWORD  pid;
    LONG   x;
    LONG   y;
    LONG   width;
    LONG   height;
    LONG   index;
    string status;
};

HRESULT matchingWindows(char* id, vector<HWND>* wins);
winfo winInfo(HWND hWnd);