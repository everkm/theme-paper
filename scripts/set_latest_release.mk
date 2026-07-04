MYDIR := $(dir $(lastword $(MAKEFILE_LIST)))
# PYTHON ?= $(MYDIR).venv/bin/python
PYTHON ?= python3


paper-latest:
	$(PYTHON) $(MYDIR)set_latest_release.py --repo everkm/theme-paper --changelog $(MYDIR)../zh/CHANGELOG.md
