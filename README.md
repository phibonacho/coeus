# COEUS
A simple vulnerability scanner wannabe written in node.js

## Setup and use
### Building Coeus 1.0.1
To build Coeus you simply need to clone this repository and launch
```shell
  yarn compile
```
Then you can launch Coeus using
```shell
  ./dist/coeus.js <command> <host> [port] [options]
```

### Coeus unique and unforgettable command: fast-scan
Fast-scan is not really that fast, mainly because it is written in javascript (ba-dum-tss).

However, it supports 3 different attack configuration:
  - 1 attack by full options
  - 2 attack by quick configuration
  - 3 attack by file configuration

Were all these necessary? Absolutely not. But I love to suffer, so here we go!

#### Attack by full options
Attack by full option is the most tiring of all, here and example
```shell
  ./dist/coeus.js http://this.is.a.host.trust.me 80 \
  --paths 'first/path','second/path',...
  --methods GET,POST,PUT
  --attack-payloads 'param=value&para2=value..','param=valuex,...'
  --check <a regular expression that you can also avoid to set, future!>
```
of course you can also use short version
```shell
  ./dist/coeus.js http://this.is.a.host.trust.me 80 \
  -p 'first/path','second/path',...
  -m GET,POST,PUT
  -a 'param=value&para2=value..','param=valuex,...'
  -c '.*'
```

Coeus will launch a scan combining methods, paths and payload list.

#### Attack by quick configuration
When I noticed full option would take me a lot of time to launch, I wondered why I couldn't use a more terse syntax: (and not because it was suggested in the assignment)
```shell
  ./dist/coeus.js http://this.is.a.host.trust.me 80 --quick-configuration [method:]<paths>:<payloads>[:check]
```
Of course methods, paths and payloads are comma separated lists. Quick config has also a shorthand:
```shell
  ./dist/coeus.js http://this.is.a.host.trust.me 80 -q GET,POST,PUT:path1,path2,path...,param1=val1...:[\w\/]+
```

#### Attack by file configuration
Once developed quick configuration feature I though WHAT IF YOU COULD PROVIDE TONS OF QUICK CONFIGURATIONS?
```shell
  ./dist/coeus.js http://this.is.a.host.trust.me 80 --load-configuration attacks.txt
```
The laziest command of all has a shorthand too:
```shell
  ./dist/coeus.js http://this.is.a.host.trust.me 80 -l attacks.txt
```
But as Coeus is pretty touchy, I provided a more polite longhand:
```shell
  ./dist/coeus.js http://this.is.a.host.trust.me 80 --could-you-please-load-this-file-thanks attacks.txt
```
It works for real, try it! Configuration file must respect quick configuration syntax and provide one configuration per line.

### NOTES
Coeus 1.0.1 was tested only for GET method attacks, I don't guarantee anything for POST, PUT, HEAD and DELETE. Try them at your own risk!
