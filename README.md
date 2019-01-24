# GhostGraphs.com
Statistics for websites using Ghost, the best platform for blogging. Learn more at [Ghost.org](https://ghost.org).

## Development
The website uses Flask (a python framework) on Heroku.

## Setup
1. Install and setup virtual environment
```python
pip install virtualenv
virtualenv env
```
2. Activate environment
On Mac:
```python
source /path/to/env/bin/activate
```
On Windows:
```python
\path\to\env\bin\activate
```
3. Install python dependencies
```python
pip install -r requirements.txt
```
4. Start Flask local server
```python
python deploy.py
```
The server can be reached at http://localhost:5000