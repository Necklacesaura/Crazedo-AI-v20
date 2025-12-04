from flask import Flask, jsonify, request
from flask_cors import CORS
from pytrends.request import TrendReq
import pandas as pd
from datetime import datetime, timedelta
import time
import threading

app = Flask(__name__)
CORS(app)

cache = {}
cache_lock = threading.Lock()
CACHE_DURATION = 300

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
        pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25), retries=2, backoff_factor=0.5)
        pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')
        
        df = pytrends.interest_over_time()
        
        if df.empty:
            result = {
                "keyword": keyword,
                "interest_over_time": [],
                "error": None
            }
        else:
            df = df.reset_index()
            interest_data = []
            for _, row in df.iterrows():
                date_str = row['date'].strftime('%a')
                value = int(row[keyword]) if pd.notna(row[keyword]) else 0
                interest_data.append({
                    "date": date_str,
                    "value": value
                })
            
            result = {
                "keyword": keyword,
                "interest_over_time": interest_data,
                "error": None
            }
        
        set_cached_data(cache_key, result)
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        print(f"PyTrends interest_over_time error for '{keyword}': {error_msg}")
        return jsonify({
            "keyword": keyword,
            "interest_over_time": [],
            "error": error_msg
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
        pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25), retries=2, backoff_factor=0.5)
        pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')
        
        related = pytrends.related_queries()
        
        queries = []
        if keyword in related and related[keyword]['top'] is not None:
            top_df = related[keyword]['top']
            queries = top_df['query'].head(8).tolist()
        
        if not queries:
            queries = [f"{keyword} news", f"what is {keyword}", f"{keyword} 2025", f"best {keyword}"]
        
        result = {
            "keyword": keyword,
            "related_queries": queries,
            "error": None
        }
        
        set_cached_data(cache_key, result)
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        print(f"PyTrends related_queries error for '{keyword}': {error_msg}")
        return jsonify({
            "keyword": keyword,
            "related_queries": [f"{keyword} news", f"what is {keyword}", f"{keyword} 2025", f"best {keyword}"],
            "error": error_msg
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
        pytrends = TrendReq(hl='en-US', tz=360, timeout=(10, 25), retries=2, backoff_factor=0.5)
        pytrends.build_payload([keyword], cat=0, timeframe='now 7-d', geo='', gprop='')
        
        df = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True, inc_geo_code=False)
        
        if df.empty:
            result = {
                "keyword": keyword,
                "interest_by_region": [],
                "error": None
            }
        else:
            df = df.reset_index()
            df = df.sort_values(by=keyword, ascending=False).head(10)
            
            region_data = []
            for _, row in df.iterrows():
                region_data.append({
                    "region": row['geoName'],
                    "value": int(row[keyword]) if pd.notna(row[keyword]) else 0
                })
            
            result = {
                "keyword": keyword,
                "interest_by_region": region_data,
                "error": None
            }
        
        set_cached_data(cache_key, result)
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        print(f"PyTrends interest_by_region error for '{keyword}': {error_msg}")
        return jsonify({
            "keyword": keyword,
            "interest_by_region": [],
            "error": error_msg
        }), 200

@app.route('/api/pytrends/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "PyTrends API",
        "cache_size": len(cache)
    })

if __name__ == '__main__':
    print("Starting PyTrends Flask API on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=False)
