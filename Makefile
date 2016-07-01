# TODO create a script that automatically fill in real password
all: pass-locker

runbin: pass-locker
	@./pass-locker

runjs:
	@node ./main.js

SRCS := antiSpoof.js \
	config-manager.js \
	main.js \
	PASS.js \
	simpleJSONCryptor.js
ENTRY := main.js

pass-locker: ${SRCS}
	@echo "* Enclose: build x64 executables"
	@enclose -x ${ENTRY} -o $@
