/*
000   000   0000000   000   000  0000000    000      00000000  
000   000  000   000  0000  000  000   000  000      000       
000000000  000000000  000 0 000  000   000  000      0000000   
000   000  000   000  000  0000  000   000  000      000       
000   000  000   000  000   000  0000000    0000000  00000000  
*/

#include "handle.h"
#include "kutl.h"

UINT g_CurrentIndex = 0;

typedef struct _SYSTEM_HANDLE 
{
    DWORD dwProcessId;
    BYTE  bObjectType;
    BYTE  bFlags;
    WORD  wValue;
    PVOID pAddress;
    DWORD GrantedAccess;
    
}   SYSTEM_HANDLE;

typedef struct _SYSTEM_HANDLE_INFORMATION 
{
    DWORD         dwCount;
    SYSTEM_HANDLE Handles[1];
    
}   SYSTEM_HANDLE_INFORMATION, * PSYSTEM_HANDLE_INFORMATION;

typedef enum _SYSTEM_INFORMATION_CLASS 
{
    SystemHandleInformation = 0X10,
    
}   SYSTEM_INFORMATION_CLASS;

struct THREAD_PARAMS
{
	PSYSTEM_HANDLE_INFORMATION pSysHandleInformation;
    LPTSTR  lpPath;
    HANDLE  hStartEvent;
    HANDLE  hFinishedEvent;
    bool    bStatus;
};

typedef DWORD(WINAPI* GetFinalPathNameByHandleDef)(HANDLE hFile, LPWSTR lpszFilePath, DWORD cchFilePath, DWORD dwFlags);
GetFinalPathNameByHandleDef pGetFinalPathNameByHandle = (GetFinalPathNameByHandleDef)GetProcAddress(GetModuleHandleA("kernel32.dll"), "GetFinalPathNameByHandleW");

// 000000000  000   000  00000000   00000000   0000000   0000000    
//    000     000   000  000   000  000       000   000  000   000  
//    000     000000000  0000000    0000000   000000000  000   000  
//    000     000   000  000   000  000       000   000  000   000  
//    000     000   000  000   000  00000000  000   000  0000000    

DWORD WINAPI ThreadProc(LPVOID lParam)
{
	THREAD_PARAMS* pThreadParam = (THREAD_PARAMS*)lParam;
	
	for (g_CurrentIndex; g_CurrentIndex < pThreadParam->pSysHandleInformation->dwCount;)
	{
		WaitForSingleObject(pThreadParam->hStartEvent, INFINITE);
		ResetEvent(pThreadParam->hStartEvent);
		pThreadParam->bStatus = false;

		SYSTEM_HANDLE& sh = pThreadParam->pSysHandleInformation->Handles[g_CurrentIndex];
		g_CurrentIndex++;

		HANDLE hDup = (HANDLE)sh.wValue;
		HANDLE hProcess = OpenProcess(PROCESS_DUP_HANDLE , FALSE, sh.dwProcessId);
		if (hProcess)
		{
			BOOL b = DuplicateHandle(hProcess, (HANDLE)sh.wValue, GetCurrentProcess(), &hDup, 0, FALSE, DUPLICATE_SAME_ACCESS );
			if (!b)
			{
				hDup = (HANDLE)sh.wValue;
			}
			CloseHandle(hProcess);
		}

		DWORD dwRet = pGetFinalPathNameByHandle(hDup, pThreadParam->lpPath, MAX_PATH, 0);

		if (hDup && (hDup != (HANDLE)sh.wValue))
		{
			CloseHandle(hDup);
		}

		if (dwRet)
		{
			pThreadParam->bStatus = true;
		}
		SetEvent(pThreadParam->hFinishedEvent);
	}
	return 0;
}

// 000   000   0000000   000   000  0000000    000      00000000  
// 000   000  000   000  0000  000  000   000  000      000       
// 000000000  000000000  000 0 000  000   000  000      0000000   
// 000   000  000   000  000  0000  000   000  000      000       
// 000   000  000   000  000   000  0000000    0000000  00000000  

HRESULT handle(const char* id)
{
    HMODULE hModule = GetModuleHandleA("ntdll.dll"); 
    
    int procid = atoi(id);
    
    typedef NTSTATUS(WINAPI* PNtQuerySystemInformation) (IN SYSTEM_INFORMATION_CLASS SystemInformationClass, OUT PVOID SystemInformation, IN ULONG SystemInformationLength, OUT PULONG ReturnLength OPTIONAL);
	PNtQuerySystemInformation NtQuerySystemInformation = (PNtQuerySystemInformation)GetProcAddress(hModule, "NtQuerySystemInformation");

	if (0 == NtQuerySystemInformation)
	{
		cerr << "NtQuerySystemInformation failed" << endl;
		return S_FALSE;
	}

	PSYSTEM_HANDLE_INFORMATION pSysHandleInformation = new SYSTEM_HANDLE_INFORMATION;
	DWORD size = sizeof(SYSTEM_HANDLE_INFORMATION);
	DWORD needed = 0;
	NTSTATUS status = NtQuerySystemInformation(SystemHandleInformation, pSysHandleInformation, size, &needed);

    if (status < 0)
	{
		if (0 == needed) return S_FALSE;

        delete pSysHandleInformation;
		size = needed + 1024;
		pSysHandleInformation = (PSYSTEM_HANDLE_INFORMATION)new BYTE[size];
		status = NtQuerySystemInformation(SystemHandleInformation, pSysHandleInformation, size, &needed);
        if (status < 0)
		{
			delete pSysHandleInformation;
			cerr << "NtQuerySystemInformation failed" << endl;
			return S_FALSE;
		}
	}

	g_CurrentIndex = 0;

	TCHAR tcFileName[MAX_PATH+1];

	THREAD_PARAMS ThreadParams;

	ThreadParams.lpPath = tcFileName;
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

        if (WAIT_TIMEOUT == WaitForSingleObject(ThreadParams.hFinishedEvent, 10)) // 100
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

        string file = slash(w2s(wstring(ThreadParams.lpPath).substr(4)));

        DWORD pid = pSysHandleInformation->Handles[g_CurrentIndex - 1].dwProcessId;
        if (!id || contains(file, id) || (procid && procid == pid))
		{ 
            string ppath = procPath(pid);
            if (ppath.size())
			{ 
                cout << lpad(itos(pid), 6) << " " << pad(fileName(ppath), 30) << " " << file << endl;
			}
		}
	}

	if (ThreadHandle)
	{
		CloseHandle(ThreadHandle);
	}

	CloseHandle(ThreadParams.hStartEvent);
	CloseHandle(ThreadParams.hFinishedEvent);

	return S_OK;
}
    
