artifact_name       := limited-partnerships-web
version             := "unversioned"

.PHONY: all
all: build

.PHONY: clean
clean:
	rm -f ./$(artifact_name)-*.zip
	rm -rf ./build-*
	rm -rf ./dist
	rm -f ./build.log

.PHONY: build
build:
	npm ci
	npm run build

# Note: The following target and others lower down are commented out for now. They will need
#       to be uncommented (probably quite soon) when the other build tasks are implemented 

.PHONY: lint
lint:
	npm run lint

.PHONY: sonar
sonar:
# sonar: test-unit
	npm run sonarqube

# .PHONY: test-unit
# test-unit: clean
# 	npm run coverage

# .PHONY: test
# test: test-unit

.PHONY: package
package: build
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	cp -r ./dist/* $(tmpdir)
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cd $(tmpdir) && npm ci --omit=dev --ignore-scripts
	rm $(tmpdir)/package.json $(tmpdir)/package-lock.json
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)

# .PHONY: dist
# dist: lint test-unit clean package

