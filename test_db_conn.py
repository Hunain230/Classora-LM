import os
import sys

import psycopg2


def main() -> int:
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            sslmode=os.getenv("DB_SSLMODE", "require"),
        )
        conn.close()
        print("PostgreSQL connection successful")
        return 0
    except Exception as exc:
        print(f"PostgreSQL connection failed: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
