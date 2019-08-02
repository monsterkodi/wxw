
#include "SystemInfo.h"
#include <process.h>
#include <winternl.h>

INtDll::PNtQuerySystemInformation   INtDll::NtQuerySystemInformation = NULL;
INtDll::PNtQueryObject              INtDll::NtQueryObject = NULL;
INtDll::PNtQueryInformationThread	INtDll::NtQueryInformationThread = NULL;
INtDll::PNtQueryInformationFile	    INtDll::NtQueryInformationFile = NULL;
INtDll::PNtQueryInformationProcess  INtDll::NtQueryInformationProcess = NULL;

BOOL EnableTokenPrivilege(LPCTSTR pszPrivilege)
{
	HANDLE hToken = 0;
	TOKEN_PRIVILEGES tkp = { 0 };

	if (!OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, &hToken)) return FALSE;

	if (LookupPrivilegeValue(NULL, pszPrivilege, &tkp.Privileges[0].Luid))
	{
		tkp.PrivilegeCount = 1;
		tkp.Privileges[0].Attributes = SE_PRIVILEGE_ENABLED;

		if (!AdjustTokenPrivileges(hToken, FALSE, &tkp, 0, (PTOKEN_PRIVILEGES)NULL, 0))
		{
			return false;
		}
	}
	return true;
}

BOOL INtDll::NtDllStatus = INtDll::Init();

BOOL INtDll::Init()
{
	NtQuerySystemInformation  = (PNtQuerySystemInformation) GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtQuerySystemInformation");
	NtQueryObject             = (PNtQueryObject)            GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtQueryObject");
	NtQueryInformationThread  = (PNtQueryInformationThread) GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtQueryInformationThread");
	NtQueryInformationFile    = (PNtQueryInformationFile)   GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtQueryInformationFile");
	NtQueryInformationProcess = (PNtQueryInformationProcess)GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtQueryInformationProcess");

	if (!EnableTokenPrivilege(SE_DEBUG_NAME))
	{
		cerr << "can't get debug privileges" << endl;
	}

	return  NtQuerySystemInformation	!= NULL &&
			NtQueryObject				!= NULL &&
			NtQueryInformationThread	!= NULL &&
			NtQueryInformationFile		!= NULL &&
			NtQueryInformationProcess	!= NULL;
}

// 00000000   00000000    0000000    0000000  00000000   0000000   0000000  000  000   000  00000000   0000000   
// 000   000  000   000  000   000  000       000       000       000       000  0000  000  000       000   000  
// 00000000   0000000    000   000  000       0000000   0000000   0000000   000  000 0 000  000000    000   000  
// 000        000   000  000   000  000       000            000       000  000  000  0000  000       000   000  
// 000        000   000   0000000    0000000  00000000  0000000   0000000   000  000   000  000        0000000   

SystemProcessInformation::SystemProcessInformation( BOOL bRefresh )
{
	m_pBuffer = (UCHAR*)VirtualAlloc ((void*)0x100000, BufferSize, MEM_COMMIT, PAGE_READWRITE);

	if (bRefresh) Refresh();
}

SystemProcessInformation::~SystemProcessInformation()
{
	VirtualFree( m_pBuffer, 0, MEM_RELEASE );
}

BOOL SystemProcessInformation::Refresh()
{
	m_ProcessInfos.clear();
	
	m_pCurrentProcessInfo = NULL;

    if (!NtDllStatus || m_pBuffer == NULL) return FALSE;
	
    if (INtDll::NtQuerySystemInformation( 5, m_pBuffer, BufferSize, NULL ) != 0) return FALSE;

	DWORD currentProcessID = GetCurrentProcessId();

	SYSTEM_PROCESS_INFORMATION* pSysProcess = (SYSTEM_PROCESS_INFORMATION*)m_pBuffer;
	do 
	{
		m_ProcessInfos.insert(std::pair<DWORD,SYSTEM_PROCESS_INFORMATION*>(pSysProcess->dUniqueProcessId, pSysProcess));

        if (pSysProcess->dUniqueProcessId == currentProcessID)
			m_pCurrentProcessInfo = pSysProcess;

        if (pSysProcess->dNext != 0)
			pSysProcess = (SYSTEM_PROCESS_INFORMATION*)((UCHAR*)pSysProcess + pSysProcess->dNext);
		else
			pSysProcess = NULL;

    } while (pSysProcess != NULL);

	return TRUE;
}

// 000   000   0000000   000   000  0000000    000      00000000  000  000   000  00000000   0000000 
// 000   000  000   000  0000  000  000   000  000      000       000  0000  000  000       000   000
// 000000000  000000000  000 0 000  000   000  000      0000000   000  000 0 000  000000    000   000
// 000   000  000   000  000  0000  000   000  000      000       000  000  0000  000       000   000
// 000   000  000   000  000   000  0000000    0000000  00000000  000  000   000  000        0000000 

HandleInformation::HandleInformation(DWORD pID, BOOL bRefresh)
{
	m_processId = pID;
	m_strTypeFilter = "";
	if (bRefresh) Refresh();
}

HandleInformation::HandleInformation(char* filter, BOOL bRefresh)
{
	m_processId = 0;
	m_strTypeFilter = filter;
	if (bRefresh) Refresh();
}

const string& HandleInformation::GetFilter()
{
	return m_strTypeFilter;
}

BOOL HandleInformation::Refresh()
{
	DWORD size = 0x2000;
	DWORD needed = 0;
	BOOL  ret = TRUE;
	string strType;

	m_HandleInfos.clear();

	if (!INtDll::NtDllStatus) return false;

	SYSTEM_HANDLE_INFORMATION* pSysHandleInformation = (SYSTEM_HANDLE_INFORMATION*)	VirtualAlloc(NULL, size, MEM_COMMIT, PAGE_READWRITE);

	if (pSysHandleInformation == NULL) return false;

	if (INtDll::NtQuerySystemInformation( 16, pSysHandleInformation, size, &needed ) != 0)
	{
		if (needed == 0)
		{
			ret = false;
			goto cleanup;
		}

		VirtualFree(pSysHandleInformation, 0, MEM_RELEASE);
		pSysHandleInformation = (SYSTEM_HANDLE_INFORMATION*) VirtualAlloc(NULL, size = needed + 256, MEM_COMMIT, PAGE_READWRITE);
	}
	
	if (pSysHandleInformation == NULL) return false;

	if (INtDll::NtQuerySystemInformation( 16, pSysHandleInformation, size, NULL ) != 0)
	{
		ret = true;
		goto cleanup;
	}
	
	for (DWORD i = 0; i < pSysHandleInformation->Count; i++)
	{
		BOOL add = false;

		if (m_processId && pSysHandleInformation->Handles[i].ProcessID == m_processId)
		{
			add = true;
		}
		else 
		{
			strType = GetTypeToken((HANDLE)pSysHandleInformation->Handles[i].HandleNumber, pSysHandleInformation->Handles[i].ProcessID);
			add = cmp(strType, m_strTypeFilter);
		}

		if (add)
		{	
			m_HandleInfos.push_back(pSysHandleInformation->Handles[i]);
		}
	}

cleanup:
	
	if (pSysHandleInformation != NULL) VirtualFree(pSysHandleInformation, 0, MEM_RELEASE);
	cout << m_HandleInfos.size() << " handles of type " << m_strTypeFilter << endl;
	return ret;
}

HANDLE HandleInformation::OpenProcess(DWORD processId)
{
	return ::OpenProcess(PROCESS_DUP_HANDLE, true, processId);
// 	return ::OpenProcess(PROCESS_DUP_HANDLE, false, processId);
}

HANDLE HandleInformation::DuplicateHandle(HANDLE hProcess, HANDLE hRemote)
{
	HANDLE hDup = NULL;
	::DuplicateHandle(hProcess, hRemote, GetCurrentProcess(), &hDup, 0, FALSE, DUPLICATE_SAME_ACCESS);
	return hDup;
}

string HandleInformation::GetTypeToken(HANDLE handle, DWORD processId)
{
	if (!handle) return "";

	DWORD size = 0;
	INtDll::NtQueryObject(handle, 2, NULL, 0, &size);

	PUBLIC_OBJECT_TYPE_INFORMATION typeInfo[2];

	wchar_t buf[2000];
	typeInfo[0].TypeName.MaximumLength = 0;
	typeInfo[0].TypeName.Buffer = buf;

	if (INtDll::NtQueryObject(handle, 2, typeInfo, size, NULL) == 0)
	{
		return w2s(typeInfo[0].TypeName.Buffer);
	}

	return "";
}

WORD HandleInformation::GetType(HANDLE h, DWORD processId)
{
	return GetTypeFromTypeToken(GetTypeToken(h, processId));
}

WORD HandleInformation::GetTypeFromTypeToken(const string& typeToken)
{
	const WORD count = 27;
	string constStrTypes[count] = { 
        "", "", "Directory", "SymbolicLink", "Token",
        "Process", "Thread", "Unknown7", "Event", "EventPair", "Mutant", 
        "Unknown11", "Semaphore", "Timer", "Profile", "WindowStation",
        "Desktop", "Section", "Key", "Port", "WaitablePort", 
        "Unknown21", "Unknown22", "Unknown23", "Unknown24",
        "IoCompletion", "File" };

	for (WORD i = 1; i < count; i++)
	{ 
		if (cmp(constStrTypes[i], typeToken)) return i;
	}
		
	return 0;
}

//void HandleInformation::GetFileNameThread(PVOID pParam)
//{
//	GetFileNameThreadParam* p = (GetFileNameThreadParam*)pParam;
//
//	IO_STATUS_BLOCK iob;
//
//	p->rc = INtDll::NtQueryInformationFile(p->hFile, &iob, p->pName, sizeof(p->pName), 9 /*FileNameInformation*/);
//}

typedef DWORD(WINAPI* GetFileNameDef)(HANDLE hFile, LPWSTR lpszFilePath, DWORD cchFilePath, DWORD dwFlags);
GetFileNameDef pGetHandleFileName = (GetFileNameDef)GetProcAddress(GetModuleHandleA("kernel32.dll"), "GetFinalPathNameByHandleW");

void HandleInformation::GetFileNameThread(PVOID pParam)
{
// 	THREAD_PARAMS* pThreadParam = (THREAD_PARAMS*)lParam;

	GetFileNameThreadParam* p = (GetFileNameThreadParam*)pParam;

	//for (g_CurrentIndex; g_CurrentIndex < pThreadParam->pSysHandleInformation->dwCount;)
	//{
	//	WaitForSingleObject(pThreadParam->hStartEvent, INFINITE);
	//	ResetEvent(pThreadParam->hStartEvent);
	//	pThreadParam->bStatus = false;

	//	SYSTEM_HANDLE& sh = pThreadParam->pSysHandleInformation->Handles[g_CurrentIndex];
	//	g_CurrentIndex++;

	//	HANDLE hDup = (HANDLE)sh.wValue;
	//	HANDLE hProcess = OpenProcess(PROCESS_DUP_HANDLE, FALSE, sh.dwProcessId);
	//	if (hProcess)
	//	{
	//		BOOL b = DuplicateHandle(hProcess, (HANDLE)sh.wValue, GetCurrentProcess(), &hDup, 0, FALSE, DUPLICATE_SAME_ACCESS);
	//		if (!b)
	//		{
	//			hDup = (HANDLE)sh.wValue;
	//		}
	//		CloseHandle(hProcess);
	//	}

	pGetHandleFileName(p->hFile, p->pName, MAX_PATH, 0);

	//	if (hDup && (hDup != (HANDLE)sh.wValue))
	//	{
	//		CloseHandle(hDup);
	//	}

	//	if (dwRet)
	//	{
	//		pThreadParam->bStatus = true;
	//	}
	//	SetEvent(pThreadParam->hFinishedEvent);
	//}
	//return 0;
}

string HandleInformation::GetFileName(HANDLE handle)
{
	string ret("");
	HANDLE hThread = NULL;
	GetFileNameThreadParam tp;
	HANDLE hRemoteProcess = NULL;
	
	tp.hFile = handle;
	tp.pName[0] = 0;
	tp.rc = 0;

	hThread = (HANDLE)_beginthread(GetFileNameThread, 0, &tp);

	if (hThread == NULL)
	{
		return ret;
	}

	if (WaitForSingleObject(hThread, 100) == WAIT_TIMEOUT)
	{	
		TerminateThread(hThread, 0);
		ret = "";
	}
	else
	{
		if (tp.rc != 0)
		{
			// error?
		}
		else
		{ 
			//ret = tp.pName;
			ret = w2s(wstring(tp.pName));
		}
	}

	return ret;
}

