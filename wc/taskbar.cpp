/*
000000000   0000000    0000000  000   000  0000000     0000000   00000000   
   000     000   000  000       000  000   000   000  000   000  000   000  
   000     000000000  0000000   0000000    0000000    000000000  0000000    
   000     000   000       000  000  000   000   000  000   000  000   000  
   000     000   000  0000000   000   000  0000000    000   000  000   000  
*/

#include "taskbar.h"
#include "kutl.h"
#include "wins.h"

bool taskbarIsHidden()
{
    HWND hWnd = FindWindow(L"Shell_TrayWnd", L"");
    LONG style = GetWindowLongW(hWnd, GWL_STYLE);
    return !(style & WS_VISIBLE);
}

// 00000000   00000000   0000000  000  0000000  00000000
// 000   000  000       000       000     000   000     
// 0000000    0000000   0000000   000    000    0000000 
// 000   000  000            000  000   000     000     
// 000   000  00000000  0000000   000  0000000  00000000

void resizeWindows(RECT& wa, int height)
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows("all", &wins)) || wins.size() == 0) return;
    
    for (HWND hWnd : wins)
    {
        winfo i = winInfo(hWnd);
        if (i.y+i.height > wa.bottom || i.y+i.height >= height-10) // window would overlay taskbar or bottom (almost) touches hiding taskbar
        {
            SetWindowPos(hWnd, NULL, i.x, i.y, i.width, wa.bottom-i.y, SWP_NOZORDER);
        }
        
        winfo n = winInfo(hWnd);
        if (i.width != n.width) // for some reason electron apps dont get the width we requested
        {
            SetWindowPos(hWnd, NULL, n.x, n.y, i.width+i.width-n.width, wa.bottom-i.y, SWP_NOZORDER);
        }
    }    
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

    static int position = 0;

    RECT wa;
    
    HWND hTaskBar = FindWindow(L"Shell_TrayWnd", L"");
    
    if (hTaskBar)
    {
        wRect tb = winRect(hTaskBar);
        
        SystemParametersInfo(SPI_GETWORKAREA,0,(LPVOID)&wa,0);
        
        int width  = GetSystemMetrics(SM_CXSCREEN);
        int height = GetSystemMetrics(SM_CYSCREEN);
        
        if (bShowTaskBar)
        {
            switch(position)
            {
                case 0: wa.bottom = height - tb.height; break;
                case 1: wa.left   = tb.width;           break; 
                case 2: wa.right  = width - tb.width;   break;
                case 3: wa.top    = tb.height;          break;
            }
            
            if (!position) resizeWindows(wa, height);
            ShowWindow(hTaskBar, SW_SHOW);
            SystemParametersInfo(SPI_SETWORKAREA,0,(LPVOID)&wa,0);
        }
        else
        {
            if      ( wa.left!=0)                 position = 1;
            else if ( wa.top!=0)                  position = 3;
            else if ((wa.right-wa.left) < width)  position = 2;
            else if ((wa.bottom-wa.top) < height) position = 0;

            wa.left   = 0;
            wa.top    = 0;
            wa.bottom = height;
            wa.right  = width;
            
            if (!position) 
            {
                RECT oa;
                SystemParametersInfo(SPI_GETWORKAREA,0,(LPVOID)&oa,0);
                resizeWindows(wa, oa.bottom);
            }
            ShowWindow(hTaskBar, SW_HIDE);
            SystemParametersInfo(SPI_SETWORKAREA,0,(LPVOID)&wa,0);
        }
    }
    else
    {
        return S_FALSE;
    }

    return S_OK;
}