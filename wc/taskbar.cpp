/*
000000000   0000000    0000000  000   000  0000000     0000000   00000000   
   000     000   000  000       000  000   000   000  000   000  000   000  
   000     000000000  0000000   0000000    0000000    000000000  0000000    
   000     000   000       000  000  000   000   000  000   000  000   000  
   000     000   000  0000000   000   000  0000000    000   000  000   000  
*/

#include "taskbar.h"
#include "kutl.h"

bool taskbarIsHidden()
{
    HWND hWnd = FindWindow(L"Shell_TrayWnd", L"");
    LONG style = GetWindowLongW(hWnd, GWL_STYLE);
    return !(style & WS_VISIBLE);
}

// 000000000   0000000    0000000  000   000  0000000     0000000   00000000   
//    000     000   000  000       000  000   000   000  000   000  000   000  
//    000     000000000  0000000   0000000    0000000    000000000  0000000    
//    000     000   000       000  000  000   000   000  000   000  000   000  
//    000     000   000  0000000   000   000  0000000    000   000  000   000  

HRESULT taskbar(char* id)
{
    BOOL bShowTaskBar = true;
    
    if (cmp(id, "hide"))
    {
        bShowTaskBar = false;
    }
    else if (cmp(id, "toggle"))
    {
        bShowTaskBar = taskbarIsHidden();
    }

    static int nTaskBarPosition = 0;

    RECT rcWorkArea;
    
    HWND hTaskBar = FindWindow(L"Shell_TrayWnd", L"");
    
    if (hTaskBar)
    {
        wRect tb = winRect(hTaskBar);
        
        SystemParametersInfo(SPI_GETWORKAREA,0,(LPVOID)&rcWorkArea,0);
        
        int nWidth  = ::GetSystemMetrics(SM_CXSCREEN);
        int nHeight = ::GetSystemMetrics(SM_CYSCREEN);
        
        if (bShowTaskBar)
        {
            switch(nTaskBarPosition)
            {
                case 0: rcWorkArea.bottom = nHeight - tb.height; break;
                case 1: rcWorkArea.left   = tb.width; break; 
                case 2: rcWorkArea.right  = nWidth - tb.width; break;
                case 3: rcWorkArea.top    = tb.height; break;
            }
            SystemParametersInfo(SPI_SETWORKAREA,0,(LPVOID)&rcWorkArea,0);
            ShowWindow(hTaskBar, SW_SHOW);
        }
        else
        {
            if      ( rcWorkArea.left!=0) nTaskBarPosition = 1;
            else if ( rcWorkArea.top!=0)  nTaskBarPosition = 3;
            else if ((rcWorkArea.right-rcWorkArea.left) < nWidth)  nTaskBarPosition = 2;
            else if ((rcWorkArea.bottom-rcWorkArea.top) < nHeight) nTaskBarPosition = 0;

            rcWorkArea.left   = 0;
            rcWorkArea.top    = 0;
            rcWorkArea.bottom = nHeight;
            rcWorkArea.right  = nWidth;
            SystemParametersInfo(SPI_SETWORKAREA,0,(LPVOID)&rcWorkArea,0);
            ShowWindow(hTaskBar, SW_HIDE);
        }
    }
    else
    {
        return S_FALSE;
    }

    return S_OK;
}