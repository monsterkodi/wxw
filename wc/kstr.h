#pragma once

#include <string.h>
#include <tchar.h>
#include <strsafe.h>
#include <vector>
#include <iostream>
#include <sstream>
#include <fstream>
#include <algorithm>

using namespace std;

string  w2s (const wstring& wstr);
wstring s2w (const  string& str);
string lower(const  string& in);

int cmp(const wstring& a, const wstring& b);
int cmp(const  string& a, const  string& b);
int cmp(const wstring& a, const char*    b);
int cmp(const char*    a, const char*    b);

bool contains(const wstring& str, const wstring& sub);
bool contains(const  string& str, const  string& sub);

string itos(unsigned __int64 i, int radix=10);
string replace(const string& original, const string& from, const string& to);

string lpad     (const string& str, int count, char ch=' ');
string pad      (const string& str, int count, char ch=' ');
string slash    (const string& path);
string unslash  (const string& path);
string fileName (const string& path);
string fileExt  (const string& path);
