# TODO create a script that automatically fill in real password
all: pass-locker

runbin: pass-locker
	@./pass-locker

runjs:
	@node ./main.js

# NOTE: for now a copy of main.js should be placed in build directory with password
# It gets removed immediately
pass-locker: build/main.js
	@echo "* Enclose: build x64 executables"
	@enclose -a x64 $^ -o $@
	@rm -rfv $^
