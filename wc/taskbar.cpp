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
            ShowWindow(hTaskBar, SW_SHOW);
            cout << "hide " << wa.right << " " << wa.bottom << endl;
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
            
            ShowWindow(hTaskBar, SW_HIDE);
            cout << "hide " << width << " " << height << endl;
            SystemParametersInfo(SPI_SETWORKAREA,0,(LPVOID)&wa,0);
        }
    }
    else
    {
        return S_FALSE;
    }

    return S_OK;
}