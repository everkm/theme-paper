MYDIR := $(dir $(lastword $(MAKEFILE_LIST)))
# PYTHON ?= $(MYDIR).venv/bin/python
PYTHON ?= python3


paper-latest:
	$(PYTHON) $(MYDIR)set_latest_release.py --repo everkm/theme-paper \
		--website https://paper.theme.everkm.com/ \
		--changelog-en $(MYDIR)../en/CHANGELOG.md \
		--changelog-zh $(MYDIR)../zh/CHANGELOG.md
