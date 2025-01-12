import os
from dotenv import load_dotenv
import snowflake.connector

load_dotenv()

# Snowflake connection parameters
SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_PASSWORD = os.getenv("SNOWFLAKE_PASSWORD")
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_DATABASE = os.getenv("SNOWFLAKE_DATABASE")
SNOWFLAKE_SCHEMA = os.getenv("SNOWFLAKE_SCHEMA")
SNOWFLAKE_WAREHOUSE = os.getenv("SNOWFLAKE_WAREHOUSE")

def init_database():
    """Initialize the Snowflake database with required tables"""
    try:
        # Create direct connection to Snowflake
        conn = snowflake.connector.connect(
            user=SNOWFLAKE_USER,
            password=SNOWFLAKE_PASSWORD,
            account=SNOWFLAKE_ACCOUNT,
            database=SNOWFLAKE_DATABASE,
            schema=SNOWFLAKE_SCHEMA,
            warehouse=SNOWFLAKE_WAREHOUSE
        )
        
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INT IDENTITY(1,1) PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
        )
        """)
        
        # Create journal_entries table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS journal_entries (
            entry_id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            date TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            mood VARCHAR(10),
            prompt VARCHAR(255),
            entry TEXT,
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
        """)
        
        # Create mood_ratings table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS mood_ratings (
            rating_id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            date TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            mood VARCHAR(10),
            created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
        """)
        
        conn.commit()
        print("Successfully created tables in Snowflake!")
        
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    init_database()
