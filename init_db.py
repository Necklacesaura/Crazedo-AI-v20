#!/usr/bin/env python3
import sqlite3
import os

DB_NAME = "crazedo_ai_db.sqlite"

def init_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trending_searches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword TEXT NOT NULL,
            trend_label TEXT,
            search_volume INTEGER,
            date TEXT,
            ai_summary TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_saved_trends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            keyword TEXT NOT NULL,
            trend_label TEXT,
            search_volume INTEGER,
            date TEXT,
            ai_summary TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    
    print("Database initialized ✅")

if __name__ == "__main__":
    init_database()
