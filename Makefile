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

prebuild: aw-webui/dist node_modules aw-app/icons/icon.png install-watchers modules

precommit: format check

format:
	cd aw-app && cargo fmt

check:
	cd aw-app && cargo check && cargo clippy

package:
ifeq ($(OS),Linux)
	rm -rf target/package/aw-app
	mkdir -p target/package/aw-app
	cp aw-app/target/release/bundle/deb/*.deb target/package/aw-app/aw-app$(ARCH).deb
	cp aw-app/target/release/bundle/rpm/*.rpm target/package/aw-app/aw-app$(ARCH).rpm
	cp aw-app/target/release/bundle/appimage/*.AppImage target/package/aw-app/aw-app$(ARCH).AppImage

	mkdir -p dist/aw-app
	rm -rf dist/aw-app/*
	cp target/package/aw-app/* dist/aw-app/
else
	rm -rf target/package
	mkdir -p target/package
	cp aw-app/target/release/aw-app target/package/aw-app

	mkdir -p dist
	find dist/ -maxdepth 1 -type f -delete 2>/dev/null || true
	cp target/package/* dist/
endif

node_modules: package-lock.json
	npm ci

# Watcher
venv:
	python3 -m venv venv
	./venv/bin/pip install --upgrade pip

venv/.afk-installed: venv
	cd aw-watcher-afk && ../venv/bin/pip install .
	touch venv/.afk-installed

venv/.window-installed: venv aw-watcher-window/aw_watcher_window/aw-watcher-window-macos
	cd aw-watcher-window && ../venv/bin/pip install .
	cp aw-watcher-window/aw_watcher_window/aw-watcher-window-macos venv/lib/python3.*/site-packages/aw_watcher_window/ 2>/dev/null || true
	touch venv/.window-installed

aw-watcher-window/aw_watcher_window/aw-watcher-window-macos: aw-watcher-window/aw_watcher_window/macos.swift
ifeq ($(OS),Darwin)
	swiftc aw-watcher-window/aw_watcher_window/macos.swift -o aw-watcher-window/aw_watcher_window/aw-watcher-window-macos
else
	@echo "Skipping Swift build (not on macOS)"
	@touch aw-watcher-window/aw_watcher_window/aw-watcher-window-macos
endif

install-watcher-afk: venv/.afk-installed

install-watcher-window: venv/.window-installed

install-watchers: install-watcher-afk install-watcher-window

run-watcher-afk: venv/.afk-installed
	./venv/bin/aw-watcher-afk

run-watcher-window: venv/.window-installed
	./venv/bin/aw-watcher-window

# aw-sync (Rust binary)
aw-server-rust/target/release/aw-sync:
	cd aw-server-rust/aw-sync && cargo build --release

install-sync: aw-server-rust/target/release/aw-sync
	@echo "aw-sync built successfully"

run-sync: aw-server-rust/target/release/aw-sync
	./aw-server-rust/target/release/aw-sync daemon

# Create modules directory with symlinks for app discovery
modules: venv/.afk-installed venv/.window-installed
	mkdir -p modules
	ln -sf ../venv/bin/aw-watcher-afk modules/aw-watcher-afk
	ln -sf ../venv/bin/aw-watcher-window modules/aw-watcher-window

clean-watchers:
	rm -rf venv modules
	rm -f aw-watcher-window/aw_watcher_window/aw-watcher-window-macos
	cd aw-server-rust && cargo clean
