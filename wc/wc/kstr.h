#pragma once

#include <string.h>
#include <tchar.h>
#include <strsafe.h>
#include <iostream>
#include <sstream>
#include <fstream>
#include <algorithm>

using namespace std;

wstring s2w(const string& str);
string w2s(const wstring& wstr);
string lower(const string& in);

int cmp(const wstring& a, const wstring& b);
int cmp(const string&  a, const string& b);
int cmp(const wstring& a, const char*    b);
int cmp(const char*    a, const char*    b);

bool contains(const wstring& str, const wstring& sub);
bool contains(const string& str, const string& sub);

string replace(string const& original, string const& from, string const& to);

string slash(const string& path);
string unslash(const string& path);
string fileName(const string& path);
string fileExt(const string& path);
