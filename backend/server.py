from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import razorpay

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID', '')
razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = None
if razorpay_key_id and razorpay_key_secret:
    razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))

# Models
class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    category: str
    price: float
    cogs: float
    stock: int = 100
    image: Optional[str] = None
    flavours: Optional[List[str]] = None
    description: Optional[str] = None

class OrderItem(BaseModel):
    item_id: str
    item_name: str
    quantity: int
    price: float
    cogs: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    order_number: int
    items: List[OrderItem]
    total: float
    gross_profit: float
    order_type: str
    table_token: Optional[str] = None
    payment_type: str
    payment_id: Optional[str] = None
    status: str = "completed"
    timestamp: str

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total: float
    gross_profit: float
    order_type: str
    table_token: Optional[str] = None
    payment_type: str
    payment_id: Optional[str] = None

class InventoryUpdate(BaseModel):
    stock: int

class RazorpayOrderCreate(BaseModel):
    amount: float

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str

class AnalyticsResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    total_sales: float
    total_orders: int
    total_profit: float
    avg_order_value: float
    cash_sales: float
    digital_sales: float

# Initialize menu data
@api_router.on_event("startup")
async def initialize_menu():
    count = await db.menu_items.count_documents({})
    if count == 0:
        menu_data = [
            {"id": "pizza-margherita", "name": "Margherita", "category": "18-inch-pizza", "price": 699, "cogs": 260, "stock": 50, "tier": "classic", "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            {"id": "pizza-periperi", "name": "Peri Peri Cheese", "category": "18-inch-pizza", "price": 699, "cogs": 260, "stock": 50, "tier": "classic", "image": "https://images.unsplash.com/photo-1564271822403-0e2f9f11b16e?w=400"},
            {"id": "pizza-desi", "name": "Desi Masala Veg", "category": "18-inch-pizza", "price": 699, "cogs": 260, "stock": 50, "tier": "classic", "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            {"id": "pizza-paneer-tikka", "name": "Paneer Tikka Masala", "category": "18-inch-pizza", "price": 849, "cogs": 290, "stock": 50, "tier": "signature", "image": "https://images.unsplash.com/photo-1564271822403-0e2f9f11b16e?w=400"},
            {"id": "pizza-mexican", "name": "Mexican Masala Veg", "category": "18-inch-pizza", "price": 849, "cogs": 290, "stock": 50, "tier": "signature", "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            {"id": "pizza-bbq", "name": "Smoky BBQ Paneer", "category": "18-inch-pizza", "price": 849, "cogs": 290, "stock": 50, "tier": "signature", "image": "https://images.unsplash.com/photo-1564271822403-0e2f9f11b16e?w=400"},
            {"id": "pizza-tandoori", "name": "Tandoori Alfredo Paneer", "category": "18-inch-pizza", "price": 999, "cogs": 330, "stock": 50, "tier": "premium", "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            
            {"id": "slice-margherita", "name": "Margherita Slice", "category": "giant-slice", "price": 149, "cogs": 48, "stock": 100, "tier": "classic", "image": "https://images.unsplash.com/photo-1564271822403-0e2f9f11b16e?w=400"},
            {"id": "slice-paneer-tikka", "name": "Paneer Tikka Slice", "category": "giant-slice", "price": 179, "cogs": 48, "stock": 100, "tier": "signature", "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            {"id": "slice-tandoori", "name": "Tandoori Alfredo Slice", "category": "giant-slice", "price": 199, "cogs": 55, "stock": 100, "tier": "premium", "image": "https://images.unsplash.com/photo-1564271822403-0e2f9f11b16e?w=400"},
            
            {"id": "pocket-margherita", "name": "Margherita Pocket", "category": "pocket-pizza", "price": 149, "cogs": 45, "stock": 100, "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            {"id": "pocket-periperi", "name": "Peri Peri Cheese Pocket", "category": "pocket-pizza", "price": 159, "cogs": 48, "stock": 100, "image": "https://images.unsplash.com/photo-1564271822403-0e2f9f11b16e?w=400"},
            {"id": "pocket-paneer-tikka", "name": "Paneer Tikka Masala Pocket", "category": "pocket-pizza", "price": 179, "cogs": 58, "stock": 100, "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            {"id": "pocket-house-special", "name": "House Special Pocket", "category": "pocket-pizza", "price": 189, "cogs": 55, "stock": 100, "image": "https://images.unsplash.com/photo-1564271822403-0e2f9f11b16e?w=400"},
            {"id": "pocket-tandoori", "name": "Tandoori Alfredo Pocket", "category": "pocket-pizza", "price": 199, "cogs": 65, "stock": 100, "image": "https://images.unsplash.com/photo-1692737580547-b45bb4a02356?w=400"},
            
            {"id": "side-garlic-bread", "name": "Cheese Garlic Bread", "category": "sides", "price": 129, "cogs": 42, "stock": 100, "image": "https://images.unsplash.com/photo-1569409611632-b87901f4c74a?w=400"},
            {"id": "side-fries", "name": "Classic French Fries", "category": "sides", "price": 99, "cogs": 30, "stock": 100, "image": "https://images.unsplash.com/photo-1569409611632-b87901f4c74a?w=400"},
            {"id": "side-curly-fries", "name": "Curly Masala Fries", "category": "sides", "price": 129, "cogs": 38, "stock": 100, "image": "https://images.unsplash.com/photo-1569409611632-b87901f4c74a?w=400"},
            {"id": "side-wedges", "name": "Potato Wedges", "category": "sides", "price": 119, "cogs": 35, "stock": 100, "image": "https://images.unsplash.com/photo-1569409611632-b87901f4c74a?w=400"},
            
            {"id": "dip-tandoori", "name": "Tandoori Mayo", "category": "dips", "price": 20, "cogs": 6, "stock": 200},
            {"id": "dip-garlic", "name": "Garlic Cheese Dip", "category": "dips", "price": 25, "cogs": 8, "stock": 200},
            {"id": "dip-periperi", "name": "Peri Peri Dip", "category": "dips", "price": 20, "cogs": 5, "stock": 200},
            {"id": "dip-bbq", "name": "Smoky BBQ Dip", "category": "dips", "price": 25, "cogs": 7, "stock": 200},
            
            {"id": "drink-cola", "name": "Cola (200ml)", "category": "drinks", "price": 40, "cogs": 22, "stock": 200, "image": "https://images.pexels.com/photos/3490367/pexels-photo-3490367.jpeg?w=400"},
            {"id": "drink-orange", "name": "Orange Soda (200ml)", "category": "drinks", "price": 40, "cogs": 22, "stock": 200, "image": "https://images.pexels.com/photos/3490367/pexels-photo-3490367.jpeg?w=400"},
            {"id": "drink-lemon-tea", "name": "Iced Tea - Lemon", "category": "drinks", "price": 80, "cogs": 32, "stock": 200, "image": "https://images.pexels.com/photos/3490367/pexels-photo-3490367.jpeg?w=400"},
            {"id": "drink-peach-tea", "name": "Iced Tea - Peach", "category": "drinks", "price": 80, "cogs": 32, "stock": 200, "image": "https://images.pexels.com/photos/3490367/pexels-photo-3490367.jpeg?w=400"},
        ]
        await db.menu_items.insert_many(menu_data)

@api_router.get("/")
async def root():
    return {"message": "POCKETO POS API"}

@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    items = await db.menu_items.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.put("/menu/{item_id}")
async def update_menu_item(item_id: str, update_data: Dict[str, Any]):
    result = await db.menu_items.update_one({"id": item_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    last_order = await db.orders.find_one(sort=[("order_number", -1)])
    order_number = (last_order["order_number"] + 1) if last_order else 1
    
    order_dict = order_data.model_dump()
    order_dict["id"] = f"order-{order_number}"
    order_dict["order_number"] = order_number
    order_dict["timestamp"] = datetime.now(timezone.utc).isoformat()
    order_dict["status"] = "completed"
    
    for item in order_data.items:
        await db.menu_items.update_one(
            {"id": item.item_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    await db.orders.insert_one(order_dict)
    
    order_dict.pop("_id", None)
    return Order(**order_dict)

@api_router.get("/orders", response_model=List[Order])
async def get_orders(limit: int = 50):
    orders = await db.orders.find({}, {"_id": 0}).sort("order_number", -1).limit(limit).to_list(limit)
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.get("/inventory", response_model=List[MenuItem])
async def get_inventory():
    items = await db.menu_items.find({}, {"_id": 0}).to_list(1000)
    return items

@api_router.put("/inventory/{item_id}")
async def update_inventory(item_id: str, update: InventoryUpdate):
    result = await db.menu_items.update_one({"id": item_id}, {"$set": {"stock": update.stock}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"status": "success"}

@api_router.get("/analytics/sales")
async def get_sales_analytics(period: str = "today"):
    from datetime import timedelta
    
    now = datetime.now(timezone.utc)
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    orders = await db.orders.find({
        "timestamp": {"$gte": start_date.isoformat()}
    }, {"_id": 0}).to_list(1000)
    
    total_sales = sum(order["total"] for order in orders)
    total_profit = sum(order["gross_profit"] for order in orders)
    total_orders = len(orders)
    avg_order_value = total_sales / total_orders if total_orders > 0 else 0
    
    cash_sales = sum(order["total"] for order in orders if order["payment_type"] == "cash")
    digital_sales = sum(order["total"] for order in orders if order["payment_type"] == "digital")
    
    return {
        "total_sales": round(total_sales, 2),
        "total_orders": total_orders,
        "total_profit": round(total_profit, 2),
        "avg_order_value": round(avg_order_value, 2),
        "cash_sales": round(cash_sales, 2),
        "digital_sales": round(digital_sales, 2)
    }

@api_router.get("/analytics/best-sellers")
async def get_best_sellers():
    orders = await db.orders.find({}, {"_id": 0}).to_list(10000)
    
    item_sales = {}
    for order in orders:
        for item in order["items"]:
            if item["item_id"] not in item_sales:
                item_sales[item["item_id"]] = {
                    "item_id": item["item_id"],
                    "item_name": item["item_name"],
                    "quantity_sold": 0,
                    "revenue": 0,
                    "profit": 0
                }
            item_sales[item["item_id"]]["quantity_sold"] += item["quantity"]
            item_sales[item["item_id"]]["revenue"] += item["price"] * item["quantity"]
            item_sales[item["item_id"]]["profit"] += (item["price"] - item["cogs"]) * item["quantity"]
    
    sorted_items = sorted(item_sales.values(), key=lambda x: x["quantity_sold"], reverse=True)[:10]
    
    for item in sorted_items:
        item["revenue"] = round(item["revenue"], 2)
        item["profit"] = round(item["profit"], 2)
    
    return sorted_items

@api_router.post("/payment/create-order", response_model=RazorpayOrderResponse)
async def create_razorpay_order(order_data: RazorpayOrderCreate):
    if not razorpay_client:
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    
    amount_paise = int(order_data.amount * 100)
    
    razor_order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "payment_capture": 1
    })
    
    return {
        "order_id": razor_order["id"],
        "amount": razor_order["amount"],
        "currency": razor_order["currency"],
        "key_id": razorpay_key_id
    }

@api_router.post("/payment/verify")
async def verify_payment(payment_data: Dict[str, Any]):
    if not razorpay_client:
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    
    try:
        razorpay_client.utility.verify_payment_signature(payment_data)
        return {"status": "success", "verified": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()