#pragma once

//#pragma warning( disable : 4786 )
//#pragma warning( disable : 4200 )

#include <windows.h>
#include <vector>
#include <map>
#include "kstr.h"

typedef struct _THREAD_INFORMATION
{
	DWORD		ProcessId;
	DWORD		ThreadId;
	HANDLE		ThreadHandle;
} THREAD_INFORMATION;

typedef struct _BASIC_THREAD_INFORMATION 
{
	DWORD u1;
	DWORD u2;
	DWORD u3;
	DWORD ThreadId;
	DWORD u5;
	DWORD u6;
	DWORD u7;
} BASIC_THREAD_INFORMATION;

class INtDll
{
public:
	typedef DWORD (WINAPI *PNtQueryObject)( HANDLE, DWORD, VOID*, DWORD, VOID* );
	typedef DWORD (WINAPI *PNtQuerySystemInformation)( DWORD, VOID*, DWORD, ULONG* );
	typedef DWORD (WINAPI *PNtQueryInformationThread)(HANDLE, ULONG, PVOID,	DWORD, DWORD* );
	typedef DWORD (WINAPI *PNtQueryInformationFile)(HANDLE, PVOID,	PVOID, DWORD, DWORD );
	typedef DWORD (WINAPI *PNtQueryInformationProcess)(HANDLE, DWORD, PVOID, DWORD, PVOID );
	
	static PNtQuerySystemInformation	NtQuerySystemInformation;
	static PNtQueryObject				NtQueryObject;
	static PNtQueryInformationThread	NtQueryInformationThread;
	static PNtQueryInformationFile		NtQueryInformationFile;
	static PNtQueryInformationProcess	NtQueryInformationProcess;

	static BOOL							NtDllStatus;
	static DWORD						dwNTMajorVersion;

	static BOOL Init();
};

class SystemProcessInformation : public INtDll
{
public:
	typedef LARGE_INTEGER   QWORD;

	typedef struct _PROCESS_BASIC_INFORMATION 
	{
		DWORD ExitStatus;
		PVOID PebBaseAddress;
		DWORD AffinityMask;
		DWORD BasePriority;
		DWORD UniqueProcessId;
		DWORD InheritedFromUniqueProcessId;
	} PROCESS_BASIC_INFORMATION;

	typedef struct _VM_COUNTERS
	{
		DWORD PeakVirtualSize;
		DWORD VirtualSize;
		DWORD PageFaultCount;
		DWORD PeakWorkingSetSize;
		DWORD WorkingSetSize;
		DWORD QuotaPeakPagedPoolUsage;
		DWORD QuotaPagedPoolUsage;
		DWORD QuotaPeakNonPagedPoolUsage;
		DWORD QuotaNonPagedPoolUsage;
		DWORD PagefileUsage;
		DWORD PeakPagefileUsage;
	} VM_COUNTERS;

	typedef struct _SYSTEM_THREAD
	{
	DWORD        u1;
	DWORD        u2;
	DWORD        u3;
	DWORD        u4;
	DWORD        ProcessId;
	DWORD        ThreadId;
	DWORD        dPriority;
	DWORD        dBasePriority;
	DWORD        dContextSwitches;
	DWORD        dThreadState;      // 2=running, 5=waiting
	DWORD        WaitReason;
	DWORD        u5;
	DWORD        u6;
	DWORD        u7;
	DWORD        u8;
	DWORD        u9;
	} SYSTEM_THREAD;

	typedef struct _SYSTEM_PROCESS_INFORMATION
	{
	DWORD          dNext;
	DWORD          dThreadCount;
	DWORD          dReserved01;
	DWORD          dReserved02;
	DWORD          dReserved03;
	DWORD          dReserved04;
	DWORD          dReserved05;
	DWORD          dReserved06;
	QWORD          qCreateTime;
	QWORD          qUserTime;
	QWORD          qKernelTime;
	string         usName;
	DWORD	       BasePriority;
	DWORD          dUniqueProcessId;
	DWORD          dInheritedFromUniqueProcessId;
	DWORD          dHandleCount;
	DWORD          dReserved07;
	DWORD          dReserved08;
	VM_COUNTERS    VmCounters;
	DWORD          dCommitCharge;
	SYSTEM_THREAD  Threads[1];
	} SYSTEM_PROCESS_INFORMATION;

	enum { BufferSize = 0x10000 };

	SystemProcessInformation( BOOL bRefresh = FALSE );
	virtual ~SystemProcessInformation();

	BOOL Refresh();

	map<DWORD, SYSTEM_PROCESS_INFORMATION*> m_ProcessInfos;
	SYSTEM_PROCESS_INFORMATION* m_pCurrentProcessInfo;

	UCHAR* m_pBuffer;
};

class HandleInformation : public INtDll
{
public:
	enum {
		OB_TYPE_UNKNOWN = 0,
		OB_TYPE_DIRECTORY = 2,
		OB_TYPE_FILE = 26                        
	} SystemHandleType;

	typedef struct _SYSTEM_HANDLE 
	{
		DWORD       ProcessID;
		BYTE		HandleType;
		BYTE		Flags;
		WORD		HandleNumber;
		PVOID       KernelAddress;
		DWORD		GrantedAccess;
	} SYSTEM_HANDLE;

	typedef struct _SYSTEM_HANDLE_INFORMATION
	{
		DWORD			Count;
		SYSTEM_HANDLE	Handles[1];
	} SYSTEM_HANDLE_INFORMATION;

	typedef struct _GetFileNameThreadParam
	{
		HANDLE		hFile;
		wchar_t     pName[2000];
		ULONG		rc;
	} GetFileNameThreadParam;

	HandleInformation(DWORD pID = (DWORD)-1, BOOL bRefresh = TRUE);
	HandleInformation(char* lpTypeFilter, BOOL bRefresh = TRUE);

	const string& GetFilter();
	
	BOOL Refresh();

	static WORD GetType( HANDLE, DWORD processId = GetCurrentProcessId() );
	static WORD GetTypeFromTypeToken(const string& typeToken);
	static string GetTypeToken( HANDLE, DWORD processId = GetCurrentProcessId() );
	static string GetFileName(HANDLE);

	static HANDLE OpenProcess( DWORD processId );
	static HANDLE DuplicateHandle( HANDLE hProcess, HANDLE hRemote );

	static void GetFileNameThread( PVOID /* GetFileNameThreadParam* */ );

	vector<SYSTEM_HANDLE> m_HandleInfos;
	DWORD	m_processId;

	string	m_strTypeFilter;
};

