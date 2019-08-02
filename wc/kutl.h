#pragma once

#include "kstr.h"
#include <windows.h>
#include <tlhelp32.h>

int  klog(const char* msg);
void flog(const char* format, ...);

bool fileExists(char* szPath);
bool dirExists (char* szPath);

DWORD now();

struct wRect
{
    LONG x;
    LONG y;
    LONG width;
    LONG height;
};

wRect   winRect         (HWND hWnd);
wstring windowTitle     (HWND hWnd);
string  windowStatus    (HWND hWnd);

bool    isMinimized     (HWND hWnd);
bool    isWindowCloaked (HWND hWnd);

struct procinfo
{
	string   path;
	uint32_t pid;
	uint32_t parent;
};

string procPath(DWORD pid);
vector<procinfo> procs(char* id = NULL);
HRESULT terminateProc(DWORD procid);

bool findFile(const wstring& directory, const wstring& filename, wstring& result);