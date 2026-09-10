from pathlib import Path
import shutil

db_path = Path("price_monitor.db")

if db_path.exists():
    try:
        db_path.unlink()
        print("✓ База данных удалена")
    except PermissionError:
        print("✗ Ошибка: база заблокирована. Остановите сервер (Ctrl+C) и запустите снова.")
else:
    print("✓ База данных не найдена (уже чистая)")

print("\nТеперь запустите сервер: python app/main.py")
