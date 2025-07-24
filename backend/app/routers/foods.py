from urllib import request

from pydantic import BaseModel
from app.final_backend_approach_erandi_fyp import get_final_output
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from .. import database, models, schemas
from jose import jwt, JWTError
import os
from typing import List
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import base64


router = APIRouter(prefix="/foods", tags=["Foods"])
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

class PredictionInput(BaseModel):
    name: str
    cash_on_hand: float

def get_user_id(token: str = Header(...)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_user_town(user_id: int = Depends(get_user_id), db: Session = Depends(database.get_db)) -> str:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user.town  # assuming town is a field in user table

def convert_numpy_types(obj):
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(v) for v in obj]
    elif isinstance(obj, np.generic):
        return obj.item()
    else:
        return obj

def draw_graphs(data):
  inventory_ids = list(data['inventory'].keys())
  units = [data['inventory'][k]['units_buy'] for k in inventory_ids]
  plt.figure(figsize=(8, 6))
  plt.bar(inventory_ids, units, color='skyblue')
  plt.title("Inventory: Units Buy")
  plt.xlabel("Inventory ID")
  plt.ylabel("Units Bought")
  plt.savefig("inventory_units_buy.png")
  plt.close()
  demand_ids = list(data['demand'].keys())
  demand_values = list(data['demand'].values())
  plt.figure(figsize=(8, 6))
  plt.plot(demand_ids, demand_values, marker='o', linestyle='--', color='purple')
  plt.title("Demand Over Time Steps")
  plt.xlabel("Time Step")
  plt.ylabel("Demand")
  plt.savefig("demand_over_time.png")
  plt.close()
  product_names = list(data['optimal_price'].keys())
  prices = [float(v) for v in data['optimal_price'].values()]
  plt.figure(figsize=(10, 8))
  sns.barplot(y=product_names, x=prices, palette='magma')
  plt.title("Optimal Prices by Product")
  plt.xlabel("Price")
  plt.ylabel("Product")
  plt.tight_layout()
  plt.savefig("optimal_prices.png")
  plt.close()

def encode_image_to_base64(path: str) -> str:
    with open(path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


@router.post("/", response_model=schemas.FoodOut)
def add_food(food: schemas.FoodCreate, user_id: int = Depends(get_user_id), db: Session = Depends(database.get_db)):
    new_food = models.Food(**food.dict(), owner_id=user_id)
    db.add(new_food)
    db.commit()
    db.refresh(new_food)
    return new_food

@router.get("/", response_model=List[schemas.FoodOut])
def get_user_foods(user_id: int = Depends(get_user_id), db: Session = Depends(database.get_db)):
    return db.query(models.Food).filter(models.Food.owner_id == user_id).all()

@router.post("/prediction")
async def get_final(
    data: PredictionInput,
    town: str = Depends(get_user_town)
):
    fruit = data.name.lower()
    cash = data.cash_on_hand

    print("Fruit:", fruit)
    print("Cash on Hand:", cash)
    print("Town:", town)

    result = get_final_output(fruit, cash, town)
    draw_graphs(result)
    result = convert_numpy_types(result)

    # Encode images
    inventory_img = encode_image_to_base64("inventory_units_buy.png")
    demand_img = encode_image_to_base64("demand_over_time.png")
    prices_img = encode_image_to_base64("optimal_prices.png")

    return {
        "result": result,
        "graphs": {
            "inventory_units_buy": inventory_img,
            "demand_over_time": demand_img,
            "optimal_prices": prices_img
        }
    }