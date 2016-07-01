SRCS := $(wildcard src/*.js)
ENTRY := src/main.js

all: pass-locker

runbin: pass-locker
	@./pass-locker

runjs:
	@node ${ENTRY}

pass-locker: ${SRCS}
	@echo "* Enclose: build x64 executables"
	@enclose -x ${ENTRY} -o $@
