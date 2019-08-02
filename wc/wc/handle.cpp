
#include "handle.h"
#include <Tlhelp32.h>
#include <Psapi.h>
#include "kutl.h"
#include "SystemInfo.h"

UINT g_CurrentIndex = 0;

typedef DWORD(WINAPI* GetFinalPathNameByHandleDef)(HANDLE hFile, LPWSTR lpszFilePath, DWORD cchFilePath, DWORD dwFlags);

GetFinalPathNameByHandleDef pGetFinalPathNameByHandle = (GetFinalPathNameByHandleDef)GetProcAddress(GetModuleHandleA("kernel32.dll"), "GetFinalPathNameByHandleW");

struct THREAD_PARAMS
{
	PSYSTEM_HANDLE_INFORMATION pSysHandleInformation;
	LPTSTR lpPath;
	HANDLE hStartEvent;
	HANDLE hFinishedEvent;
	bool bStatus;
};

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

HRESULT handle(const char* id)
{
//// 	for (auto info : procs(id))
//// 	{
//// 		HANDLE hProcess = OpenProcess(PROCESS_DUP_HANDLE, FALSE, info.pid);
//// 		printf(".\n");
//// 		printf("    path    %s\n", info.path.c_str());
//// 		printf("    pid     %lu\n", info.pid);
//// 		printf("    parent  %lu\n", info.parent);
//// 	}

	string name;
	string processName;
	string deviceFileName;
    // string fsFilePath;
	//SystemProcessInformation::SYSTEM_PROCESS_INFORMATION* p;
	//SystemProcessInformation pi;
	HandleInformation hi("File");

	//if (bFullPathCheck)
	//{
	//	if (!SystemInfoUtils::GetDeviceFileName(lpFileName, deviceFileName))
	//	{
    //      printf("GetDeviceFileName() failed.\n"));
	//		return;
	//	}
	//}

	//hi.SetFilter("File", TRUE);

	if (hi.m_HandleInfos.size() == 0)
	{
		printf("No handle information\n");
		return S_FALSE;
	}

	//pi.Refresh();

    printf("%-6s  %-20s  %s\n", "PID", "Name", "Path");
    printf("------------------------------------------------------\n");

    for (int i = 0; i < hi.m_HandleInfos.size(); i++)
	{
        HandleInformation::SYSTEM_HANDLE& h = hi.m_HandleInfos[i];

        // if (pi.m_ProcessInfos.Lookup(h.ProcessID, p))
        // {
            // SystemInfoUtils::Unicode2CString(&p->usName, processName);
        // }
        // else
            // processName = "";
        name = hi.GetFileName((HANDLE)h.HandleNumber);

        // if (bFullPathCheck)
            // bShow = _tcsicmp(name, deviceFileName) == 0;
        // else
            // bShow = _tcsicmp(GetFileNamePosition(name), lpFileName) == 0;

        // if (bShow)
        // {
            // if (!bFullPathCheck)
            // {
                // fsFilePath = "";
                // SystemInfoUtils::GetFsFileName(name, fsFilePath);
            // }

        printf("0x%04X  %-20s  %s\n", h.ProcessID, processName.c_str(), name.c_str());
        // }
	}

	return S_OK;
}

HRESULT handle2(const char* id)
{
	HMODULE hModule = GetModuleHandleA("ntdll.dll");		
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

	if (!NT_SUCCESS(status))
	{
		if (0 == needed) return S_FALSE;

        delete pSysHandleInformation;
		size = needed + 1024;
		pSysHandleInformation = (PSYSTEM_HANDLE_INFORMATION)new BYTE[size];
		status = NtQuerySystemInformation(SystemHandleInformation, pSysHandleInformation, size, &needed);
		if (!NT_SUCCESS(status))
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

		if (contains(file, id))
		{ 
			DWORD pid = pSysHandleInformation->Handles[g_CurrentIndex - 1].dwProcessId;
			if (procPath(pid).size())
			{ 
				cout << pid << " " << procPath(pid) << " " << file << endl;
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
    
