# GhostGraphs.com
Statistics for websites using Ghost, the best platform for blogging. Learn more at [Ghost.org](https://ghost.org).

## Development
The website uses Flask (a python framework) and is hosted on Heroku. The website looks for Public API access (deprecated), or for the meta tag added to the header. Then it requests API data about the posts, cleans the data, and feeds it into [Chart.js](https://www.chartjs.org/) HTML5 Canvas charts.

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