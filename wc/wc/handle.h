#pragma once

#include <windows.h>

#define NT_SUCCESS(Status) ((NTSTATUS)(Status) >= 0)

typedef struct _HANDLE_INFO
{
    USHORT tcDeviceName[260];
    USHORT tcFileName[260];
    ULONG uType;
} HANDLE_INFO;

typedef struct _ADDRESS_INFO
{
    PVOID pAddress;
} ADDRESS_INFO;

typedef struct _SYSTEM_HANDLE
{
    DWORD       dwProcessId;
    BYTE		bObjectType;
    BYTE		bFlags;
    WORD		wValue;
    PVOID       pAddress;
    DWORD GrantedAccess;
} SYSTEM_HANDLE;

typedef struct _SYSTEM_HANDLE_INFORMATION
{
    DWORD         dwCount;
    SYSTEM_HANDLE Handles[1];
} SYSTEM_HANDLE_INFORMATION, * PSYSTEM_HANDLE_INFORMATION, ** PPSYSTEM_HANDLE_INFORMATION;

typedef enum _SYSTEM_INFORMATION_CLASS {
    SystemHandleInformation = 0X10,
} SYSTEM_INFORMATION_CLASS;

typedef NTSTATUS(WINAPI* PNtQuerySystemInformation)
(IN	SYSTEM_INFORMATION_CLASS SystemInformationClass,
    OUT	PVOID					 SystemInformation,
    IN	ULONG					 SystemInformationLength,
    OUT	PULONG					 ReturnLength OPTIONAL);

enum OF_TYPE
{
	FILES_ONLY = 1,
	MODULES_ONLY = 2,
	ALL_TYPES = 3
};

struct OF_INFO_t
{
	DWORD dwPID;
	LPCWSTR lpFile;
	HANDLE hFile;
};

typedef void (CALLBACK* OF_CALLBACK)(OF_INFO_t OpenedFileInf0, UINT_PTR uUserContext );
typedef DWORD(WINAPI* GetFinalPathNameByHandleDef)(
    HANDLE hFile,
    LPWSTR lpszFilePath,
    DWORD cchFilePath,
    DWORD dwFlags);

extern "C" __declspec(dllexport) void GetOpenedFiles( LPCSTR lpPath );
