import asyncio
import hashlib
import json
import random
import re
import secrets
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Generator
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import httpx
from bs4 import BeautifulSoup
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import (
    Boolean, DateTime, Float, ForeignKey, String,
    create_engine, func, inspect, select, text,
)
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, Session,
    mapped_column, relationship, sessionmaker,
)

from workers.scheduler import start as start_scheduler, stop as stop_scheduler

BASE      = Path(__file__).resolve().parent
DB_PATH   = ROOT / "price_monitor.db"
engine    = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False)



class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id:         Mapped[int]      = mapped_column(primary_key=True)
    name:       Mapped[str]      = mapped_column(String(120))
    email:      Mapped[str]      = mapped_column(String(180), unique=True, index=True)
    password:   Mapped[str]      = mapped_column(String(128))
    avatar:     Mapped[str]      = mapped_column(String(500), default="")
    region:     Mapped[str]      = mapped_column(String(32),  default="ua")
    language:   Mapped[str]      = mapped_column(String(8),   default="ru")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Product(Base):
    __tablename__ = "products"
    id:         Mapped[int]      = mapped_column(primary_key=True)
    name:       Mapped[str]      = mapped_column(String(180), index=True)
    category:   Mapped[str]      = mapped_column(String(80),  default="Інше")
    image:      Mapped[str]      = mapped_column(String(500), default="")
    region:     Mapped[str]      = mapped_column(String(32),  default="ua")
    source_url: Mapped[str]      = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    prices: Mapped[list["Price"]] = relationship(cascade="all, delete-orphan", back_populates="product")


class Price(Base):
    __tablename__ = "prices"
    id:         Mapped[int]      = mapped_column(primary_key=True)
    product_id: Mapped[int]      = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    store:      Mapped[str]      = mapped_column(String(80))
    value:      Mapped[float]    = mapped_column(Float)
    url:        Mapped[str]      = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    product: Mapped[Product]     = relationship(back_populates="prices")


class PriceLog(Base):
    __tablename__ = "price_logs"
    id:           Mapped[int]      = mapped_column(primary_key=True)
    product_id:   Mapped[int]      = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    product_name: Mapped[str]      = mapped_column(String(180), default="")
    store:        Mapped[str]      = mapped_column(String(80))
    old_value:    Mapped[float]    = mapped_column(Float, default=0)
    new_value:    Mapped[float]    = mapped_column(Float)
    delta:        Mapped[float]    = mapped_column(Float, default=0)
    delta_pct:    Mapped[float]    = mapped_column(Float, default=0)
    source:       Mapped[str]      = mapped_column(String(40), default="scheduler")
    created_at:   Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Alert(Base):
    __tablename__ = "alerts"
    id:           Mapped[int]            = mapped_column(primary_key=True)
    user_id:      Mapped[int]            = mapped_column(ForeignKey("users.id",    ondelete="CASCADE"))
    product_id:   Mapped[int]            = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    target:       Mapped[float]          = mapped_column(Float)
    email:        Mapped[str]            = mapped_column(String(180))
    active:       Mapped[bool]           = mapped_column(Boolean, default=True)
    triggered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at:   Mapped[datetime]       = mapped_column(DateTime, default=datetime.utcnow)


class Favorite(Base):
    __tablename__ = "favorites"
    id:         Mapped[int] = mapped_column(primary_key=True)
    user_id:    Mapped[int] = mapped_column(ForeignKey("users.id",    ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))


class Token(Base):
    __tablename__ = "tokens"
    value:      Mapped[str]      = mapped_column(String(128), primary_key=True)
    user_id:    Mapped[int]      = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    expires_at: Mapped[datetime] = mapped_column(DateTime)



class RegisterIn(BaseModel):
    name:     str = Field(min_length=2, max_length=120)
    email:    str = Field(min_length=5, max_length=180)
    password: str = Field(min_length=6, max_length=72)
    region:   str = "ua"
    language: str = "ru"
    avatar:   str = ""


class LoginIn(BaseModel):
    email:    str
    password: str


class ProfileUpdateIn(BaseModel):
    name:     str | None = Field(default=None, min_length=2, max_length=120)
    avatar:   str | None = None
    region:   str | None = None
    language: str | None = None


class PriceIn(BaseModel):
    store: str   = Field(min_length=1, max_length=80)
    value: float = Field(gt=0)
    url:   str   = ""


class ProductIn(BaseModel):
    name:       str          = Field(min_length=2, max_length=180)
    category:   str          = "Інше"
    image:      str          = ""
    region:     str          = "ua"
    source_url: str          = ""
    prices:     list[PriceIn] = []


class AlertIn(BaseModel):
    product_id: int
    target:     float = Field(gt=0)


class PriceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:         int
    store:      str
    value:      float
    url:        str
    created_at: datetime


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:         int
    name:       str
    category:   str
    image:      str
    region:     str
    source_url: str
    current:    float
    minimum:    float
    average:    float
    maximum:    float
    change:     float
    score:      int
    favorite:   bool       = False
    prices:     list[PriceOut]
    sparkline:  list[float] = []


class HistoryPoint(BaseModel):
    date:  str
    value: float
    store: str


class PriceLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:           int
    product_id:   int
    product_name: str
    store:        str
    old_value:    float
    new_value:    float
    delta:        float
    delta_pct:    float
    source:       str
    created_at:   datetime



Base.metadata.create_all(engine)


def migrate_schema() -> None:
    with engine.connect() as conn:
        product_cols = {r["name"] for r in inspect(engine).get_columns("products")}
        alert_cols   = {r["name"] for r in inspect(engine).get_columns("alerts")}
        user_cols    = {r["name"] for r in inspect(engine).get_columns("users")}

        migrations = []
        if "category"   not in product_cols: migrations.append("ALTER TABLE products ADD COLUMN category VARCHAR(80) DEFAULT 'Інше'")
        if "image"      not in product_cols: migrations.append("ALTER TABLE products ADD COLUMN image VARCHAR(500) DEFAULT ''")
        if "region"     not in product_cols: migrations.append("ALTER TABLE products ADD COLUMN region VARCHAR(32) DEFAULT 'ua'")
        if "source_url" not in product_cols: migrations.append("ALTER TABLE products ADD COLUMN source_url VARCHAR(500) DEFAULT ''")
        if "avatar"     not in user_cols:    migrations.append("ALTER TABLE users ADD COLUMN avatar VARCHAR(500) DEFAULT ''")
        if "region"     not in user_cols:    migrations.append("ALTER TABLE users ADD COLUMN region VARCHAR(32) DEFAULT 'ua'")
        if "language"   not in user_cols:    migrations.append("ALTER TABLE users ADD COLUMN language VARCHAR(8) DEFAULT 'ru'")
        if "user_id"    not in alert_cols:   migrations.append("ALTER TABLE alerts ADD COLUMN user_id INTEGER")
        if "active"     not in alert_cols:   migrations.append("ALTER TABLE alerts ADD COLUMN active BOOLEAN DEFAULT 1")
        if "triggered_at" not in alert_cols: migrations.append("ALTER TABLE alerts ADD COLUMN triggered_at DATETIME")

        for sql in migrations:
            conn.execute(text(sql))
        conn.commit()


migrate_schema()

STORE_SELECTORS = {
    "rozetka.com.ua": {
        "price": ["[class*='product-price']", ".product-prices__big", "[data-testid='price']"],
        "name":  ["h1[class*='product']", "h1.product__title", "[data-testid='product-title']"],
    },
    "comfy.ua": {
        "price": ["[class*='price']", ".price__main-price", "[data-testid='product-price']"],
        "name":  ["h1", "h1.product-title", "[itemprop='name']"],
    },
    "citrus.ua": {
        "price": ["[class*='price']", ".product-price__current", ".price-now"],
        "name":  ["h1", "h1.product-name"],
    },
    "epicentrk.ua": {
        "price": ["[class*='price']", ".product__price", "[data-price]"],
        "name":  ["h1", ".product__title", "[itemprop='name']"],
    },
    "allo.ua": {
        "price": [".v-pb__price", "[class*='price-cost']", ".sum", "[data-price]", "[class*='price']"],
        "name":  ["h1[itemprop='name']", "h1", ".product-view__heading"],
    },
    "dns-shop.ru": {
        "price": ["[class*='price']", ".product-buy__price", "[data-price]"],
        "name":  ["h1", "[itemprop='name']"],
    },
    "mvideo.ru": {
        "price": ["[class*='price']", ".price__main-value", "[data-price]"],
        "name":  ["h1", ".title", "[itemprop='name']"],
    },
    "eldorado.ru": {
        "price": ["[class*='price']", "[data-dy='price']", ".price"],
        "name":  ["h1", "[itemprop='name']"],
    },
    "citilink.ru": {
        "price": ["[class*='price']", ".e-price", "[data-price]"],
        "name":  ["h1", "[itemprop='name']"],
    },
    "ozon.ru": {
        "price": ["[class*='price']", "[data-widget='webPrice']", "span[class*='Price']"],
        "name":  ["h1", "[data-widget='webProductHeading']"],
    },
    "wildberries.ru": {
        "price": ["[class*='price']", ".price-block__final-price", "[data-link='text{:productCard^goodCard^price}']"],
        "name":  ["h1", "[data-link='text{:productCard^goodCard^header}']"],
    },
}

GENERIC_PRICE_SELS = [
    "[itemprop='price']",
    ".price",
    "[class*='price']",
    "[data-price]",
]

GENERIC_NAME_SELS = [
    "h1",
    "[itemprop='name']",
    ".product-title",
    ".product-name",
]

STORE_MAP = {
    "rozetka.com.ua": "Rozetka",
    "comfy.ua": "Comfy",
    "citrus.ua": "Citrus",
    "epicentrk.ua": "Epicentr",
    "allo.ua": "Allo",
    "dns-shop.ru": "DNS",
    "mvideo.ru": "M.Video",
    "eldorado.ru": "Eldorado",
    "citilink.ru": "Citilink",
    "ozon.ru": "Ozon",
    "wildberries.ru": "Wildberries",
}

def password_hash(v: str) -> str:
    return hashlib.sha256(v.encode()).hexdigest()

def latest_prices(product: Product) -> dict[str, Price]:
    latest = {}
    for p in sorted(product.prices, key=lambda x: x.created_at):
        latest[p.store] = p
    return latest

def current_price(product: Product) -> float | None:
    lp = latest_prices(product)
    if not lp:
        return None
    prices = [p.value for p in lp.values()]
    return min(prices) if prices else None

def write_price_log(session: Session, product: Product, store: str,
                    old_val: float, new_val: float, source: str) -> None:
    if abs(new_val - old_val) < 0.01:
        return
    delta = new_val - old_val
    delta_pct = round((delta / old_val) * 100, 2) if old_val else 0
    session.add(PriceLog(
        product_id=product.id,
        product_name=product.name,
        store=store,
        old_value=old_val,
        new_value=new_val,
        delta=delta,
        delta_pct=delta_pct,
        source=source,
    ))

def evaluate_alerts(session: Session, product: Product) -> None:
    lp = latest_prices(product)
    if not lp:
        return
    current = min(p.value for p in lp.values())
    alerts = session.scalars(
        select(Alert).where(Alert.product_id == product.id, Alert.active == True)
    ).all()
    for alert in alerts:
        if current <= alert.target:
            alert.active = False
            alert.triggered_at = datetime.utcnow()

def product_view(p: Product, session: Session, user_id: int | None) -> dict:
    lp = latest_prices(p)
    values = [price.value for price in lp.values()] if lp else []
    current = min(values, default=0)
    avg_val = round(sum(values) / len(values), 2) if values else 0
    all_vals = [price.value for price in p.prices]
    minimum = min(all_vals, default=0)
    maximum = max(all_vals, default=0)
    
    previous = current
    if len(p.prices) > len(lp):
        prev_set = sorted(p.prices, key=lambda x: x.created_at)[:-len(lp)] if lp else p.prices
        if prev_set:
            prev_lp = {}
            for price in prev_set:
                prev_lp[price.store] = price
            prev_vals = [price.value for price in prev_lp.values()]
            if prev_vals:
                previous = min(prev_vals)
    
    change = round((current - previous) / previous * 100, 1) if previous else 0
    spread = maximum - minimum
    score = round(100 - (current - minimum) / spread * 100) if spread else 100
    score = max(0, min(100, score))
    
    sparkline = []
    if p.prices:
        history = sorted(p.prices, key=lambda x: x.created_at)
        if len(history) > 14:
            step = len(history) / 14
            for i in range(14):
                idx = int(i * step)
                window = history[idx:int((i + 1) * step)]
                if window:
                    sparkline.append(min(pr.value for pr in window))
        else:
            sparkline = [pr.value for pr in history]
    
    favorite = False
    if user_id:
        favorite = session.scalar(
            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.product_id == p.id
            )
        ) is not None
    
    return {
        "id": p.id,
        "name": p.name,
        "category": p.category,
        "image": p.image,
        "region": p.region,
        "source_url": p.source_url,
        "current": current,
        "minimum": minimum,
        "average": avg_val,
        "maximum": maximum,
        "change": change,
        "score": score,
        "favorite": favorite,
        "prices": [{"id": price.id, "store": price.store, "value": price.value,
                    "url": price.url, "created_at": price.created_at}
                   for price in lp.values()],
        "sparkline": sparkline,
    }

async def parse_price_from_url(url: str) -> dict:
    domain = urlparse(url).netloc.lstrip("www.")
    
    if "rozetka.com.ua" in domain:
        product_id_match = re.search(r'/p(\d+)/', url)
        if product_id_match:
            product_id = product_id_match.group(1)
            
            api_endpoints = [
                f'https://common-api.rozetka.com.ua/v2/goods/get?front-type=xl&country=UA&lang=ua&goods_id={product_id}',
                f'https://xl-catalog-api.rozetka.com.ua/v4/goods/get?goods_id={product_id}',
                f'https://rozetka.com.ua/api/product-api/v4/goods/get-main?front-type=xl&goods_id={product_id}',
            ]
            
            for api_url in api_endpoints:
                try:
                    async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
                        resp = await client.get(api_url, headers={
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                            "Accept": "application/json",
                            "Accept-Language": "uk-UA,uk;q=0.9"
                        })
                        
                        print(f"Rozetka API {api_url}: status={resp.status_code}")
                        
                        if resp.status_code == 200:
                            try:
                                data = resp.json()
                                print(f"Rozetka API response keys: {list(data.keys()) if isinstance(data, dict) else 'not a dict'}")
                                
                                product = None
                                
                                if 'data' in data and data['data']:
                                    product = data['data']
                                elif isinstance(data, dict):
                                    product = data
                                
                                if product:
                                    title = product.get('title') or product.get('name', '')
                                    price = product.get('price') or product.get('sell_price', 0)
                                    
                                    if isinstance(price, dict):
                                        price = price.get('value', 0)
                                    
                                    print(f"Rozetka parsed: title={bool(title)}, price={price}")
                                    
                                    if title and price and float(price) > 0:
                                        return {
                                            "ok": True,
                                            "name": str(title)[:180],
                                            "store": "Rozetka",
                                            "price": float(price),
                                            "domain": domain,
                                            "url": url,
                                        }
                            except Exception as json_err:
                                print(f"Rozetka API JSON error: {json_err}")
                except Exception as e:
                    print(f"Rozetka API request error: {e}")
                    continue
            
            print(f"All Rozetka API endpoints failed, trying HTML with __INITIAL_STATE__")
    
    try:
        async with httpx.AsyncClient(
            timeout=25,
            follow_redirects=True,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
                "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "uk-UA,uk;q=0.9,ru;q=0.8,en;q=0.7",
            },
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except Exception as exc:
        return {"ok": False, "error": str(exc)}

    soup = BeautifulSoup(resp.text, "html.parser")

    if "rozetka.com.ua" in domain:
        for script in soup.find_all("script"):
            if script.string and "__INITIAL_STATE__" in script.string:
                try:
                    script_text = script.string
                    start = script_text.find("{")
                    end = script_text.rfind("}") + 1
                    if start >= 0 and end > start:
                        state_data = json.loads(script_text[start:end])
                        
                        if "goods" in state_data and "data" in state_data["goods"]:
                            goods_data = state_data["goods"]["data"]
                            title = goods_data.get("title", "")
                            price = goods_data.get("price", 0)
                            
                            if title and price and float(price) > 0:
                                print(f"Rozetka __INITIAL_STATE__ found: title={title[:30]}, price={price}")
                                return {
                                    "ok": True,
                                    "name": str(title)[:180],
                                    "store": "Rozetka",
                                    "price": float(price),
                                    "domain": domain,
                                    "url": url,
                                }
                except Exception as state_err:
                    print(f"Rozetka __INITIAL_STATE__ parse error: {state_err}")
                    continue

    sels      = STORE_SELECTORS.get(domain, {})
    price_s   = sels.get("price", []) + GENERIC_PRICE_SELS
    name_s    = sels.get("name",  []) + GENERIC_NAME_SELS

    name_text = ""
    for sel in name_s:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True):
            name_text = el.get_text(strip=True)[:180]
            break

    price_value = 0.0
    found_prices = []
    
    for sel in price_s:
        elements = soup.select(sel)
        for el in elements:
            raw = (
                el.get("content")
                or el.get("data-price")
                or el.get("data-value")
                or el.get_text(strip=True)
            )
            
            if not raw or len(str(raw)) > 50:
                continue
            
            raw = str(raw).replace("\xa0", "").replace(" ", "").replace("\u202f", "")
            raw = re.sub(r"[₴₽€$£грн]", "", raw, flags=re.IGNORECASE).replace(",", ".")
            
            matches = re.findall(r"\d{3,}(?:\.\d+)?", raw)
            for match in matches:
                try:
                    found_price = float(match)
                    if 100 <= found_price <= 9999999:
                        found_prices.append(found_price)
                except:
                    continue
    
    if found_prices:
        price_counts = {}
        for p in found_prices:
            price_counts[p] = price_counts.get(p, 0) + 1
        
        main_prices = [p for p in found_prices if p > 1000]
        if main_prices:
            price_value = max(main_prices)
        else:
            most_common = max(price_counts.items(), key=lambda x: (x[1], x[0]))
            price_value = most_common[0]

    if price_value == 0:
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data   = json.loads(script.string or "")
                if isinstance(data, list):
                    data = data[0]
                offers = data.get("offers", data)
                if isinstance(offers, list):
                    offers = offers[0]
                p = offers.get("price") or data.get("price")
                if p:
                    price_value = float(
                        str(p).replace(",", ".").replace(" ", "")
                        .replace("\xa0", "")
                    )
                    break
            except Exception:
                continue

    if price_value == 0:
        meta = soup.find("meta", {"itemprop": "price"})
        if meta and meta.get("content"):
            try:
                price_value = float(str(meta["content"]).replace(",", "."))
            except Exception:
                pass

    store = STORE_MAP.get(domain, domain.split(".")[0].capitalize())

    return {
        "ok":    True,
        "name":  name_text,
        "store": store,
        "price": price_value,
        "domain": domain,
        "url":   url,
    }



def market_tick() -> None:
    with SessionLocal() as session:
        products = session.scalars(select(Product)).all()
        for product in products:
            lp = latest_prices(product)
            if not lp:
                continue

            parsed_ok = False
            if getattr(product, "source_url", ""):
                try:
                    result = asyncio.run(parse_price_from_url(product.source_url))
                    if result.get("ok") and result.get("price", 0) > 0:
                        store     = result["store"]
                        new_val   = float(result["price"])
                        old_price = lp.get(store)
                        old_val   = old_price.value if old_price else 0
                        session.add(Price(
                            product_id=product.id, store=store,
                            value=new_val, url=product.source_url,
                        ))
                        write_price_log(session, product, store, old_val, new_val, "scheduler")
                        parsed_ok = True
                except Exception:
                    pass

            if not parsed_ok:
                for store, price in lp.items():
                    delta   = price.value * random.uniform(-0.015, 0.015)
                    new_val = max(1, round(price.value + delta, -1))
                    if new_val == price.value:
                        continue
                    session.add(Price(
                        product_id=product.id, store=store,
                        value=new_val, url=price.url,
                    ))
                    write_price_log(session, product, store, price.value, new_val, "scheduler")

            session.flush()
            session.refresh(product)
            evaluate_alerts(session, product)

        session.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    start_scheduler(market_tick, minutes=5)
    yield
    stop_scheduler()



app = FastAPI(title="SpectSearch", version="5.0.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")


def db() -> Generator[Session, None, None]:
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()


def _current_user(authorization: str | None, session: Session) -> User | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    tok = session.get(Token, authorization[7:])
    if not tok or tok.expires_at < datetime.utcnow():
        return None
    return session.get(User, tok.user_id)


def require_user(
    authorization: str | None = Header(default=None),
    session: Session = Depends(db),
) -> User:
    user = _current_user(authorization, session)
    if not user:
        raise HTTPException(401, "Потрібна авторизація")
    return user



@app.get("/")
def home():
    return FileResponse(BASE / "static" / "index.html")


@app.post("/api/auth/register", status_code=201)
def register(data: RegisterIn, session: Session = Depends(db)):
    email = data.email.strip().lower()
    if session.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "Email вже зареєстровано")
    user = User(
        name=data.name.strip(), email=email,
        password=password_hash(data.password),
        region=data.region or "ua",
        language=data.language or "ru",
        avatar=data.avatar or "",
    )
    session.add(user)
    session.commit()
    return _login_user(user, session)


@app.post("/api/auth/login")
def login(data: LoginIn, session: Session = Depends(db)):
    user = session.scalar(select(User).where(User.email == data.email.strip().lower()))
    if not user or user.password != password_hash(data.password):
        raise HTTPException(401, "Невірний email або пароль")
    return _login_user(user, session)


def _login_user(user: User, session: Session) -> dict:
    tok = Token(
        value=secrets.token_urlsafe(40),
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=30),
    )
    session.add(tok)
    session.commit()
    return {
        "token": tok.value,
        "user":  _user_dict(user),
    }


def _user_dict(u: User) -> dict:
    return {
        "id": u.id, "name": u.name, "email": u.email,
        "avatar": u.avatar, "region": u.region, "language": u.language,
        "created_at": u.created_at.isoformat(),
    }


@app.get("/api/auth/me")
def me(user: User = Depends(require_user)):
    return _user_dict(user)


@app.patch("/api/auth/me")
def update_me(
    data: ProfileUpdateIn,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    if data.name     is not None: user.name     = data.name.strip()
    if data.avatar   is not None: user.avatar   = (data.avatar or "").strip()
    if data.region   is not None:
        r = (data.region or "ua").strip().lower()
        user.region = r if r in {"ua", "eu", "us", "ru", "global"} else "ua"
    if data.language is not None:
        l = (data.language or "ru").strip().lower()
        user.language = l if l in {"ru", "ua"} else "ru"
    session.commit()
    return _user_dict(user)



@app.get("/api/products", response_model=list[ProductOut])
def products(
    search:        str = Query("", max_length=100),
    category:      str = Query(""),
    region:        str = Query("", max_length=32),
    session:       Session = Depends(db),
    authorization: str | None = Header(default=None),
):
    user  = _current_user(authorization, session)
    query = select(Product).order_by(Product.created_at.desc())
    if region:   query = query.where(Product.region == region)
    if search:   query = query.where(Product.name.ilike(f"%{search}%"))
    if category: query = query.where(Product.category == category)
    return [product_view(p, session, user.id if user else None)
            for p in session.scalars(query).all()]


@app.get("/api/products/{product_id}", response_model=ProductOut)
def get_product(
    product_id: int,
    session: Session = Depends(db),
    authorization: str | None = Header(default=None),
):
    item = session.get(Product, product_id)
    if not item:
        raise HTTPException(404, "Товар не знайдено")
    user = _current_user(authorization, session)
    return product_view(item, session, user.id if user else None)


@app.get("/api/products/{product_id}/history", response_model=list[HistoryPoint])
def history(
    product_id: int,
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(db),
):
    if not session.get(Product, product_id):
        raise HTTPException(404, "Товар не знайдено")
    since = datetime.utcnow() - timedelta(days=days)
    rows  = session.scalars(
        select(Price)
        .where(Price.product_id == product_id, Price.created_at >= since)
        .order_by(Price.created_at)
    ).all()
    return [{"date": r.created_at.strftime("%d.%m %H:%M"), "value": r.value, "store": r.store}
            for r in rows]


@app.post("/api/products", response_model=ProductOut, status_code=201)
async def add_product(
    data: ProductIn,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    item = Product(
        name=data.name.strip(), category=data.category or "Інше",
        image=data.image.strip(),
        region=(data.region or user.region or "ua").strip() or "ua",
        source_url=data.source_url.strip(),
    )
    prices: list[PriceIn] = list(data.prices)

    if item.source_url and not prices:
        parsed = await parse_price_from_url(item.source_url)
        if parsed.get("ok") and parsed.get("price", 0) > 0:
            prices.append(PriceIn(
                store=parsed["store"],
                value=parsed["price"],
                url=item.source_url,
            ))
            if not item.name or item.name == data.name:
                item.name = parsed.get("name") or item.name

    item.prices = [Price(store=p.store.strip(), value=p.value, url=p.url.strip()) for p in prices]
    session.add(item)
    session.commit()
    session.refresh(item)
    session.commit()
    return product_view(item, session, user.id)


@app.post("/api/products/{product_id}/prices", response_model=PriceOut, status_code=201)
def add_price(
    product_id: int,
    data: PriceIn,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    item = session.get(Product, product_id)
    if not item:
        raise HTTPException(404, "Товар не знайдено")
    lp      = latest_prices(item)
    old_val = lp[data.store.strip()].value if data.store.strip() in lp else 0
    price   = Price(product_id=product_id, store=data.store.strip(),
                    value=data.value, url=data.url.strip())
    session.add(price)
    session.flush()
    write_price_log(session, item, data.store.strip(), old_val, data.value, "manual")
    session.refresh(item)
    evaluate_alerts(session, item)
    session.commit()
    session.refresh(price)
    return price


@app.post("/api/products/{product_id}/refresh", response_model=ProductOut)
async def refresh_product(
    product_id: int,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    item = session.get(Product, product_id)
    if not item:
        raise HTTPException(404, "Товар не знайдено")

    lp         = latest_prices(item)
    parsed_any = False

    urls_to_try = []
    if getattr(item, "source_url", ""):
        urls_to_try.append(("source", item.source_url))
    for store, price in lp.items():
        if price.url:
            urls_to_try.append((store, price.url))

    for store_key, url in urls_to_try:
        try:
            result = await parse_price_from_url(url)
            if result.get("ok") and result.get("price", 0) > 0:
                store   = result["store"]
                new_val = float(result["price"])
                old     = lp.get(store)
                session.add(Price(
                    product_id=item.id, store=store,
                    value=new_val, url=url,
                ))
                write_price_log(session, item, store,
                                old.value if old else 0, new_val, "parse")
                parsed_any = True
                break
        except Exception:
            continue

    if not parsed_any:
        for store, price in lp.items():
            delta   = price.value * random.uniform(-0.025, 0.02)
            new_val = max(1, round(price.value + delta, -1))
            if new_val == price.value:
                new_val = max(1, price.value + random.choice([-100, 100]))
            session.add(Price(
                product_id=item.id, store=store, value=new_val, url=price.url,
            ))
            write_price_log(session, item, store, price.value, new_val, "manual")

    session.flush()
    session.refresh(item)
    evaluate_alerts(session, item)
    session.commit()
    session.refresh(item)
    return product_view(item, session, user.id)


@app.post("/api/products/{product_id}/favorite")
def toggle_favorite(
    product_id: int,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    if not session.get(Product, product_id):
        raise HTTPException(404, "Товар не знайдено")
    fav = session.scalar(
        select(Favorite).where(
            Favorite.user_id == user.id,
            Favorite.product_id == product_id,
        )
    )
    if fav:
        session.delete(fav)
        state = False
    else:
        session.add(Favorite(user_id=user.id, product_id=product_id))
        state = True
    session.commit()
    return {"favorite": state}


@app.delete("/api/products/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    item = session.get(Product, product_id)
    if not item:
        raise HTTPException(404, "Товар не знайдено")
    session.delete(item)
    session.commit()


@app.delete("/api/products/{product_id}/prices/{price_id}", status_code=204)
def delete_price(
    product_id: int, price_id: int,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    price = session.get(Price, price_id)
    if not price or price.product_id != product_id:
        raise HTTPException(404, "Ціну не знайдено")
    session.delete(price)
    session.commit()


@app.post("/api/parse")
async def parse_url_endpoint(
    body: dict,
    user: User = Depends(require_user),
):
    url = (body.get("url") or "").strip()
    if not url:
        raise HTTPException(400, "URL не вказано")
    return await parse_price_from_url(url)


@app.post("/api/products/{product_id}/parse", response_model=ProductOut)
async def parse_and_save(
    product_id: int,
    body: dict,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    item = session.get(Product, product_id)
    if not item:
        raise HTTPException(404, "Товар не знайдено")
    url = (body.get("url") or getattr(item, "source_url", "") or "").strip()
    if not url:
        raise HTTPException(400, "URL не вказано")
    result = await parse_price_from_url(url)
    if not result.get("ok") or not result.get("price"):
        raise HTTPException(422, "Не вдалося знайти ціну на сторінці")

    store   = result["store"]
    new_val = float(result["price"])
    lp      = latest_prices(item)
    old_val = lp[store].value if store in lp else 0

    session.add(Price(product_id=item.id, store=store, value=new_val, url=url))
    if not getattr(item, "source_url", ""):
        item.source_url = url
    write_price_log(session, item, store, old_val, new_val, "parse")
    session.flush()
    session.refresh(item)
    evaluate_alerts(session, item)
    session.commit()
    session.refresh(item)
    return product_view(item, session, user.id)



@app.get("/api/favorites", response_model=list[ProductOut])
def favorites(
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    ids = select(Favorite.product_id).where(Favorite.user_id == user.id)
    return [product_view(p, session, user.id)
            for p in session.scalars(select(Product).where(Product.id.in_(ids))).all()]



@app.post("/api/alerts", status_code=201)
def add_alert(
    data: AlertIn,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    product = session.get(Product, data.product_id)
    if not product:
        raise HTTPException(404, "Товар не знайдено")
    item = Alert(user_id=user.id, product_id=data.product_id,
                 target=data.target, email=user.email)
    cur = current_price(product)
    if cur and cur <= data.target:
        item.active = False
        item.triggered_at = datetime.utcnow()
    session.add(item)
    session.commit()
    return {"id": item.id, "active": item.active}


@app.get("/api/alerts")
def alerts(
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    rows = session.scalars(
        select(Alert)
        .where(Alert.user_id == user.id)
        .order_by(Alert.created_at.desc())
    ).all()
    result = []
    for row in rows:
        product = session.get(Product, row.product_id)
        result.append({
            "id":           row.id,
            "product_id":   row.product_id,
            "product_name": product.name if product else "Товар видалено",
            "category":     product.category if product else "",
            "current":      current_price(product) if product else 0,
            "target":       row.target,
            "active":       row.active,
            "triggered_at": row.triggered_at.isoformat() if row.triggered_at else None,
            "created_at":   row.created_at.isoformat(),
        })
    return result


@app.delete("/api/alerts/{alert_id}", status_code=204)
def delete_alert(
    alert_id: int,
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    item = session.get(Alert, alert_id)
    if not item or item.user_id != user.id:
        raise HTTPException(404, "Сповіщення не знайдено")
    session.delete(item)
    session.commit()



@app.get("/api/dashboard")
def dashboard(
    session: Session = Depends(db),
    user: User = Depends(require_user),
):
    total   = session.scalar(select(func.count(Product.id))) or 0
    tracked = session.scalar(
        select(func.count(Favorite.id)).where(Favorite.user_id == user.id)
    ) or 0
    a_count = session.scalar(
        select(func.count(Alert.id)).where(Alert.user_id == user.id, Alert.active.is_(True))
    ) or 0
    fired   = session.scalar(
        select(func.count(Alert.id)).where(Alert.user_id == user.id, Alert.active.is_(False))
    ) or 0
    updates = session.scalar(
        select(func.count(Price.id))
        .where(Price.created_at >= datetime.utcnow() - timedelta(hours=24))
    ) or 0
    return {
        "products": total, "tracked": tracked,
        "alerts": a_count, "updates": updates, "fired": fired,
    }



@app.get("/api/logs", response_model=list[PriceLogOut])
def price_logs(
    limit:      int = Query(200, ge=1, le=1000),
    product_id: int | None = Query(None),
    source:     str | None = Query(None),
    session:    Session = Depends(db),
    user:       User = Depends(require_user),
):
    query = select(PriceLog).order_by(PriceLog.created_at.desc()).limit(limit)
    if product_id is not None: query = query.where(PriceLog.product_id == product_id)
    if source:                 query = query.where(PriceLog.source == source)
    return session.scalars(query).all()



UA_SAMPLES = [
    ("iPhone 15 Pro",      "Смартфони",  "", [("Rozetka", 42999), ("Алло", 43500), ("Comfy", 44200)]),
    ("Samsung Galaxy S24", "Смартфони",  "", [("Rozetka", 28999), ("Prom.ua", 27800), ("Алло", 29500)]),
    ("Sony WH-1000XM5",    "Навушники",  "", [("Rozetka", 8999),  ("Алло", 9200),   ("Фокстрот", 9499)]),
    ("Apple AirPods Pro 2","Навушники",  "", [("Rozetka", 7499),  ("Comfy", 7800),  ("Алло", 7650)]),
    ("MacBook Air M3",     "Ноутбуки",   "", [("Rozetka", 47999), ("Алло", 49500),  ("Prom.ua", 48200)]),
    ("ASUS Zenbook 14",    "Ноутбуки",   "", [("Rozetka", 28999), ("Фокстрот", 29800), ("Алло", 30200)]),
    ("iPad Air M2",        "Планшети",   "", [("Rozetka", 24999), ("Алло", 25800),  ("Comfy", 26200)]),
    ("Samsung QLED 55\"",  "Телевізори", "", [("Rozetka", 19999), ("Фокстрот", 20500), ("Comfy", 21200)]),
]


def _add_sample(session: Session, name: str, category: str,
                image: str, stores: list, region: str = "ua") -> None:
    item = Product(name=name, category=category, image=image, region=region, source_url="")
    session.add(item)
    session.flush()
    now = datetime.utcnow()
    for day in range(30, 0, -1):
        for store, base_val in stores:
            drift = base_val * (1 + (30 - day) * random.uniform(-0.002, 0.002))
            jitter = drift * random.uniform(-0.03, 0.03)
            val = max(1, round(drift + jitter, -1))
            session.add(Price(
                product_id=item.id, store=store, value=val, url="",
                created_at=now - timedelta(days=day, hours=random.randint(0, 23)),
            ))
    for store, val in stores:
        session.add(Price(product_id=item.id, store=store, value=val, url=""))


def seed() -> None:
    with SessionLocal() as session:
        existing = set(session.scalars(select(Product.name)).all())
        for name, cat, img, stores in UA_SAMPLES:
            if name not in existing:
                _add_sample(session, name, cat, img, stores)
        if not session.scalar(select(User).where(User.email == "demo@example.com")):
            session.add(User(
                name="Demo User", email="demo@example.com",
                password=password_hash("demo123"),
                region="ua", language="ru", avatar="",
            ))
        session.commit()



if __name__ == "__main__":
    import uvicorn
    import os
    cwd = Path.cwd()
    if (cwd / "app" / "main.py").exists():
        module = "app.main:app"
    else:
        module = "main:app"
    uvicorn.run(module, host="127.0.0.1", port=5000, reload=True,
                reload_dirs=[str(ROOT)])
