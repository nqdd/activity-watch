ifeq ($(shell uname -m), arm64)
	ARCH := _arm64
else
	ARCH :=
endif
OS := $(shell uname -s)

build: prebuild
	npm run tauri build

dev: prebuild
	npm run tauri dev

%/.git:
	git submodule update --init --recursive

aw-app/icons/icon.png: aw-webui/.git
	mkdir -p aw-app/icons
	npm run tauri icon "./aw-webui/media/logo/logo.png"

aw-webui/dist: aw-webui/.git
	cd aw-webui && make build

prebuild: aw-webui/dist node_modules aw-app/icons/icon.png

precommit: format check

format:
	cd aw-app && cargo fmt

check:
	cd aw-app && cargo check && cargo clippy

package:
ifeq ($(OS),Linux)
	rm -rf target/package/aw-tauri
	mkdir -p target/package/aw-tauri
	cp aw-app/target/release/bundle/deb/*.deb target/package/aw-tauri/aw-tauri$(ARCH).deb
	cp aw-app/target/release/bundle/rpm/*.rpm target/package/aw-tauri/aw-tauri$(ARCH).rpm
	cp aw-app/target/release/bundle/appimage/*.AppImage target/package/aw-tauri/aw-tauri$(ARCH).AppImage

	mkdir -p dist/aw-tauri
	rm -rf dist/aw-tauri/*
	cp target/package/aw-tauri/* dist/aw-tauri/
else
	rm -rf target/package
	mkdir -p target/package
	cp aw-app/target/release/aw-tauri target/package/aw-tauri

	mkdir -p dist
	find dist/ -maxdepth 1 -type f -delete 2>/dev/null || true
	cp target/package/* dist/
endif

node_modules: package-lock.json
	npm ci
