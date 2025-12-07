from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from datetime import datetime, timedelta
import time
import threading
import warnings

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

cache = {}
cache_lock = threading.Lock()
CACHE_DURATION = 3600  # 1 hour cache duration

def get_cached_data(key):
    with cache_lock:
        if key in cache:
            data, timestamp = cache[key]
            if time.time() - timestamp < CACHE_DURATION:
                return data
            del cache[key]
    return None

def set_cached_data(key, data):
    with cache_lock:
        cache[key] = (data, time.time())

def create_pytrends():
    from pytrends.request import TrendReq
    from urllib3.util.retry import Retry
    Retry.DEFAULT_ALLOWED_METHODS = frozenset(['HEAD', 'GET', 'PUT', 'DELETE', 'OPTIONS', 'TRACE', 'POST'])
    
    try:
        return TrendReq(hl='en-US', tz=360)
    except Exception as e:
        print(f"TrendReq init error: {e}")
        return None

def fetch_interest_data(pytrends, keyword):
    df = pytrends.interest_over_time()
    
    if df is None or df.empty:
        return []
    
    df = df.reset_index()
    df['day'] = df['date'].dt.strftime('%a')
    
    daily_avg = df.groupby('day')[keyword].mean().reset_index()
    
    day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    today_idx = datetime.now().weekday()
    ordered_days = day_order[today_idx-6:] + day_order[:today_idx+1] if today_idx >= 6 else day_order[today_idx+1:] + day_order[:today_idx+1]
    ordered_days = ordered_days[-7:]
    
    interest_data = []
    for day in ordered_days:
        day_data = daily_avg[daily_avg['day'] == day]
        if not day_data.empty:
            value = int(day_data[keyword].values[0])
        else:
            value = 0
        interest_data.append({
            "date": day,
            "value": value
        })
    
    return interest_data

def fetch_related_queries(pytrends, keyword):
    related = pytrends.related_queries()
    
    queries = []
    if keyword in related and related[keyword] is not None:
        top_data = related[keyword].get('top')
        if top_data is not None and not top_data.empty:
            queries = top_data['query'].head(8).tolist()
    
    if not queries:
        queries = [f"{keyword} news", f"what is {keyword}", f"{keyword} 2025", f"best {keyword}"]
    
    return queries

def fetch_regions_data(pytrends, keyword):
    df = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True, inc_geo_code=False)
    
    if df is None or df.empty:
        return []
    
    df = df.reset_index()
    df = df.sort_values(by=keyword, ascending=False).head(10)
    
    region_data = []
    for idx in range(len(df)):
        row = df.iloc[idx]
        try:
            region_data.append({
                "region": str(row['geoName']),
                "value": int(row[keyword]) if pd.notna(row[keyword]) else 0
            })
        except:
            pass
    
    return region_data

@app.route('/api/trend', methods=['GET'])
def get_trend():
    """Consolidated endpoint that returns all trend data for a keyword"""
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify({"error": "Missing 'q' parameter"}), 400

    cache_key = f"trend_{keyword}"
    cached = get_cached_data(cache_key)
    if cached:
        cached['cached'] = True
        return jsonify(cached)

    try:
        pytrends = create_pytrends()
        if pytrends is None:
            raise Exception("Could not initialize PyTrends")
        
        pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')
        
        interest_data = fetch_interest_data(pytrends, keyword)
        related_queries = fetch_related_queries(pytrends, keyword)
        regions_data = fetch_regions_data(pytrends, keyword)
        
        result = {
            "keyword": keyword,
            "interest_over_time": interest_data,
            "related_queries": related_queries,
            "interest_by_region": regions_data,
            "error": None,
            "source": "live",
            "cached": False,
            "cache_duration": CACHE_DURATION
        }
        
        set_cached_data(cache_key, result)
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        print(f"PyTrends trend error for '{keyword}': {error_msg}")
        return jsonify({
            "keyword": keyword,
            "interest_over_time": [],
            "related_queries": [f"{keyword} news", f"what is {keyword}", f"{keyword} 2025", f"best {keyword}"],
            "interest_by_region": [],
            "error": error_msg,
            "source": "error",
            "cached": False
        }), 500

@app.route('/api/pytrends/interest', methods=['GET'])
def get_interest_over_time():
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify({"error": "Missing 'q' parameter"}), 400

    cache_key = f"interest_{keyword}"
    cached = get_cached_data(cache_key)
    if cached:
        return jsonify(cached)

    try:
        pytrends = create_pytrends()
        if pytrends is None:
            raise Exception("Could not initialize PyTrends")
            
        pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')
        
        interest_data = fetch_interest_data(pytrends, keyword)
        
        result = {
            "keyword": keyword,
            "interest_over_time": interest_data,
            "error": None,
            "source": "live" if interest_data else "empty"
        }
        
        set_cached_data(cache_key, result)
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        print(f"PyTrends interest_over_time error for '{keyword}': {error_msg}")
        return jsonify({
            "keyword": keyword,
            "interest_over_time": [],
            "error": error_msg,
            "source": "error"
        }), 200

@app.route('/api/pytrends/related', methods=['GET'])
def get_related_queries():
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify({"error": "Missing 'q' parameter"}), 400

    cache_key = f"related_{keyword}"
    cached = get_cached_data(cache_key)
    if cached:
        return jsonify(cached)

    try:
        pytrends = create_pytrends()
        if pytrends is None:
            raise Exception("Could not initialize PyTrends")
            
        pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')
        
        queries = fetch_related_queries(pytrends, keyword)
        
        result = {
            "keyword": keyword,
            "related_queries": queries,
            "error": None,
            "source": "live" if len(queries) > 4 else "fallback"
        }
        
        set_cached_data(cache_key, result)
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        print(f"PyTrends related_queries error for '{keyword}': {error_msg}")
        return jsonify({
            "keyword": keyword,
            "related_queries": [f"{keyword} news", f"what is {keyword}", f"{keyword} 2025", f"best {keyword}"],
            "error": error_msg,
            "source": "fallback"
        }), 200

@app.route('/api/pytrends/regions', methods=['GET'])
def get_interest_by_region():
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify({"error": "Missing 'q' parameter"}), 400

    cache_key = f"regions_{keyword}"
    cached = get_cached_data(cache_key)
    if cached:
        return jsonify(cached)

    try:
        pytrends = create_pytrends()
        if pytrends is None:
            raise Exception("Could not initialize PyTrends")
            
        pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')
        
        region_data = fetch_regions_data(pytrends, keyword)
        
        result = {
            "keyword": keyword,
            "interest_by_region": region_data,
            "error": None,
            "source": "live" if region_data else "empty"
        }
        
        set_cached_data(cache_key, result)
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        print(f"PyTrends interest_by_region error for '{keyword}': {error_msg}")
        return jsonify({
            "keyword": keyword,
            "interest_by_region": [],
            "error": error_msg,
            "source": "error"
        }), 200

@app.route('/api/pytrends/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "PyTrends API",
        "cache_size": len(cache),
        "cache_duration_seconds": CACHE_DURATION
    })

if __name__ == '__main__':
    print(f"Starting PyTrends Flask API on port 5001 (cache: {CACHE_DURATION}s)...")
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)
