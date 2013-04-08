#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>
#include <stdio.h>
int
main (int argc, char *argv[])
{
   setuid (0);
   char String[255];
   sprintf(String, "/bin/sh ./service.sh %s %s", argv[1], argv[2]);
   system(String);
   return 0;
}
