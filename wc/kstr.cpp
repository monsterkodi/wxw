
#include "kstr.h"
#include <codecvt>

//  0000000   0000000   000   000  000   000  00000000  00000000   000000000    
// 000       000   000  0000  000  000   000  000       000   000     000       
// 000       000   000  000 0 000   000 000   0000000   0000000       000       
// 000       000   000  000  0000     000     000       000   000     000       
//  0000000   0000000   000   000      0      00000000  000   000     000       

wstring s2w(const string& str)
{
	using convert_typeX = codecvt_utf8<wchar_t>;
	wstring_convert<convert_typeX, wchar_t> converterX;

	return converterX.from_bytes(str);
}

string w2s(const wstring& wstr)
{
	using convert_typeX = codecvt_utf8<wchar_t>;
	wstring_convert<convert_typeX, wchar_t> converterX;

	return converterX.to_bytes(wstr);
}

//  0000000  00     00  00000000   
// 000       000   000  000   000  
// 000       000000000  00000000   
// 000       000 0 000  000        
//  0000000  000   000  000        

int cmp(const wstring& a, const wstring& b) { return a.compare(b) == 0; }
int cmp(const string& a,  const string& b)  { return a.compare(b) == 0; }
int cmp(const wstring& a, const char*    b) { return cmp(a, s2w(b)); }
int cmp(const char*    a, const char*    b) { return _strcmpi(a, b) == 0; }

//  0000000   0000000   000   000  000000000   0000000   000  000   000   0000000  
// 000       000   000  0000  000     000     000   000  000  0000  000  000       
// 000       000   000  000 0 000     000     000000000  000  000 0 000  0000000   
// 000       000   000  000  0000     000     000   000  000  000  0000       000  
//  0000000   0000000   000   000     000     000   000  000  000   000  0000000   

bool contains(const wstring& str, const wstring& sub)
{
	return str.find(sub) != wstring::npos;
}

bool contains(const string& str, const string& sub)
{
	return str.find(sub) != string::npos;
}

// 000       0000000   000   000  00000000  00000000   
// 000      000   000  000 0 000  000       000   000  
// 000      000   000  000000000  0000000   0000000    
// 000      000   000  000   000  000       000   000  
// 0000000   0000000   00     00  00000000  000   000  

string lower(const string& in)
{
    string out(in);
    transform(out.begin(), out.end(), out.begin(), [](unsigned char c) { return tolower(c); });
    return out;
}

// 00000000   00000000  00000000   000       0000000    0000000  00000000  
// 000   000  000       000   000  000      000   000  000       000       
// 0000000    0000000   00000000   000      000000000  000       0000000   
// 000   000  000       000        000      000   000  000       000       
// 000   000  00000000  000        0000000  000   000   0000000  00000000  

stringreplace(string const& original, string const& from, string const& to)
{
    string result;
    string::const_iterator end     = original.end();
    string::const_iterator current = original.begin();
    string::const_iterator next    = search(current, end, from.begin(), from.end());
    while (next != end) 
    {
        result.append(current, next);
        result.append(to);
        current = next + from.size();
        next = search(current, end, from.begin(), from.end());
    }
    result.append(current, next);
    return result;
}

string pad(const string& str, int count, char ch)
{
    string out(str);
    while (out.size() < count)
    {
        out += ch;
    }
    return out;
}

string lpad(const string& str, int count, char ch)
{
    string out(str);
    while (out.size() < count)
    {
        out = ch + out;
    }
    return out;
}

string itos(unsigned __int64 i, int radix)
{
    char buf[64];
    if (0 ==_ui64toa_s(i, buf, 64, radix))
    { 
        return buf;
    }
    return "";
}

//  0000000  000       0000000    0000000  000   000  
// 000       000      000   000  000       000   000  
// 0000000   000      000000000  0000000   000000000  
//      000  000      000   000       000  000   000  
// 0000000   0000000  000   000  0000000   000   000  

string slash(const string& path)
{
    return replace(path, "\\", "/");
}

string unslash(const string& path)
{
    return replace(path, "/", "\\");
}

string fileName(const string& path)
{
	static char name[_MAX_FNAME];
	_splitpath_s(path.c_str(), NULL, 0, NULL, 0, name, _MAX_FNAME, NULL, 0);
	return string(name);
}

string fileExt(const string& path)
{
	static char ext[_MAX_EXT];
	_splitpath_s(path.c_str(), NULL, 0, NULL, 0, NULL, 0, ext, _MAX_EXT);
	return string(ext);
}
