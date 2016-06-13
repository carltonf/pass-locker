# TODO create a script that automatically fill in real password
all: pass-locker

runbin: pass-locker
	@./pass-locker

runjs:
	@node ./main.js

pass-locker: main.js
	@echo "* Enclose: build x64 executables"
	@enclose --x64 $^ -o $@
