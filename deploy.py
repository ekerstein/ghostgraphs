#################################################################
# IMPORT PACKAGES

from flask import Flask # main app
from flask import render_template # route to a template
from flask import url_for # finding urls for files/pages
from flask import abort # abort to an error page
#
import requests # for getting URL
import json # for parsing json

#################################################################
# INITIALIZE

app = Flask(__name__)
app.debug = True

#################################################################
# URL ROUTES

# landing
@app.route('/')
def landing():
    return render_template('landing.html')

# sitemap
@app.route('/sitemap.xml')
def sitemap():
    return app.send_static_file('misc/sitemap.xml')

# robots
@app.route('/robots.txt')
def robots():
    return app.send_static_file('misc/robots.txt')

# Error - 404
@app.errorhandler(404)
def page_not_found_error(e):
    alert = 'Error 404 - Page not found. If you see this, please contact twitter.com/ghost_graphs'
    return render_template('landing.html', alert=alert), 404

# Error - 500
@app.errorhandler(500)
def internal_server_error(e):
    alert = 'Error 500 - Internal server error. If you see this, please contact twitter.com/ghost_graphs'
    return render_template('landing.html', alert=alert), 500

# Charts & Dashboards
@app.route("/<path:website>")
def result(website):

    try:
        # Fix URL
        # add http
        # remove trailing slash
        website_url = website
        if not website_url.startswith('http://') and not website_url.startswith('https://'):
            website_url = "http://" + website_url
        if website_url.endswith('/'):
            website_url = website_url[:-1]

        # Get source if valid website
        try:
            # Fake user agent headers
            headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'}
            # Request #1 - website
            website_source = requests.get(website_url, headers=headers)
            # Get source if 200
            if website_source.status_code == 200:
                website_source = website_source.text
            else:
                alert = 'Website not found. Are you sure you typed it in correctly?'
                raise
        except:
            alert = 'Website not found. Are you sure you typed it in correctly?'
            raise

        # Try to find API keys
        content_api_begin = website_source.find('name="ghostgraphs"')
        client_secret_begin = website_source.find('clientSecret:') 
        
        # 1) Content API
        if content_api_begin != -1:
            content_api_begin = website_source.find('content', content_api_begin)
            content_api_end = website_source.find('/>', content_api_begin)
            # Get key
            content_api_key = website_source[content_api_begin + 9:content_api_end - 2]
            # Set variables
            api_type = "content"
            api_url = 'ghost/api/v2/content'
            api_key = '?key={}'.format(content_api_key)
        # 2) Public API
        elif client_secret_begin != -1:
            client_secret_end = website_source.find('});', client_secret_begin)
            # Get secret
            client_secret = website_source[client_secret_begin + 15:client_secret_end - 2]
            # Set variables
            api_type = "public"
            client_id = 'ghost-frontend' 
            api_url = 'ghost/api/v0.1'
            api_key = '?client_id={}&client_secret={}'.format(client_id, client_secret)
        
        # Exit with error
        else:
            alert = 'Website detected, but no API found. See the instructions section below.'
            raise

        # API requests
        api_limit = 'all'
        api_include = 'authors,tags'
        api_fields = 'title,created_at,updated_at,published_at,plaintext'
        api_posts = "{}/{}/{}/{}&limit={}&include={}&fields={}&formats=plaintext".format(website_url, api_url, 'posts', api_key, api_limit, api_include, api_fields)

        # Attempt to get API data
        try:
            # Request #2 - API
            api_posts = requests.get(api_posts, headers=headers)
            # Get source and convert to json
            if api_posts.status_code == 200:
                api_posts = json.loads(api_posts.text)
            else:
                alert = 'Ghost website detected, but API data was not accessible. See the instructions section below.'
                raise
        except:
            alert = 'Ghost website detected, but API data was not accessible. See the instructions section below.'
            raise

        # Create data
        data = []
        try:
            for d in api_posts['posts']:
                data.append({
                    # TITLE
                    # remove quotation marks that break json
                    # Remove newlines
                    'title': d['title'].replace('"',"'").replace('\n','').strip(), 
                    'created': d['created_at'],
                    'published': d['published_at'],
                    'updated': d['updated_at'],
                    'words': len(d['plaintext'].split()),
                    'authors': [e['name'] for e in d['authors']] if 'authors' in d else [],
                    'tags': [e['name'] for e in d['tags']] if 'tags' in d else []
                })
        except:
            alert = 'Older version of Ghost website detected. Please upgrade and try again.'
            raise

        # Check for new or old API (no authors)
        if data[0]['authors'] == []:
            api_type = "old"
        
        # Output in JSON format
        data = json.dumps(data)

        return render_template('result.html', api_type=api_type, input_value=website, website_url=website_url, api_data=data)

    # If exception raised
    except:
        try:
            # 404 to landing page with alert
            return render_template('landing.html', alert=alert, input_value=website), 404
        except:
            # If exception not captured, abort to 500
            abort(500)

#################################################################
# RUN FLASK

if __name__ == "__main__":
    app.run()