#include "handle.h"
#include <Tlhelp32.h>
#include <Psapi.h>
#include <iostream>
#include <sstream>
#include <algorithm>

using namespace std;

BOOL EnableTokenPrivilege(LPCTSTR pszPrivilege)
{
    static bool bEnabled = false;
    if (bEnabled) return TRUE;
    bEnabled = true;

    HANDLE hToken = 0;
    TOKEN_PRIVILEGES tkp = { 0 };

    if (!OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &hToken)) return FALSE;

    if (LookupPrivilegeValue(NULL, pszPrivilege, &tkp.Privileges[0].Luid))
    {
        tkp.PrivilegeCount = 1;
        tkp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

        AdjustTokenPrivileges(hToken, FALSE, &tkp, 0, (PTOKEN_PRIVILEGES)NULL, 0);

        return (GetLastError() == ERROR_SUCCESS);
    }

    return FALSE;
}

UINT g_CurrentIndex = 0;

struct THREAD_PARAMS
{
	PSYSTEM_HANDLE_INFORMATION pSysHandleInformation;
	GetFinalPathNameByHandleDef pGetFinalPathNameByHandle;
	LPTSTR lpPath;
	int nFileType;
	HANDLE hStartEvent;
	HANDLE hFinishedEvent;
	bool bStatus;
};

DWORD WINAPI ThreadProc( LPVOID lParam )
{
	THREAD_PARAMS* pThreadParam = (THREAD_PARAMS*)lParam;
	
	GetFinalPathNameByHandleDef pGetFinalPathNameByHandle = pThreadParam->pGetFinalPathNameByHandle;
	for( g_CurrentIndex; g_CurrentIndex < pThreadParam->pSysHandleInformation->dwCount;  )
	{

		WaitForSingleObject( pThreadParam->hStartEvent, INFINITE );
		ResetEvent( pThreadParam->hStartEvent );
		pThreadParam->bStatus = false;
		SYSTEM_HANDLE& sh = pThreadParam->pSysHandleInformation->Handles[g_CurrentIndex];
		g_CurrentIndex++;
		HANDLE hDup = (HANDLE)sh.wValue;
		HANDLE hProcess = OpenProcess( PROCESS_DUP_HANDLE , FALSE, sh.dwProcessId );
		if( hProcess )
		{
			BOOL b = DuplicateHandle( hProcess, (HANDLE)sh.wValue, GetCurrentProcess(), &hDup, 0, FALSE, DUPLICATE_SAME_ACCESS );
			if( !b )
			{
				hDup = (HANDLE)sh.wValue;
			}
			CloseHandle( hProcess );
		}
		DWORD dwRet = pGetFinalPathNameByHandle( hDup, pThreadParam->lpPath, MAX_PATH, 0 );
		if( hDup && (hDup != (HANDLE)sh.wValue))
		{
			CloseHandle( hDup );
		}
		if(dwRet)
		{
			pThreadParam->bStatus = true;
		}
		SetEvent( pThreadParam->hFinishedEvent );
		
	}
	return 0;
}

int cmp(const string& a, const string& b) { return a.compare(b) == 0; }

void EnumerateOpenedFiles(const string& csPath, GetFinalPathNameByHandleDef pGetFinalPathNameByHandle) 
{
	int nFileType = 25;
    char csShortName[MAX_PATH];
	GetShortPathNameA( csPath.c_str(), csShortName, MAX_PATH );
    bool bShortPath = !cmp(csShortName, csPath) && csShortName[0];

	HMODULE hModule = GetModuleHandleA("ntdll.dll");		
	PNtQuerySystemInformation NtQuerySystemInformation = (PNtQuerySystemInformation)GetProcAddress(hModule, "NtQuerySystemInformation");

	if (0 == NtQuerySystemInformation)
	{
		cerr << "NtQuerySystemInformation failed" << endl;
		return;
	}

	PSYSTEM_HANDLE_INFORMATION pSysHandleInformation = new SYSTEM_HANDLE_INFORMATION;
	DWORD size = sizeof(SYSTEM_HANDLE_INFORMATION);
	DWORD needed = 0;
	NTSTATUS status = NtQuerySystemInformation(SystemHandleInformation, pSysHandleInformation, size, &needed);

	if (!NT_SUCCESS(status))
	{
		if (0 == needed) return;

        delete pSysHandleInformation;
		size = needed + 1024;
		pSysHandleInformation = (PSYSTEM_HANDLE_INFORMATION)new BYTE[size];
		status = NtQuerySystemInformation( SystemHandleInformation, pSysHandleInformation, size, &needed );
		if (!NT_SUCCESS(status))
		{
			delete pSysHandleInformation;
			return;
		}
	}

	g_CurrentIndex = 0;

	TCHAR tcFileName[MAX_PATH+1];

	THREAD_PARAMS ThreadParams;

	ThreadParams.lpPath = tcFileName;
	ThreadParams.nFileType = nFileType;
	ThreadParams.pGetFinalPathNameByHandle = pGetFinalPathNameByHandle;
	ThreadParams.pSysHandleInformation = pSysHandleInformation;
	ThreadParams.hStartEvent    = ::CreateEvent(0, TRUE, FALSE, 0);
	ThreadParams.hFinishedEvent = ::CreateEvent(0, TRUE, FALSE, 0);

	HANDLE ThreadHandle = 0;

	while (g_CurrentIndex < pSysHandleInformation->dwCount)
	{
		if (!ThreadHandle)
		{
			ThreadHandle = CreateThread(0, 0, ThreadProc, &ThreadParams, 0, 0);
		}

		ResetEvent(ThreadParams.hFinishedEvent);
		SetEvent(ThreadParams.hStartEvent);

		//if (WAIT_TIMEOUT == WaitForSingleObject(ThreadParams.hFinishedEvent, 100))
        if (WAIT_TIMEOUT == WaitForSingleObject(ThreadParams.hFinishedEvent, 10))
		{
			TerminateThread(ThreadHandle, 0);
			CloseHandle(ThreadHandle);
			ThreadHandle = 0;
			continue;
		}

		if (!ThreadParams.bStatus)
		{
			continue;
		}

        wstring wpath(ThreadParams.lpPath);
        DWORD pid = pSysHandleInformation->Handles[g_CurrentIndex - 1].dwProcessId;
        //wcout << pid << " " << wpath.substr(4) << endl;
	}

	if (ThreadHandle)
	{
		CloseHandle(ThreadHandle);
	}

	CloseHandle(ThreadParams.hStartEvent);
	CloseHandle(ThreadParams.hFinishedEvent);
}

extern "C" __declspec(dllexport) void GetOpenedFiles(LPCSTR str)
{
    string csPath = str;

    transform(csPath.begin(), csPath.end(), csPath.begin(), [](unsigned char c) { return tolower(c); });

    EnableTokenPrivilege(SE_DEBUG_NAME);

    EnumerateOpenedFiles(csPath, (GetFinalPathNameByHandleDef)GetProcAddress(GetModuleHandleA("kernel32.dll"), "GetFinalPathNameByHandleW"));
}
