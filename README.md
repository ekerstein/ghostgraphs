# GhostGraphs.com
Statistics for websites using Ghost, the best platform for blogging. Learn more at [Ghost.org](https://ghost.org).

## Development
The website uses Flask (a python framework) and is hosted on Heroku.

## Setup
1. Install and setup virtual environment
```python
pip install virtualenv
virtualenv env
```
2. Activate environment (on Mac):
```python
source /path/to/env/bin/activate
```
2. Activate environment (on Windows):
```python
/path/to/env/bin/activate
```
3. Install python dependencies
```python
pip install -r requirements.txt
```
4. Start Flask local server
```python
python deploy.py
```
The server can be reached at http://localhost:5000 and updates automatically as long as `app.debug = True` in deploy.py.