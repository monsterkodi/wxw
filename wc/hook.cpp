/*
000   000   0000000    0000000   000   000
000   000  000   000  000   000  000  000 
000000000  000   000  000   000  0000000  
000   000  000   000  000   000  000  000 
000   000   0000000    0000000   000   000
*/

#include "hook.h"
#include "kutl.h"
#include "wins.h"
#include "uiohook/uiohook.h"
#include <winsock.h>

// 000   000  0000000    00000000   
// 000   000  000   000  000   000  
// 000   000  000   000  00000000   
// 000   000  000   000  000        
//  0000000   0000000    000        

SOCKET udpSocket;
struct sockaddr_in udpAddr;

bool initUDP(uint32_t port = 66666)
{
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(1, 1), &wsa))
    {
        cerr << "Failed to init Winsock!" << endl;
        return false;
    }

    udpSocket = socket(PF_INET, SOCK_DGRAM, 0);
    if (udpSocket < 0)
    {
        cerr << "socket() failed: " << WSAGetLastError() << endl;
        return false;
    }

    int bAllow = 1;
    if (setsockopt(udpSocket, SOL_SOCKET, SO_BROADCAST, (char*)& bAllow, sizeof(bAllow)) < 0)
    {
        cerr << "setsockopt() failed: " << WSAGetLastError() << endl;
        closesocket(udpSocket);
        return false;
    }

    memset(&udpAddr, 0, sizeof(udpAddr));

    udpAddr.sin_port = htons(port);
    udpAddr.sin_family = AF_INET;
    udpAddr.sin_addr.s_addr = INADDR_BROADCAST;

    return true;
}

int sendUDP(const string& msg)
{
    const int length = (int)msg.length();

    int bytes = sendto(udpSocket, msg.c_str(), length, 0, (sockaddr*)& udpAddr, sizeof(struct sockaddr_in));

    if (bytes < length)
    {
        cerr << "WARNING: only sent " << bytes << " bytes! (Expected " << length << ')' << endl;
        return 1;
    }

    return bytes;
}

void closeUDP()
{
    closesocket(udpSocket);
}

// 00000000  000   000  00000000  000   000  000000000  
// 000       000   000  000       0000  000     000     
// 0000000    000 000   0000000   000 0 000     000     
// 000          000     000       000  0000     000     
// 00000000      0      00000000  000   000     000     

void hook_event(uiohook_event* const event) 
{
    char buffer[256] = { 0 };
    
    switch (event->type) 
    {
    case EVENT_KEY_PRESSED:    snprintf(buffer, sizeof(buffer), "{\"event\":\"keydown\", \"code\":%d, \"raw\":%d}", event->data.keyboard.keycode, event->data.keyboard.rawcode); break;
    case EVENT_KEY_RELEASED:   snprintf(buffer, sizeof(buffer), "{\"event\":\"keyup\", \"code\":%d, \"raw\":%d}", event->data.keyboard.keycode, event->data.keyboard.rawcode); break;
    case EVENT_MOUSE_PRESSED:  snprintf(buffer, sizeof(buffer), "{\"event\":\"mousedown\", \"x\":%i, \"y\":%i, \"button\":%i}", event->data.mouse.x, event->data.mouse.y, event->data.mouse.button); break;
    case EVENT_MOUSE_RELEASED: snprintf(buffer, sizeof(buffer), "{\"event\":\"mouseup\", \"x\":%i, \"y\":%i, \"button\":%i}", event->data.mouse.x, event->data.mouse.y, event->data.mouse.button); break;
    case EVENT_MOUSE_CLICKED:  snprintf(buffer, sizeof(buffer), "{\"event\":\"mouseclick\", \"x\":%i, \"y\":%i, \"button\":%i}", event->data.mouse.x, event->data.mouse.y, event->data.mouse.button); break;
    case EVENT_MOUSE_DRAGGED:                                     
    case EVENT_MOUSE_MOVED:    snprintf(buffer, sizeof(buffer), "{\"event\":\"mousemove\", \"x\":%i, \"y\":%i}", event->data.mouse.x, event->data.mouse.y); break;
    case EVENT_MOUSE_WHEEL:    snprintf(buffer, sizeof(buffer), "{\"event\":\"mousewheel\", \"delta\":%i}", event->data.wheel.amount * event->data.wheel.rotation); break;
    default: snprintf(buffer, sizeof(buffer), "{\"event\": \"unknow\", \"type\":%d}", event->type); break;
    }
    
    sendUDP(buffer);
}

//  0000000  00000000  000   000  0000000    
// 000       000       0000  000  000   000  
// 0000000   0000000   000 0 000  000   000  
//      000  000       000  0000  000   000  
// 0000000   00000000  000   000  0000000    

void sendProc()
{
    ostringstream ss;

    ss << "{\"event\":\"proc\",\n \"proc\": [\n";
    for (auto info : procs())
    {
        ss << "   {\"path\":    \"" << slash(info.path) << "\",\n";
        ss << "    \"pid\":     "   << info.pid    << ",\n";
        ss << "    \"parent\":  "   << info.parent << "\n";
        ss << "   },\n";
    }
    ss << "{}]}";
    sendUDP(ss.str());
}

void sendInfo()
{
    vector<HWND> wins;
    if (!SUCCEEDED(matchingWindows("all", &wins)) || wins.size() == 0) return;

    ostringstream ss;

    ss << "{\"event\":\"info\",\n \"info\": [\n";
    
    for (HWND hWnd : wins)
    {
        winfo i = winInfo(hWnd);
         
        string title = replace(w2s(i.title), "\\", "\\\\");
        
        ss << "   {\"path\":    \"" << slash(i.path) << "\",\n";
        ss << "    \"title\":   \"" << title         << "\",\n";
        ss << "    \"hwnd\":    \"" << i.hwnd        << "\",\n";
        ss << "    \"pid\":     "   << i.pid         << ",\n";
        ss << "    \"x\":       "   << i.x           << ",\n";
        ss << "    \"y\":       "   << i.y           << ",\n";
        ss << "    \"width\":   "   << i.width       << ",\n";
        ss << "    \"height\":  "   << i.height      << ",\n";
        ss << "    \"zindex\":  "   << i.zindex      << ",\n";
        ss << "    \"status\":  \"" << i.status      << "\"\n";
        ss << "   },\n";
    }
    ss << "{}]}";    
    sendUDP(ss.str());    
}

// 000  000   000  000  000000000  
// 000  0000  000  000     000     
// 000  000 0 000  000     000     
// 000  000  0000  000     000     
// 000  000   000  000     000     

void initHook()
{
    initUDP();
    hook_set_dispatch_proc(&hook_event);
    
    cout << "hook..." << endl;
    
    hook_run();
    
    DWORD last = now();
    DWORD msec = 0;
    MSG message;
    while (true) 
    {        
        if (PeekMessage(&message, (HWND)NULL, 0, 0, PM_REMOVE))
        {
            if (message.message == WM_QUIT)
            {
                break;
            }
            TranslateMessage(&message);
            DispatchMessage(&message);
        }
                
        DWORD n = now();
        DWORD delta =  n - last;
        if (delta > 0)
        {
            last = n;
            
            if (msec < 500 && msec+delta >= 500)
            {
                sendInfo();
            }
            else if (msec < 1000 && msec+delta >= 1000)
            {
                sendProc();
            }
            msec += delta;
            if (msec >= 1000)
            {
                msec -= 1000;
            }
        }
        else
        {
            Sleep(1);
        }
    }
    
    cout << "...hook" << endl;
    hook_end();
    closeUDP();
}
