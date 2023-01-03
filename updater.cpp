#include<stdio.h>
#include<windows.h>
#include <direct.h>

int main()
{
	Sleep(1000);
	remove("app.asar");
    rename("app.asar-new","app.asar");
    ShellExecute(0,"open", "..\\network_class.exe", 0, 0, 1);
	return 0;
}
